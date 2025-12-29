import Fuse, { type IFuseOptions } from 'fuse.js';
import pinyinMatch from 'pinyin-match';
import { IconIndexItem, SearchResultItem, IconCategory } from '../types/icon.js';
import iconIndexDataRaw from '../data/iconIndex.json' with { type: 'json' };

// 类型断言：将 JSON 数据转换为正确的类型
const iconIndexData: { icons: IconIndexItem[] } = {
  icons: iconIndexDataRaw.icons.map(icon => ({
    ...icon,
    category: icon.category as IconCategory,
  })) as IconIndexItem[],
};

/**
 * 搜索内部结果
 */
interface SearchResultInternal {
  icon: IconIndexItem;
  fuseScore: number;
  exactMatchBonus: number;
  finalScore: number;
}

/**
 * 图标搜索引擎
 * 使用 Fuse.js 进行模糊搜索，支持中英文混合查询和拼音首字母匹配
 */
export class IconSearcher {
  private fuse: Fuse<IconIndexItem>;
  private iconIndex: IconIndexItem[];

  constructor() {
    this.iconIndex = iconIndexData.icons;

    const fuseOptions: IFuseOptions<IconIndexItem> = {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'keywords.en', weight: 0.3 },
        { name: 'keywords.zh', weight: 0.2 },
        { name: 'keywords.pinyin', weight: 0.1 },
        { name: 'keywords.pinyinAbbr', weight: 0.1 },
      ],
      threshold: 0.4,
      distance: 100,
      minMatchCharLength: 1,
      ignoreLocation: true,
      includeScore: true,
      includeMatches: true,
    };

    this.fuse = new Fuse(this.iconIndex, fuseOptions);
  }

  /**
   * 搜索图标
   * @param query 搜索关键词
   * @param limit 返回结果数量
   * @returns 搜索结果
   */
  search(query: string, limit: number = 5): SearchResultItem[] {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const trimmedQuery = query.trim();
    const resultsLimit = Math.min(Math.max(limit, 1), 20);

    // 1. Fuse.js 搜索（多取一些候选）
    const fuseResults = this.fuse.search(trimmedQuery, {
      limit: resultsLimit * 3,
    });

    // 2. 拼音首字母增强搜索
    const abbrResults = this.searchByPinyinAbbr(trimmedQuery);

    // 3. 合并结果
    const allResults = [
      ...fuseResults.map(r =>
        this.calculateScore(r.item, r.score || 1, trimmedQuery)
      ),
      ...abbrResults.map(icon =>
        this.calculateScore(icon, 0.5, trimmedQuery)
      ),
    ];

    // 4. 去重（相同图标只保留最高分）
    const uniqueResults = this.deduplicate(allResults);

    // 5. 排序并限制数量
    return this.sortAndLimit(uniqueResults, resultsLimit);
  }

  /**
   * 拼音首字母搜索
   * 使用 pinyin-match 库进行精确首字母匹配
   */
  private searchByPinyinAbbr(query: string): IconIndexItem[] {
    const results: IconIndexItem[] = [];
    const lowerQuery = query.toLowerCase();

    // 只对可能的拼音首字母进行匹配（2-5个字母）
    if (!/^[a-z]{2,5}$/.test(lowerQuery)) {
      return results;
    }

    for (const icon of this.iconIndex) {
      // 检查拼音首字母是否匹配
      if (icon.keywords.pinyinAbbr.some(abbr =>
        abbr.toLowerCase().includes(lowerQuery)
      )) {
        results.push(icon);
      }
    }

    return results;
  }

  /**
   * 计算搜索评分
   */
  private calculateScore(
    icon: IconIndexItem,
    fuseScore: number,
    query: string
  ): SearchResultInternal {
    const queryLower = query.toLowerCase();

    // 精确匹配加分
    let exactMatchBonus = 0;

    // 名称完全匹配
    if (icon.name.toLowerCase() === queryLower) {
      exactMatchBonus = 0.5;
    }
    // 组件名完全匹配
    else if (icon.componentName.toLowerCase() === queryLower) {
      exactMatchBonus = 0.4;
    }
    // 英文关键词完全匹配
    else if (icon.keywords.en.some(kw => kw.toLowerCase() === queryLower)) {
      exactMatchBonus = 0.3;
    }
    // 中文完全匹配
    else if (icon.keywords.zh.includes(query)) {
      exactMatchBonus = 0.3;
    }
    // 拼音完全匹配
    else if (
      icon.keywords.pinyin.some(py => py.toLowerCase() === queryLower)
    ) {
      exactMatchBonus = 0.2;
    }
    // 拼音首字母完全匹配
    else if (
      icon.keywords.pinyinAbbr.some(abbr => abbr.toLowerCase() === queryLower)
    ) {
      exactMatchBonus = 0.15;
    }
    // 部分匹配加分
    else {
      // 英文关键词前缀匹配
      if (icon.keywords.en.some(kw =>
        kw.toLowerCase().startsWith(queryLower)
      )) {
        exactMatchBonus += 0.1;
      }
      // 中文前缀匹配
      if (icon.keywords.zh.some(zh => zh.startsWith(query))) {
        exactMatchBonus += 0.1;
      }
    }

    // Fuse.js 分数是距离（越小越好），转换为分数（越大越好）
    const baseScore = 1 - fuseScore;
    const finalScore = baseScore + exactMatchBonus;

    return {
      icon,
      fuseScore,
      exactMatchBonus,
      finalScore,
    };
  }

  /**
   * 去重：相同图标只保留最高分的
   */
  private deduplicate(results: SearchResultInternal[]): SearchResultInternal[] {
    const map = new Map<string, SearchResultInternal>();

    for (const result of results) {
      const existing = map.get(result.icon.name);
      if (!existing || result.finalScore > existing.finalScore) {
        map.set(result.icon.name, result);
      }
    }

    return Array.from(map.values());
  }

  /**
   * 排序并限制结果数量
   */
  private sortAndLimit(
    results: SearchResultInternal[],
    limit: number
  ): SearchResultItem[] {
    return results
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit)
      .map(r => this.formatResult(r, limit));
  }

  /**
   * 格式化搜索结果
   */
  private formatResult(
    result: SearchResultInternal,
    totalResults: number
  ): SearchResultItem {
    return {
      name: result.icon.name,
      componentName: result.icon.componentName,
      category: result.icon.category,
      score: Math.min(result.finalScore, 1),
      matchedKeywords: this.extractMatchedKeywords(result.icon),
      keywords: result.icon.keywords,
      usage: result.icon.usage,
    };
  }

  /**
   * 提取匹配的关键词（用于显示）
   */
  private extractMatchedKeywords(icon: IconIndexItem): string[] {
    const matched: string[] = [];

    // 英文关键词
    icon.keywords.en.forEach(kw => matched.push(kw));

    // 中文关键词（最多 2 个）
    icon.keywords.zh.slice(0, 2).forEach(kw => matched.push(kw));

    // 拼音首字母（最多 2 个）
    icon.keywords.pinyinAbbr.slice(0, 2).forEach(abbr => matched.push(abbr));

    return matched.slice(0, 5);
  }

  /**
   * 列出所有图标（支持分页和分类过滤）
   */
  listIcons(
    category: string = 'all',
    offset: number = 0,
    limit: number = 50
  ): { total: number; icons: IconIndexItem[] } {
    let filtered = this.iconIndex;

    // 分类过滤
    if (category !== 'all') {
      filtered = filtered.filter(icon => icon.category === category);
    }

    const total = filtered.length;

    // 分页
    const paginated = filtered.slice(offset, offset + limit);

    return {
      total,
      icons: paginated,
    };
  }

  /**
   * 获取所有分类
   */
  getCategories(): string[] {
    const categories = new Set(this.iconIndex.map(icon => icon.category));
    return Array.from(categories);
  }
}
