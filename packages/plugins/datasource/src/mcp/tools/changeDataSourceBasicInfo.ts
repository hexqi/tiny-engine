import { z } from 'zod'
import { requestUpdateDataSource, fetchDataSourceDetail } from '../../js/http'
import { getAllDatasources } from './get_all_datasources_utils'

const inputSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe(
      'The id of the datasource. If you don\'t know the id, use the "get_datasource_list" tool first to get the datasource list.'
    ),
  name: z
    .string()
    .min(1)
    .optional()
    .describe('The new name of the datasource. Must be unique across all datasources. Example: "myUpdatedDataSource"'),
  type: z
    .enum(['field', 'remote'])
    .optional()
    .describe(
      'The new type of the datasource. Use "field" for static datasource (stores data locally) or "remote" for remote API datasource. Changing type will preserve existing columns and data.'
    )
})

export const changeDataSourceBasicInfo = {
  name: 'change_datasource_basic_info',
  title: '修改数据源基本信息',
  order: 13,
  description:
    'Change the basic information of a datasource in the current TinyEngine low-code application. Use this when you need to update datasource name or type.',
  inputSchema: inputSchema.shape,
  callback: async (args: z.infer<typeof inputSchema>) => {
    const { id, name, type } = args

    // Validate datasource exists
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

    // Fetch current detail to preserve data structure
    const currentDetail = await fetchDataSourceDetail(id)

    // Merge changes with existing data
    const requestData = {
      name: name || currentDetail.name,
      data: {
        type: type || currentDetail.data?.type || 'field',
        columns: currentDetail.data?.columns || [],
        data: currentDetail.data?.data || []
      }
    }

    const result = await requestUpdateDataSource(id, requestData)

    if (!result) {
      const res = {
        status: 'error',
        message: 'Failed to update datasource',
        data: {
          error: 'Failed to update datasource'
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

    const res = {
      status: 'success',
      message: `Datasource updated successfully`,
      data: {
        id,
        name: requestData.name,
        type: requestData.data.type
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
}
