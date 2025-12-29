import { IconIndexItem, IconCategory } from '../types/icon.js';
import { TRANSLATION_DICT } from '../data/translationDictionary.js';
import { PinyinService } from './pinyinService.js';

/**
 * 图标索引构建器
 * 从图标名称列表构建完整的搜索索引
 */
export class IconIndexer {
  private pinyinService = new PinyinService();

  /**
   * 构建完整图标索引
   * @param iconNames 图标名称数组（如 ["delete", "edit", ...]）
   * @returns 完整的图标索引数组
   */
  buildIndex(iconNames: string[]): IconIndexItem[] {
    return iconNames.map(iconName => this.buildIconIndex(iconName));
  }

  /**
   * 构建单个图标的索引
   * @param iconName 图标名称（如 "delete"）
   * @returns 图标索引项
   */
  buildIconIndex(iconName: string): IconIndexItem {
    const baseWords = this.extractBaseWords(iconName);
    const category = this.categorizeIcon(iconName, baseWords);
    const zhWords = this.translateToChinese(baseWords);
    const pinyinVariants = this.pinyinService.generatePinyinForArray(zhWords);

    return {
      name: this.formatIconName(iconName),
      componentName: iconName,
      category,
      keywords: {
        en: [...baseWords, iconName], // 包含完整名称
        zh: zhWords,
        pinyin: pinyinVariants.full,
        pinyinAbbr: pinyinVariants.abbr,
      },
      usage: this.inferUsage(iconName, baseWords, category),
      metadata: {
        hasVariant: this.hasVariant(iconName),
        variants: [], // 需要完整列表才能查找变体
      },
    };
  }

  /**
   * 从图标名称提取基础单词
   * 将驼峰命名的单词拆分，如 "chevronDown" → ["chevron", "down"]
   */
  private extractBaseWords(iconName: string): string[] {
    // 处理连字符和驼峰命名
    const words = iconName
      .replace(/([a-z])([A-Z])/g, '$1 $2') // 驼峰转空格
      .replace(/[-_]/g, ' ')              // 连字符转空格
      .toLowerCase()
      .split(' ')
      .filter(w => w.length > 0);         // 过滤空字符串

    // 去重
    return Array.from(new Set(words));
  }

  /**
   * 翻译英文单词到中文
   */
  private translateToChinese(words: string[]): string[] {
    const zhSet = new Set<string>();

    for (const word of words) {
      const translations = TRANSLATION_DICT[word];
      if (translations) {
        translations.forEach(zh => zhSet.add(zh));
      }
    }

    return Array.from(zhSet);
  }

  /**
   * 推断图标分类
   */
  private categorizeIcon(iconName: string, words: string[]): IconCategory {
    const lower = iconName.toLowerCase();

    // 图表类
    if (words.some(w => ['chart', 'graph', 'pie', 'bar', 'line', 'area', 'dot', 'plot'].includes(w))) {
      return 'chart';
    }

    // 文件类
    if (words.some(w => ['file', 'folder', 'document', 'doc', 'attachment', 'archive', 'zip', 'excel', 'word', 'pdf', 'ppt', 'image', 'video', 'audio'].includes(w))) {
      return 'file';
    }

    // 编辑器类
    if (words.some(w => ['editor', 'rich', 'text', 'bold', 'italic', 'underline', 'font', 'align', 'format', 'indent', 'list', 'table', 'link', 'code'].includes(w))) {
      return 'editor';
    }

    // 导航类
    if (words.some(w => ['arrow', 'chevron', 'angle', 'delta', 'direction', 'left', 'right', 'up', 'down', 'back', 'forward', 'next', 'prev'].includes(w)) &&
        !words.some(w => ['delete', 'edit', 'save', 'add', 'upload', 'download'].includes(w))) {
      return 'navigation';
    }

    // 操作类
    if (words.some(w => ['add', 'delete', 'del', 'edit', 'save', 'copy', 'cut', 'paste', 'upload', 'download', 'search', 'filter', 'sort', 'refresh', 'clear', 'close', 'open', 'lock', 'unlock'].includes(w))) {
      return 'action';
    }

    return 'basic';
  }

  /**
   * 推断使用场景
   */
  private inferUsage(iconName: string, words: string[], category: IconCategory): string[] {
    const usages: string[] = [];
    const lower = iconName.toLowerCase();

    // 按钮类
    if (words.some(w => ['add', 'delete', 'del', 'edit', 'save', 'cancel', 'confirm', 'submit', 'close', 'back', 'next', 'ok', 'yes', 'no'].includes(w))) {
      usages.push('button');
    }

    // 工具栏类
    if (words.some(w => ['sort', 'filter', 'search', 'refresh', 'view', 'export', 'import', 'print', 'download', 'upload'].includes(w))) {
      usages.push('toolbar');
    }

    // 文件树类
    if (words.some(w => ['file', 'folder', 'document', 'attachment'].includes(w))) {
      usages.push('file-tree');
    }

    // 表格类
    if (words.some(w => ['table', 'grid', 'list', 'column', 'row'].includes(w))) {
      usages.push('table');
    }

    // 表单类
    if (words.some(w => ['input', 'select', 'check', 'radio', 'date', 'time', 'upload'].includes(w))) {
      usages.push('form');
    }

    // 状态类
    if (words.some(w => ['loading', 'success', 'error', 'warning', 'info', 'busy', 'pending'].includes(w))) {
      usages.push('status');
    }

    // 反馈类
    if (words.some(w => ['modal', 'dialog', 'popup', 'tooltip', 'notification'].includes(w))) {
      usages.push('feedback');
    }

    return usages.length > 0 ? usages : ['general'];
  }

  /**
   * 格式化图标名称为 PascalCase
   * 如 "delete" → "IconDelete", "chevron-down" → "IconChevronDown"
   */
  private formatIconName(iconName: string): string {
    const pascalCase = iconName
      .replace(/[-_](.)/g, (_, c) => c.toUpperCase()) // 连字符后字母大写
      .replace(/^(.)/, (_, c) => c.toUpperCase());      // 首字母大写

    return `Icon${pascalCase}`;
  }

  /**
   * 检测图标是否有变体
   * 如 "delete-o", "delete-l" 等
   */
  private hasVariant(iconName: string): boolean {
    return /[/-][ol]$/i.test(iconName) ||
           /[/-]solid$/i.test(iconName) ||
           /[/-]filled$/i.test(iconName) ||
           /[/-]outline$/i.test(iconName);
  }

  /**
   * 查找图标的变体
   * 需要完整的图标列表才能执行
   */
  findVariants(iconName: string, allIconNames: string[]): string[] {
    // 提取基础名称（去掉变体后缀）
    const baseName = iconName
      .replace(/-[ol]$/i, '')
      .replace(/-solid$/i, '')
      .replace(/-filled$/i, '')
      .replace(/-outline$/i, '')
      .replace(/-o$/i, '');

    const variants: string[] = [];

    // 查找所有相关的变体
    const variantPatterns = [
      `${baseName}-o`,
      `${baseName}-l`,
      `${baseName}-solid`,
      `${baseName}-filled`,
      `${baseName}-outline`,
      `${baseName}O`,
      `${baseName}L`,
      `${baseName}Solid`,
      `${baseName}Filled`,
      `${baseName}Outline`,
    ];

    for (const pattern of variantPatterns) {
      if (allIconNames.includes(pattern) && pattern !== iconName) {
        variants.push(this.formatIconName(pattern));
      }
    }

    return variants;
  }

  /**
   * 为所有图标填充变体信息
   */
  fillVariants(iconIndex: IconIndexItem[]): IconIndexItem[] {
    const allNames = iconIndex.map(item => item.componentName);

    return iconIndex.map(item => ({
      ...item,
      metadata: {
        ...item.metadata,
        variants: this.findVariants(item.componentName, allNames),
      },
    }));
  }
}
