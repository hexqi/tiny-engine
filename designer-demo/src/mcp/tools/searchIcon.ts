import { z } from 'zod'
import { IconSearcher } from '../services/iconSearcher.js'

const inputSchema = z.object({
  query: z.string().describe('Search keywords, supports Chinese, English, Pinyin (e.g. "删除", "delete", "sc")'),
  limit: z
    .number()
    .min(1)
    .max(20)
    .optional()
    .default(5)
    .describe('Number of results to return, default 5, maximum 20')
})

const searcher = new IconSearcher()

const getSuggestions = (query: string): string[] => {
  const suggestions: string[] = []

  // If Chinese, suggest trying English
  if (/[\u4e00-\u9fa5]/.test(query)) {
    suggestions.push('Try using English keywords (e.g. "delete", "edit", "user")')
  }

  // If English, suggest trying Chinese
  if (/^[a-zA-Z]+$/.test(query)) {
    suggestions.push('Try using Chinese keywords (e.g. "删除", "编辑", "用户")')
  }

  // If short letters, might be pinyin initials
  if (/^[a-z]{2,3}$/.test(query.toLowerCase())) {
    suggestions.push('If pinyin initials, try complete keywords (e.g. "sc" → "删除")')
  }

  suggestions.push('Try more generic keywords (e.g. "icon", "logo", "symbol")')

  return suggestions
}

export const searchIcon = {
  name: 'search_icon',
  title: '搜索图标',
  order: 1,
  description:
    'Search for matching OpenTiny Vue icons by keywords. Supports Chinese/English mixed search and pinyin initials matching. For example: input "delete", "删除", or "sc" (first letters of 删除) can all find the delete icon.',
  inputSchema: inputSchema.shape,
  callback: async (args: z.infer<typeof inputSchema>) => {
    const { query, limit = 5 } = args

    if (!query || typeof query !== 'string') {
      const res = {
        status: 'error',
        message: 'Invalid query parameter',
        data: {
          error: 'Query must be a non-empty string'
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

    try {
      const results = searcher.search(query, limit)

      if (results.length === 0) {
        const res = {
          status: 'success',
          message: 'No matching icons found',
          data: {
            query,
            total: 0,
            suggestions: getSuggestions(query)
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
      }

      const res = {
        status: 'success',
        message: `Found ${results.length} icon(s)`,
        data: {
          query,
          total: results.length,
          results: results.map(r => ({
            name: r.name,
            componentName: r.componentName,
            category: r.category,
            score: Math.round(r.score * 100) / 100,
            keywords: r.matchedKeywords,
            usage: r.usage
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
        message: 'Search failed',
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
