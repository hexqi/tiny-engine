import { z } from 'zod'
import { requestAddDataSource } from '../../js/http'
import { getMetaApi, META_SERVICE } from '@opentiny/tiny-engine-meta-register'

// Simplified column definition schema
const columnSchema = z.object({
  field: z.string().describe('The field key (e.g., "firstName", "age", "email").'),
  name: z.string().optional().describe('The field name, usually same as field (e.g., "firstName", "age", "email").'),
  title: z.string().optional().describe('The display title for the field (e.g., "First Name", "Age", "Email").'),
  type: z
    .enum(['string', 'number', 'date', 'link', 'switch', 'slider'])
    .describe('The data type. Must be one of: "string", "number", "date", "link", "switch", "slider".'),
  format: z
    .object({
      required: z.boolean().optional().default(false).describe('Whether this field is required.'),
      stringType: z.string().optional().default('').describe('String type specification.'),
      min: z.number().optional().default(0).describe('Minimum value (for number type).'),
      max: z.number().optional().default(0).describe('Maximum value (for number type).'),
      dateTime: z.boolean().optional().default(false).describe('Whether this is a datetime field.')
    })
    .optional()
    .describe('Field format configuration. Optional - uses defaults if not provided.')
})

const inputSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe(
      'The name of the datasource. Must be unique across all datasources. Example: "userDataSource", "productList"'
    ),
  type: z
    .enum(['field', 'remote'])
    .optional()
    .default('field')
    .describe(
      'The datasource type. Use "field" for static datasource (stores data locally) or "remote" for remote API datasource. Default is "field".'
    ),
  columns: z
    .array(columnSchema)
    .optional()
    .describe(
      'Array of column definitions. Each column defines a field with name, title, type, and optional format. Example: [{ name: "firstName", title: "First Name", field: "firstName", type: "string" }, { name: "age", title: "Age", field: "age", type: "number" }]. IMPORTANT: If you provide the "data" parameter with initial records, you MUST also provide this "columns" parameter to define the field structure. If not provided, a default "name" column will be used (only valid when data is empty or not provided).'
    ),
  data: z
    .array(z.record(z.string(), z.any()))
    .optional()
    .describe(
      'Array of data records. Each record is an object with field names as keys and values as data. Example: [{ "firstName": "John", "age": 30 }, { "firstName": "Jane", "age": 25 }]. IMPORTANT: If you provide this parameter, you MUST ALSO provide the "columns" parameter to define the field structure. The field names in your data records must match the "field" property in your column definitions. Optional - defaults to empty array []. Note: Each record will be auto-assigned an "_id" field.'
    )
})

export const addDataSource = {
  name: 'add_datasource',
  title: '新增数据源',
  order: 12,
  description:
    'Add a new datasource to the current TinyEngine low-code application. Use this when you need to add a new datasource to your application. IMPORTANT RULE: If you provide initial data records in the "data" parameter, you MUST also provide the "columns" parameter to define the field structure. The columns define what fields exist in your data, and their types. Example: columns define "firstName" and "age" fields, then data contains records like { firstName: "John", age: 30 }.',
  inputSchema: inputSchema.shape,
  callback: async (args: z.infer<typeof inputSchema>) => {
    const { name, type, columns, data } = args
    const appId = getMetaApi(META_SERVICE.GlobalService).getBaseInfo().id

    // Validation: if data is provided, columns must also be provided
    if (data && data.length > 0 && !columns) {
      return {
        content: [
          {
            isError: true,
            type: 'text',
            text: JSON.stringify({
              errorCode: 'MISSING_COLUMNS',
              reason: 'The "data" parameter was provided with initial records, but the "columns" parameter is missing.',
              userMessage:
                'When you provide initial data records, you must also define the column structure. Please provide the "columns" parameter to define the fields for your data records.',
              example: {
                columns: [
                  { name: 'firstName', title: 'First Name', field: 'firstName', type: 'string' },
                  { name: 'age', title: 'Age', field: 'age', type: 'number' }
                ],
                data: [
                  { firstName: 'John', age: 30 },
                  { firstName: 'Jane', age: 25 }
                ]
              }
            })
          }
        ]
      }
    }

    // Helper to normalize column with default format values
    const normalizeColumn = (column: any) => ({
      name: column.name || column.field,
      title: column.title || column.field,
      field: column.field,
      type: column.type,
      format: {
        required: column.format?.required ?? false,
        stringType: column.format?.stringType ?? '',
        min: column.format?.min ?? 0,
        max: column.format?.max ?? 0,
        dateTime: column.format?.dateTime ?? false
      }
    })

    // Use default column if not provided
    const defaultColumns = [
      {
        name: 'name',
        title: 'name',
        field: 'name',
        type: 'string',
        format: {
          required: false,
          stringType: '',
          min: 0,
          max: 0,
          dateTime: false
        }
      }
    ]

    // Normalize columns to ensure all format fields have defaults
    const normalizedColumns = columns ? columns.map(normalizeColumn) : defaultColumns

    const requestData = {
      name,
      app: appId,
      data: {
        type: type || 'field',
        columns: normalizedColumns,
        data: data || []
      }
    }

    const result = await requestAddDataSource(requestData)

    if (!result) {
      const res = {
        status: 'error',
        message: 'Failed to create datasource',
        data: {
          error: 'Failed to create datasource'
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
      message: `Datasource created successfully`,
      data: {
        id: result.id,
        name,
        type: type || 'field'
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
