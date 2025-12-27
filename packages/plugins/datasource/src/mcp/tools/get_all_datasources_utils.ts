import { fetchDataSourceList } from '../../js/http'
import { getMetaApi, META_SERVICE } from '@opentiny/tiny-engine-meta-register'

export async function getAllDatasources() {
  const appId = getMetaApi(META_SERVICE.GlobalService).getBaseInfo().id
  const result = await fetchDataSourceList(appId)

  // The result may be an array or an object with a data property
  const datasources = Array.isArray(result) ? result : result?.data || []

  return datasources
}
