import { z } from 'zod'
import { requestDeleteDataSource } from '../../js/http'
import { getAllDatasources } from './get_all_datasources_utils'

const inputSchema = z.object({
  id: z
    .string()
    .describe(
      'The id of the datasource. if you don\'t know the id, you can use the tool "get_datasource_list" to get the datasource list.'
    )
})

export const delDataSource = {
  name: 'del_datasource',
  title: '删除数据源',
  order: 14,
  description:
    'Delete a datasource from the current TinyEngine low-code application. Use this when you need to delete a datasource from your application.',
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

    const result = await requestDeleteDataSource(id)

    if (!result) {
      const res = {
        status: 'error',
        message: 'Failed to delete datasource',
        data: {
          error: 'Failed to delete datasource'
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
      message: `Datasource deleted successfully`,
      data: {
        id
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
