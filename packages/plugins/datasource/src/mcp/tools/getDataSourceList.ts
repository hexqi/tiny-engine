import { z } from 'zod'
import { fetchDataSourceList } from '../../js/http'
import { getMetaApi, META_SERVICE } from '@opentiny/tiny-engine-meta-register'

const inputSchema = z.object({})

export const getDataSourceList = {
  name: 'get_datasource_list',
  title: '获取数据源列表',
  order: 10,
  description:
    'Get a datasource list from the current TinyEngine low-code application. Use this when you need to get a datasource list from your application.',
  inputSchema: inputSchema.shape,
  callback: async (_args: z.infer<typeof inputSchema>) => {
    const appId = getMetaApi(META_SERVICE.GlobalService).getBaseInfo().id
    const result = await fetchDataSourceList(appId)

    // The result may be an array or an object with a data property
    const datasources = Array.isArray(result) ? result : result?.data || []

    const data = datasources.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.data?.type,
      description: item.description
    }))

    const res = {
      status: 'success',
      message: `Datasource list fetched successfully`,
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
