import { z } from 'zod'
import { IconSearcher } from '../services/iconSearcher.js'

const inputSchema = z.object({
  names: z.array(z.string()).describe('List of icon names to check, e.g. ["IconDelete", "edit", "user-icon"]'),
  include_recommendations: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to return recommendations for non-existent icons (default true)'),
  max_recommendations: z
    .number()
    .min(1)
    .max(10)
    .optional()
    .default(3)
    .describe('Maximum number of recommendations per non-existent icon (default 3)')
})

const searcher = new IconSearcher()

// Pre-load all existing icon names for fast lookup
const existingIconNames = new Set<string>()
const loadExistingIcons = (): void => {
  const listResult = searcher.listIcons('all', 0, 1000)
  listResult.icons.forEach(icon => {
    // Store multiple formats of names for matching
    existingIconNames.add(icon.name.toLowerCase()) // IconDelete
    existingIconNames.add(icon.componentName.toLowerCase()) // delete
    existingIconNames.add(icon.name.replace(/^Icon/, '').toLowerCase()) // delete (from IconDelete)
    // Store camelCase and kebab-case
    existingIconNames.add(icon.componentName.replace(/-/g, '').toLowerCase()) // delete
  })
}
loadExistingIcons()

// Normalize icon name
const normalizeIconName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/^icon/, '') // Remove Icon prefix
    .replace(/[-_\s]/g, '') // Remove hyphens, underscores, spaces
    .trim()
}

// Find exact matching icon
const findExactMatch = (
  normalizedName: string
): { name: string; componentName: string; category: string } | null => {
  const listResult = searcher.listIcons('all', 0, 1000)

  for (const icon of listResult.icons) {
    // Check multiple matching methods
    const checks = [
      icon.name.toLowerCase() === normalizedName,
      icon.name.toLowerCase() === `icon${normalizedName}`,
      icon.componentName.toLowerCase() === normalizedName,
      icon.componentName.toLowerCase().replace(/-/g, '') === normalizedName,
      icon.name.replace(/^Icon/, '').toLowerCase().replace(/-/g, '') === normalizedName
    ]

    if (checks.some(c => c)) {
      return {
        name: icon.name,
        componentName: icon.componentName,
        category: icon.category
      }
    }
  }

  return null
}

// Generate recommendations for non-existent icons
const generateRecommendations = (
  iconName: string,
  maxCount: number
): Array<{
  name: string
  componentName: string
  category: string
  score: number
}> => {
  // Use search engine to find similar icons
  const searchResults = searcher.search(iconName, maxCount)

  return searchResults.map(r => ({
    name: r.name,
    componentName: r.componentName,
    category: r.category,
    score: r.score
  }))
}

export const checkIcons = {
  name: 'check_icons',
  title: '批量检查图标',
  order: 2,
  description:
    'Batch check if icon names exist. For non-existent icons, return recommended similar icons. Supports multiple input formats: IconDelete, delete, icon-delete, etc.',
  inputSchema: inputSchema.shape,
  callback: async (args: z.infer<typeof inputSchema>) => {
    const { names, include_recommendations = true, max_recommendations = 3 } = args

    if (!Array.isArray(names) || names.length === 0) {
      const res = {
        status: 'error',
        message: 'Invalid names parameter',
        data: {
          error: 'Names must be a non-empty array'
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
      const results: Array<{
        name: string
        exists: boolean
        matchedIcon?: {
          name: string
          componentName: string
          category: string
        }
        recommendations?: Array<{
          name: string
          componentName: string
          category: string
          score: number
        }>
      }> = []
      const maxRecs = Math.min(Math.max(max_recommendations, 1), 10)

      for (const iconName of names) {
        const normalized = normalizeIconName(iconName)
        const exactMatch = findExactMatch(normalized)

        if (exactMatch) {
          // Found exact match
          results.push({
            name: iconName,
            exists: true,
            matchedIcon: exactMatch
          })
        } else {
          // No exact match found
          const result: {
            name: string
            exists: boolean
            recommendations?: Array<{
              name: string
              componentName: string
              category: string
              score: number
            }>
          } = {
            name: iconName,
            exists: false
          }

          // Generate recommendations
          if (include_recommendations) {
            const recommendations = generateRecommendations(iconName, maxRecs)
            result.recommendations = recommendations
          }

          results.push(result)
        }
      }

      // Statistics
      const stats = {
        total: results.length,
        exists: results.filter(r => r.exists).length,
        notExists: results.filter(r => !r.exists).length
      }

      const res = {
        status: 'success',
        message: `Checked ${stats.total} icon(s), ${stats.exists} exist, ${stats.notExists} not found`,
        data: {
          stats,
          results
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
        message: 'Check icons failed',
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
