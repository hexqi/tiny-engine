/**
 * 图标分类
 */
export type IconCategory =
  | 'basic'       // 基础图标
  | 'editor'      // 编辑器图标
  | 'chart'       // 图表图标
  | 'file'        // 文件图标
  | 'navigation'  // 导航图标
  | 'action';     // 操作图标

/**
 * 图标关键词
 */
export interface IconKeywords {
  /** 英文关键词 */
  en: string[];
  /** 中文关键词 */
  zh: string[];
  /** 拼音全拼 */
  pinyin: string[];
  /** 拼音首字母 */
  pinyinAbbr: string[];
}

/**
 * 图标元数据
 */
export interface IconMetadata {
  /** 是否有变体 */
  hasVariant: boolean;
  /** 变体图标列表 */
  variants: string[];
}

/**
 * 图标索引项
 */
export interface IconIndexItem {
  /** 图标名称（如 IconDelete） */
  name: string;
  /** 组件名称（如 delete） */
  componentName: string;
  /** 图标分类 */
  category: IconCategory;
  /** 关键词 */
  keywords: IconKeywords;
  /** 使用场景 */
  usage: string[];
  /** 元数据 */
  metadata: IconMetadata;
}

/**
 * 图标索引数据
 */
export interface IconIndexData {
  version: string;
  lastUpdated: string;
  total: number;
  icons: IconIndexItem[];
}

/**
 * 搜索结果项
 */
export interface SearchResultItem {
  name: string;
  componentName: string;
  category: IconCategory;
  score: number;
  matchedKeywords: string[];
  keywords: IconKeywords;
  usage: string[];
}

/**
 * 搜索响应
 */
export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResultItem[];
}

/**
 * 列出图标响应
 */
export interface ListIconsResponse {
  total: number;
  offset: number;
  limit: number;
  category: string;
  icons: Array<{
    name: string;
    componentName: string;
    category: IconCategory;
    usage: string[];
  }>;
}
