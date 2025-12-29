import { pinyin as pinyinFunc } from 'pinyin';

// pinyin.STYLE_NORMAL 等常量
const STYLE_NORMAL = 0;
const STYLE_FIRST_LETTER = 4;

/**
 * 拼音转换服务
 * 将中文转换为拼音（全拼和首字母）
 */
export class PinyinService {
  /**
   * 将中文转换为拼音全拼
   * @param chinese 中文文本
   * @returns 拼音数组，如 "删除" → ["shan", "chu"]
   */
  toPinyin(chinese: string): string[] {
    try {
      const result = pinyinFunc(chinese, {
        style: STYLE_NORMAL,
        heteronym: false, // 不使用多音字
      });
      // 将每个字的拼音合并成一个单词
      const joined = result.map(p => p[0]).join('');
      return [joined, ...result.map(p => p[0])];
    } catch {
      return [];
    }
  }

  /**
   * 将中文转换为拼音首字母
   * @param chinese 中文文本
   * @returns 拼音首字母，如 "删除" → "sc"
   */
  toPinyinAbbr(chinese: string): string {
    try {
      const result = pinyinFunc(chinese, {
        style: STYLE_FIRST_LETTER,
        heteronym: false,
      });
      return result.map(p => p[0]).join('');
    } catch {
      return '';
    }
  }

  /**
   * 生成拼音的所有变体
   * @param chinese 中文文本
   * @returns 包含全拼和首字母的对象
   */
  generatePinyinVariants(chinese: string): {
    full: string[];   // 全拼，如 ["shanchu", "shan", "chu"]
    abbr: string;     // 首字母，如 "sc"
  } {
    return {
      full: this.toPinyin(chinese),
      abbr: this.toPinyinAbbr(chinese),
    };
  }

  /**
   * 批量转换中文数组为拼音
   * @param chineseArray 中文文本数组
   * @returns 拼音变体数组
   */
  generatePinyinForArray(chineseArray: string[]): {
    full: string[];
    abbr: string[];
  } {
    const fullSet = new Set<string>();
    const abbrSet = new Set<string>();

    for (const chinese of chineseArray) {
      const variants = this.generatePinyinVariants(chinese);
      variants.full.forEach(f => fullSet.add(f));
      if (variants.abbr) {
        abbrSet.add(variants.abbr);
      }
    }

    return {
      full: Array.from(fullSet),
      abbr: Array.from(abbrSet),
    };
  }
}
