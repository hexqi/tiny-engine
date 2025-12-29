import { IconIndexer } from '../src/mcp/services/iconIndexer.js';
import { IconIndexData } from '../src/mcp/types/icon.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 从 OpenTiny Vue Icon 库中提取所有图标名称
 */
function extractIconNames(): string[] {
  const iconLibPath = path.resolve('node_modules/@opentiny/vue-icon/lib');

  if (!fs.existsSync(iconLibPath)) {
    console.error(`Error: Icon library not found at ${iconLibPath}`);
    console.error('Please ensure @opentiny/vue-icon is installed.');
    process.exit(1);
  }

  const files = fs.readdirSync(iconLibPath);
  // 过滤出 .js 文件并去掉扩展名
  const iconNames = files
    .filter(f => f.endsWith('.js'))
    .map(f => f.replace(/\.js$/, ''));

  return iconNames;
}

/**
 * 主函数：构建图标索引
 */
async function main() {
  console.log('🔍 Building icon index for OpenTiny Vue Icons...\n');

  // 1. 提取图标名称
  console.log('📦 Extracting icon names from library...');
  const iconNames = extractIconNames();
  console.log(`   Found ${iconNames.length} icons\n`);

  // 2. 构建索引
  console.log('🔨 Building icon index...');
  const indexer = new IconIndexer();
  let iconIndex = indexer.buildIndex(iconNames);

  // 3. 填充变体信息
  console.log('🔗 Filling variant information...');
  iconIndex = indexer.fillVariants(iconIndex);

  // 4. 构建最终数据
  const indexData: IconIndexData = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    total: iconIndex.length,
    icons: iconIndex,
  };

  // 5. 写入文件
  const outputPath = path.resolve(__dirname, '../src/mcp/data/iconIndex.json');
  fs.writeFileSync(outputPath, JSON.stringify(indexData, null, 2), 'utf-8');

  console.log('\n✅ Index built successfully!');
  console.log(`📊 Total icons: ${iconIndex.length}`);
  console.log(`📁 Output: ${outputPath}`);

  // 6. 显示统计信息
  const categoryStats = new Map<string, number>();
  for (const icon of iconIndex) {
    categoryStats.set(icon.category, (categoryStats.get(icon.category) || 0) + 1);
  }

  console.log('\n📈 Category distribution:');
  for (const [category, count] of Array.from(categoryStats.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${category}: ${count}`);
  }

  // 7. 显示一些示例
  console.log('\n📝 Sample icons:');
  iconIndex.slice(0, 5).forEach(icon => {
    console.log(`   - ${icon.name} (${icon.componentName})`);
    console.log(`     Keywords: ${icon.keywords.en.slice(0, 3).join(', ')}`);
    console.log(`     中文: ${icon.keywords.zh.slice(0, 2).join(', ') || '无'}`);
    console.log(`     拼音: ${icon.keywords.pinyin.slice(0, 2).join(', ') || '无'}`);
    console.log(`     首字母: ${icon.keywords.pinyinAbbr.join(', ') || '无'}`);
  });
}

main().catch(error => {
  console.error('❌ Error building index:', error);
  process.exit(1);
});
