import { z } from 'zod'
import { fetchTemplateDetail } from '../../js/http'

const inputSchema = z.object({
  id: z
    .string()
    .describe(
      'The id of the datasource template. if you don\'t know the id, you can use the tool "get_datasource_templates" to get the template list.'
    )
})

export const getDataSourceTemplateDetail = {
  name: 'get_datasource_template_detail',
  title: '获取数据源模板详情',
  order: 16,
  description:
    'Get a datasource template detail from the current TinyEngine low-code application. Use this when you need to get datasource template details.',
  inputSchema: inputSchema.shape,
  callback: async (args: z.infer<typeof inputSchema>) => {
    const { id } = args

    const data = await fetchTemplateDetail(id)

    if (!data) {
      return {
        content: [
          {
            isError: true,
            type: 'text',
            text: JSON.stringify({
              errorCode: 'TEMPLATE_NOT_FOUND',
              reason: `Unknown templateId: ${id}`,
              userMessage: `Template not found. Fetch the available template list.`,
              next_action: [
                {
                  type: 'tool_call',
                  name: 'get_datasource_templates',
                  args: {}
                }
              ]
            })
          }
        ]
      }
    }

    const res = {
      status: 'success',
      message: `Datasource template detail fetched successfully`,
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
