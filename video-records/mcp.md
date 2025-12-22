# 《TinyEngine MCP能力》视频录制脚本

## 视频基本信息
- **标题**：TinyEngine MCP 智能开发实战教程
- **时长**：15-20分钟
- **结构**：分章节，理论与实践结合

## 章节划分

### 第一章：MCP概述介绍 (2分钟)
### 第二章：MCP工具使用入门 (3分钟)
### 第三章：实操案例1 - 开发数据源MCP工具（场景1：通过meta.js封装平台功能） (5分钟)
### 第四章：实操案例2 - 开发图标查找MCP工具（场景2：开发全新的MCP工具） (5分钟)
### 第五章：实操案例3 - 集成外部图片查找MCP Server（场景3：添加外部MCP服务器） (4分钟)
### 第六章：总结与展望 (1分钟)

---

## 详细脚本

### 第一章：MCP概述介绍 (0:00-2:00)

**时间** | **画面** | **讲解词** | **操作**
---|---|---|---
0:00-0:30 | 开场画面：TinyEngine Logo + "MCP智能开发"标题 | 大家好！今天我们来聊聊TinyEngine中一个非常酷炫的功能——MCP工具。什么是MCP呢？简单说，它就像是给AI助手装上了一套"超级工具包"，让AI不仅能和你聊天，还能实际操作平台的各种功能。 | 无
0:30-1:00 | 切换到TinyEngine主界面，展示AI插件图标 | 在TinyEngine中，MCP（Model Context Protocol）让AI能够调用平台的各种能力，比如创建页面、修改组件、查询数据等等。这样就实现了真正的智能开发，而不只是简单的对话。 | 点击AI插件图标，打开AI助手界面
1:00-1:30 | 展示MCP工具管理面板 | 我们可以看到，AI助手界面有两种模式：Agent模式适合直接搭建页面，Chat模式适合对话和工具调用。点击"MCP"按钮，就能看到所有可用的工具。 | 切换到Chat模式，点击MCP按钮
1:30-2:00 | 动画示意图：MCP工作流程 | MCP的工作原理很简单：AI识别你的需求 → 选择合适的工具 → 执行操作 → 返回结果。整个过程都是自动的，你只需要用自然语言告诉AI你想要什么。 | 播放动画示意

### 第二章：MCP工具使用入门 (2:00-5:00)

**时间** | **画面** | **讲解词** | **操作**
---|---|---|---
2:00-2:30 | 展示MCP工具列表 | 现在让我们看看有哪些MCP工具可以使用。TinyEngine内置了很多实用工具，包括页面管理、组件操作、样式设置等等。 | 滚动展示工具列表
2:30-3:00 | 选中几个常用工具 | 比如这个"创建页面"工具，可以帮助我们快速生成新页面；这个"查询组件"工具，可以获取项目中的组件信息。 | 勾选几个工具作为演示
3:00-3:30 | 在Chat模式中输入查询命令 | 现在让我们试试效果。在Chat模式下，我问AI："帮我查看当前项目有哪些页面？" | 输入："帮我查看当前项目有哪些页面？"
3:30-4:00 | 展示AI自动调用工具的过程 | 看！AI自动识别了我的需求，调用了"获取页面列表"工具，并且返回了详细的结果。整个过程完全自动化。 | 展示工具调用过程和结果
4:00-4:30 | 尝试另一个工具命令 | 再试试更复杂的操作："帮我创建一个用户管理页面，包含表格和搜索功能" | 输入："帮我创建一个用户管理页面，包含表格和搜索功能"
4:30-5:00 | 展示页面创建结果 | AI调用了多个工具协同工作：创建页面、添加组件、设置属性...很快就生成了完整的页面结构。 | 展示生成的页面

### 第三章：实操案例1 - 开发数据源MCP工具 (5:00-10:00)

**时间** | **画面** | **讲解词** | **操作**
---|---|---|---
5:00-5:30 | 展示当前MCP工具列表 | 接下来我们要开发三个实用的MCP工具。首先我们创建一个数据源MCP工具，让AI能够操作项目中的数据源。 | 展示当前可用的MCP工具
5:30-6:00 | 场景1：通过meta.js封装平台功能 | 数据源MCP工具的创建方式很特别：我们通过插件的meta.js来封装平台已有的功能。这是最简单的方式。 | 打开一个现有插件的meta.js
6:00-6:30 | 添加数据源工具定义 | 在插件的meta.js中，我们添加mcp.tools配置，定义数据源相关的工具：查询数据源、获取数据结构、测试连接等。 | 展示meta.js中的mcp配置代码
6:30-7:00 | 编写工具实现逻辑 | 这些工具会调用平台现有的数据源API，比如getDataSourceList、testConnection等方法。 | 展示工具实现的代码片段
7:00-7:30 | 重启并测试工具 | 重启TinyEngine后，我们的数据源MCP工具就会自动出现在工具列表中。 | 重启应用，展示新工具出现
7:30-8:00 | 使用新开发的工具 | 现在告诉AI："帮我查看项目中有哪些数据源，并测试它们的连接状态" | 在AI中输入测试命令
8:00-8:30 | 展示工具执行效果 | AI成功调用了我们刚开发的数据源工具，返回了数据源列表和连接状态。 | 展示AI调用工具的过程和结果
8:30-9:00 | 扩展更多数据源功能 | 我们还可以添加更多功能，比如：创建数据源、编辑数据源、生成CRUD页面等。 | 展示扩展的工具定义
9:00-10:00 | 总结场景1的实现方式 | 通过meta.js封装平台功能是最简单的MCP扩展方式，适合将现有功能快速暴露给AI使用。 | 总结封装方式的优势

### 第四章：实操案例2 - 开发图标查找MCP工具 (10:00-14:00)

**时间** | **画面** | **讲解词** | **操作**
---|---|---|---
10:00-10:30 | 场景2：开发全新的MCP工具 | 接下来我们要开发一个全新的MCP工具：TinyVue图标查找工具。这种方式需要我们编写完整的工具逻辑。 | 创建新的工具文件
10:30-11:00 | 创建工具文件结构 | 首先创建tools目录，然后在其中创建icon-finder.js文件。这是我们的图标查找工具实现。 | 展示文件结构创建过程
11:00-11:30 | 定义工具接口 | 工具需要定义name、description、inputSchema和callback。输入参数可以是图标名称或关键词。 | 展示工具定义代码
11:30-12:00 | 实现图标查找逻辑 | 我们需要调用TinyVue的图标库API，根据关键词搜索匹配的图标。可以支持模糊匹配和分类搜索。 | 展示搜索逻辑实现代码
12:00-12:30 | 注册工具到系统 | 在插件的入口文件中导入并注册这个工具。这样系统就能识别并加载它。 | 展示工具注册代码
12:30-13:00 | 测试图标查找工具 | 现在告诉AI："帮我查找用户相关的图标，比如user、avatar、login等" | 在AI中测试图标搜索
13:00-13:30 | 展示搜索结果 | AI成功调用了我们开发的图标查找工具，返回了匹配的图标列表和预览。 | 展示图标搜索结果
13:30-14:00 | 扩展工具功能 | 我们还可以添加更多功能：图标分类浏览、热门图标推荐、图标详情查看等。 | 展示扩展功能设计
14:00-14:30 | 实际应用演示 | 让AI使用图标工具来美化一个表单页面，自动为每个字段添加合适的图标。 | 演示图标工具的实际应用
14:30-15:00 | 总结场景2的实现方式 | 开发全新的MCP工具虽然需要写更多代码，但能提供更灵活和强大的功能。 | 总结开发方式的优势

### 第五章：实操案例3 - 集成外部图片查找MCP Server (15:00-19:00)

**时间** | **画面** | **讲解词** | **操作**
---|---|---|---
15:00-15:30 | 场景3：集成外部MCP服务器 | 第三种方式是集成外部的MCP服务器。我们以图片查找工具为例，演示如何连接第三方MCP服务。 | 展示MCP架构图
15:30-16:00 | 创建外部MCP服务器 | 首先创建一个独立的MCP服务器项目，用于提供图片查找功能。这个服务器可以运行在任何地方。 | 创建新项目
16:00-16:30 | 实现图片查找服务 | 服务器实现了图片搜索功能，可以连接Unsplash、Pexels等免费图库API。 | 展示服务器代码结构
16:30-17:00 | 配置MCP客户端 | 在TinyEngine中配置连接外部服务器。我们需要在MCP服务配置中添加服务器信息。 | 展示配置代码
17:00-17:30 | 启动并连接服务器 | 启动外部MCP服务器，然后在TinyEngine中连接它。系统会自动获取服务器提供的工具列表。 | 展示连接过程
17:30-18:00 | 测试图片查找功能 | 现在告诉AI："帮我搜索一些业务相关的图片，比如团队合作、办公场景等" | 在AI中测试图片搜索
18:00-18:30 | 展示图片搜索结果 | AI调用了外部图片查找服务，返回了高质量的图片列表，包含预览和下载链接。 | 展示搜索结果
18:30-19:00 | 实际应用演示 | 让AI使用图片工具来丰富一个页面，添加合适的背景图和插图。 | 演示图片工具的实际应用
19:00-19:30 | 总结场景3的优势 | 集成外部MCP服务器最大的优势是可以利用现有的专业服务，而且服务独立部署，便于维护。 | 总结外部集成优势

### 第六章：总结与展望 (19:00-20:00)

**时间** | **画面** | **讲解词** | **操作**
---|---|---|---
19:00-19:15 | 回顾三种MCP开发方式 | 今天我们学习了MCP的三种扩展方式：通过meta.js封装现有功能、开发全新的MCP工具、集成外部MCP服务器。 | 展示三种方式的对比图
19:15-19:30 | 总结使用建议 | 选择哪种方式？简单功能用meta.js封装，复杂功能开发新工具，专业服务集成外部服务器。 | 展示选择指南
19:30-19:45 | 展示MCP生态 | MCP让TinyEngine变成了一个真正智能化的开发平台。AI不再只是聊天工具，而是能实际工作的开发伙伴。 | 展示MCP生态示意图
19:45-20:00 | 结束画面 | 希望这个教程能帮助大家更好地理解和使用MCP功能。有问题欢迎在评论区讨论，我们下期再见！ | 显示感谢观看画面

---

## 代码示例（用于录制参考）

### 1. 数据源MCP工具配置（meta.js方式）

```javascript
// plugins/datasource/meta.js
export default {
  mcp: {
    tools: [
      {
        name: 'listDataSources',
        title: '查询数据源列表',
        description: '获取项目中所有数据源的列表',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: '项目ID'
            }
          }
        },
        callback: async (args) => {
          // 调用现有的数据源API
          return await dataSourceService.getList(args.projectId);
        }
      },
      {
        name: 'testDataSource',
        title: '测试数据源连接',
        description: '测试数据源连接是否正常',
        inputSchema: {
          type: 'object',
          properties: {
            dataSourceId: {
              type: 'string',
              description: '数据源ID'
            }
          }
        },
        callback: async (args) => {
          return await dataSourceService.testConnection(args.dataSourceId);
        }
      }
    ]
  }
}
```

### 2. 图标查找MCP工具（开发新工具方式）

```javascript
// plugins/icon-tools/tools/icon-finder.js
import { TinyVueIconAPI } from '@opentiny/vue-icon'

export const iconFinderTool = {
  name: 'searchIcons',
  title: '搜索TinyVue图标',
  description: '根据关键词搜索TinyVue图标库中的图标',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description: '搜索关键词'
      },
      category: {
        type: 'string',
        description: '图标分类（可选）',
        enum: ['user', 'business', 'communication', 'media', etc.]
      }
    },
    required: ['keyword']
  },
  callback: async (args) => {
    const icons = await TinyVueIconAPI.search({
      keyword: args.keyword,
      category: args.category,
      limit: 20
    });

    return {
      success: true,
      data: icons.map(icon => ({
        name: icon.name,
        category: icon.category,
        preview: icon.svg,
        usage: `<icon-${icon.name} />`
      }))
    };
  }
};
```

### 3. 外部图片查找MCP服务器

```javascript
// external-mcp-server/image-search-server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'image-search-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'searchImages',
      description: '搜索高质量图片资源',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '搜索关键词' },
          source: {
            type: 'string',
            enum: ['unsplash', 'pexels'],
            description: '图片来源'
          }
        },
        required: ['query']
      }
    }
  ]
}));

server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'searchImages') {
    const { query, source = 'unsplash' } = request.params.arguments;

    // 调用Unsplash或Pexels API
    const images = await searchImageAPI(query, source);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          data: images.map(img => ({
            url: img.url,
            preview: img.preview,
            description: img.description,
            photographer: img.photographer
          }))
        })
      }]
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function searchImageAPI(query, source) {
  // 实际的API调用逻辑
  // ...
}

// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 4. TinyEngine中配置外部MCP服务器

```javascript
// 在TinyEngine的MCP服务配置中
const mcpConfig = {
  servers: [
    {
      id: 'image-search-server',
      name: '图片搜索服务',
      command: 'node',
      args: ['./external-mcp-server/image-search-server.js'],
      env: {
        UNSPLASH_ACCESS_KEY: 'your-api-key',
        PEXELS_API_KEY: 'your-api-key'
      }
    }
  ]
};
```

## 录制建议

### 技术准备
1. **环境准备**：确保TinyEngine环境稳定，AI插件配置正确
2. **代码准备**：预写好三个案例的示例代码
3. **外部服务**：准备好图片查找的API密钥
4. **测试数据**：准备几个测试用的数据源和图标

### 录制技巧
1. **节奏控制**：每个操作留出2-3秒的展示时间
2. **重点突出**：关键操作时使用鼠标高亮或放大效果
3. **语音清晰**：讲解时语速适中，重点词汇加重语气
4. **画面流畅**：操作流畅，避免长时间等待

### 后期制作
1. **字幕添加**：为关键操作步骤添加字幕说明
2. **重点标记**：在关键步骤添加箭头或圆圈提示
3. **背景音乐**：选择轻快的背景音乐，不影响讲解
4. **片头片尾**：添加统一的片头片尾动画

---

## 补充资料

### 相关文档链接
- [AI插件使用指南](docs/advanced-features/new-ai-plugin-usage.md)
- [MCP开发文档](待补充)
- [示例代码仓库](待补充)

### 常见问题
1. **MCP工具无法使用？** - 检查AI插件版本和配置
2. **自定义工具不生效？** - 确认注册配置是否正确
3. **工具调用失败？** - 查看浏览器控制台错误信息

### 进阶学习
- MCP协议深入理解
- 复杂工具开发最佳实践
- 性能优化技巧