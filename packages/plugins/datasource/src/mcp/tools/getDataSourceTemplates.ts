import { z } from 'zod'
import { fetchTemplates } from '../../js/http'
import { getMetaApi, META_SERVICE } from '@opentiny/tiny-engine-meta-register'

const inputSchema = z.object({})

export const getDataSourceTemplates = {
  name: 'get_datasource_templates',
  title: '获取数据源模板列表',
  order: 15,
  description:
    'Get a list of available datasource templates from the current TinyEngine low-code application. Use this when you need to get datasource templates.',
  inputSchema: inputSchema.shape,
  callback: async (_args: z.infer<typeof inputSchema>) => {
    const baseInfo = getMetaApi(META_SERVICE.GlobalService).getBaseInfo()
    const platformId = baseInfo.platform?.id || baseInfo.platform || ''

    const result = await fetchTemplates(platformId)

    // The result may be an array or an object with a data property
    const templates = Array.isArray(result) ? result : result?.data || result || []

    const data = Array.isArray(templates)
      ? templates.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description
        }))
      : []

    const res = {
      status: 'success',
      message: `Datasource templates fetched successfully`,
      data
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
}
