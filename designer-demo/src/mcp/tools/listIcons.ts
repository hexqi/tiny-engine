import { z } from 'zod'
import { IconSearcher } from '../services/iconSearcher.js'

const inputSchema = z.object({
  category: z
    .enum(['basic', 'editor', 'chart', 'file', 'navigation', 'action', 'all'])
    .optional()
    .default('all')
    .describe('Icon category filter'),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(50)
    .describe('Number of results to return, default 50, maximum 100'),
  offset: z
    .number()
    .min(0)
    .optional()
    .default(0)
    .describe('Pagination offset, default 0')
})

const searcher = new IconSearcher()

export const listIcons = {
  name: 'list_icons',
  title: '列出图标',
  order: 3,
  description:
    'Get list of all available OpenTiny Vue icons with pagination and category filtering support.',
  inputSchema: inputSchema.shape,
  callback: async (args: z.infer<typeof inputSchema>) => {
    const { category = 'all', limit = 50, offset = 0 } = args

    try {
      const { total, icons } = searcher.listIcons(
        category,
        Math.max(0, offset),
        Math.min(Math.max(1, limit), 100)
      )

      const res = {
        status: 'success',
        message: `Found ${icons.length} icon(s) in category "${category}"`,
        data: {
          total,
          offset,
          limit,
          category,
          hasMore: offset + limit < total,
          icons: icons.map(icon => ({
            name: icon.name,
            componentName: icon.componentName,
            category: icon.category,
            keywords: {
              en: icon.keywords.en.slice(0, 3),
              zh: icon.keywords.zh.slice(0, 2)
            },
            usage: icon.usage
          }))
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res)
          }
        ]
      }
    } catch (error) {
      const res = {
        status: 'error',
        message: 'List icons failed',
        data: {
          error: error instanceof Error ? error.message : String(error)
        }
      }

      return {
        content: [
          {
            isError: true,
            type: 'text',
            text: JSON.stringify(res)
          }
        ]
      }
    }
  }
}
