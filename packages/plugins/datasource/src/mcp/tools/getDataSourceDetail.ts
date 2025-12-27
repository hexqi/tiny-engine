import { z } from 'zod'
import { fetchDataSourceDetail } from '../../js/http'
import { getAllDatasources } from './get_all_datasources_utils'

const inputSchema = z.object({
  id: z
    .string()
    .describe(
      'The id of the datasource. if you don\'t know the id, you can use the tool "get_datasource_list" to get the datasource list.'
    )
})

export const getDataSourceDetail = {
  name: 'get_datasource_detail',
  title: '获取数据源详情',
  order: 11,
  description:
    'Get a datasource detail from the current TinyEngine low-code application. Use this when you need to get datasource details.',
  inputSchema: inputSchema.shape,
  callback: async (args: z.infer<typeof inputSchema>) => {
    const { id } = args
    const allDatasources = await getAllDatasources()
    const datasource = allDatasources.find((ds: any) => ds.id === id)

    if (!datasource) {
      return {
        content: [
          {
            isError: true,
            type: 'text',
            text: JSON.stringify({
              errorCode: 'DATASOURCE_NOT_FOUND',
              reason: `Unknown datasourceId: ${id}`,
              userMessage: `Datasource not found. Fetch the available datasource list.`,
              next_action: [
                {
                  type: 'tool_call',
                  name: 'get_datasource_list',
                  args: {}
                }
              ]
            })
          }
        ]
      }
    }

    const data = await fetchDataSourceDetail(id)

    const res = {
      status: 'success',
      message: `Datasource detail fetched successfully`,
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
