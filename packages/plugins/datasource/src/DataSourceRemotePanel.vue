<template>
  <div class="remote">
    <plugin-setting
      title="获取远程字段"
      class="remote-setting"
      :isSecond="true"
      @cancel="closePanel"
      @save="saveRemote"
    >
      <template #content>
        <div class="create-config">
          <div>
            <tiny-collapse v-model="state.activeName">
              <tiny-collapse-item name="excute">
                <template #title>请求信息</template>
                <data-source-remote-form
                  v-model="state.remoteData.options"
                  @sendRequest="sendRequest"
                ></data-source-remote-form>
                <data-source-remote-autoload v-model="state.remoteData.options.isSync"></data-source-remote-autoload>
                <div class="tabBox">
                  <tiny-tabs v-model="state.activeNameTabs" tab-style="button-card">
                    <tiny-tab-item class="json-tab" title="请求JSON参数" name="jsonsTab">
                      <data-source-remote-parameter
                        v-model="state.remoteData.options.params"
                      ></data-source-remote-parameter>
                    </tiny-tab-item>
                    <tiny-tab-item title="请求处理" name="responseTab">
                      <data-source-remote-adapter
                        ref="dataSourceRemoteAdapteRef"
                        v-model="state.responseData"
                        @sendRequst="sendRequest"
                      ></data-source-remote-adapter>
                    </tiny-tab-item>
                  </tiny-tabs>
                </div>
                <tiny-button type="primary" @click.stop="sendRequest" class="send"> 获取数据</tiny-button>
              </tiny-collapse-item>
              <tiny-collapse-item name="result">
                <template #title>请求结果</template>
                <data-srouce-remote-data-result
                  v-model="state.remoteData.result"
                  @check="saveRemote"
                ></data-srouce-remote-data-result>
              </tiny-collapse-item>
            </tiny-collapse>
          </div>
        </div>
      </template>
    </plugin-setting>
  </div>
</template>

<script>
import { reactive, watch, ref } from 'vue'
import { Collapse, CollapseItem, Tabs, TabItem, Button } from '@opentiny/vue'
import { PluginSetting } from '@opentiny/tiny-engine-common'
import DataSourceRemoteForm, { getServiceForm } from './DataSourceRemoteForm.vue'
import DataSourceRemoteParameter from './DataSourceRemoteParameter.vue'
import DataSourceRemoteAutoload from './DataSourceRemoteAutoload.vue'
import DataSourceRemoteAdapter from './DataSourceRemoteDataAdapter.vue'
import DataSrouceRemoteDataResult, { getResponseData } from './DataSourceRemoteDataResult.vue'
import { open as openRemoteMapping } from './DataSourceRemoteMapping.vue'
import { useDataSource, useNotify } from '@opentiny/tiny-engine-meta-register'
import { isEmptyObject } from '@opentiny/vue-renderless/common/type'
import { utils } from '@opentiny/tiny-engine-utils'
import { getRequest } from './js/datasource'

const { reactiveObj2String: obj2String, string2Obj } = utils

export const isOpen = ref(false)

export const open = () => {
  isOpen.value = true
}

export const close = () => {
  isOpen.value = false
}

export default {
  components: {
    TinyCollapse: Collapse,
    TinyButton: Button,
    TinyCollapseItem: CollapseItem,
    TinyTabs: Tabs,
    TinyTabItem: TabItem,
    PluginSetting,
    DataSourceRemoteForm,
    DataSourceRemoteParameter,
    DataSourceRemoteAutoload,
    DataSourceRemoteAdapter,
    DataSrouceRemoteDataResult
  },
  props: {
    editable: {
      type: Boolean,
      default: true
    },
    modelValue: {
      type: Object,
      default: () => ({
        options: { name: '', descriptions: '', method: '', uri: '', params: '', isSync: true },
        willFetch: {},
        dataHandler: {},
        result: {},
        shouldFetch: {},
        errorHandler: {}
      })
    }
  },
  emits: ['confirm'],
  setup(props, { emit }) {
    const dataSourceRemoteAdapteRef = ref(null)
    const { dataSourceState } = useDataSource()

    const state = reactive({
      remoteData: { options: {} },
      activeName: ['excute', 'result'],
      responseData: {
        shouldFetch: null,
        dataHandler: null,
        errorHandler: null,
        willFetch: null
      },
      activeNameTabs: 'jsonsTab'
    })

    watch(
      () => props.modelValue,
      (value) => {
        const { willFetch, dataHandler, shouldFetch, errorHandler, columns } = value
        state.remoteData.options = { ...value?.options } || {}
        state.remoteData.options.params = obj2String(value?.options?.params)
        state.responseData.willFetch = willFetch?.value || ''
        state.responseData.dataHandler = dataHandler?.value || ''
        state.responseData.shouldFetch = shouldFetch?.value || ''
        state.responseData.errorHandler = errorHandler?.value || ''
        columns?.length === 0 && (state.remoteData.result = {})
      },
      { immediate: true }
    )

    const saveRemote = () => {
      // 远程表单校验
      getServiceForm().validate((valid) => {
        if (valid) {
          state.remoteData.result = string2Obj(getResponseData())

          const save = () => {
            let params = state.remoteData.options?.params

            if (params) {
              params = string2Obj(params)
            }

            dataSourceState.remoteConfig = {
              options: { ...state.remoteData.options, params },
              ...dataSourceRemoteAdapteRef.value.getEditorValue()
            }

            state.remoteData.result = string2Obj(getResponseData())
            emit('confirm', state.remoteData.result)
            close()
          }

          save()
          if (!isEmptyObject(state.remoteData.result)) {
            openRemoteMapping()
          }
        }
      })
    }

    const sendRequest = async () => {
      try {
        // await validate() 如果验证不通过会抛出异常，而不是返回 false
        await getServiceForm().validate()
      } catch (error) {
        return
      }

      const options = { ...state.remoteData.options }

      if (options.params) {
        options.params = string2Obj(options.params)
      }

      const request = getRequest({ options, ...dataSourceRemoteAdapteRef.value.getEditorValue() })

      /**
       * 按照数据源请求面板的提示，dataSourceMap函数的相应结果的结构应该会是：
       * 对于对象数组：{ code: string, msg: string, data: {items: any[], total: number} }
       * 对于树结构：{ code: string, msg: string, data: any }
       */
      request
        .load()
        .then((res) => {
          state.remoteData.result = Array.isArray(res?.data?.items) ? res.data.items[0] : res?.data || res

          useNotify({
            type: 'success',
            title: '请求成功',
            message: '返回已填充到"请求结果"'
          })

          // "请求结果"代码编辑框
          const remoteDataEditor = document.querySelector('#remote-data-editor')

          remoteDataEditor.scrollIntoView()
        })
        .catch((error) => {
          useNotify({
            type: 'error',
            title: '请求失败',
            message: error.message || '请求失败，请确认请求地址是否正确！'
          })
        })
    }

    return {
      state,
      dataSourceRemoteAdapteRef,
      closePanel: close,
      saveRemote,
      sendRequest,
      isOpen
    }
  }
}
</script>

<style lang="less" scoped>
.remote {
  .remote-setting {
    :deep(.plugin-save) {
      display: none;
    }
  }
  :deep(.plugin-setting-content) {
    padding: 0;
  }
  .create-config {
    :deep(.title) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--te-datasource-toolbar-bg-color);
      border-top: 1px solid var(--te-datasource-tabs-border-color);
      color: var(--te-datasource-toolbar-breadcrumb-text-color);
    }
    .send {
    }
    .tip-dot {
      padding-left: 4px;
      color: var(--te-datasource-description-text-color-error);
    }

    .use-service {
      color: var(--te-datasource-toolbar-breadcrumb-text-color);
      font-size: 12px;
      margin-top: 10px;

      span {
        color: var(--te-datasource-description-text-color-error);
      }
    }

    :deep(.send-service) {
      text-align: right;
      border-top: 1px solid var(--te-datasource-tabs-border-color);
      padding: 12px 0px 0px;

      .use-service {
        text-align: left;
        padding-top: 5px;
      }

      .title {
        margin-bottom: 10px;
      }
    }

    :deep(.send-request) {
      margin: 12px;
    }

    .monaco-editor {
      height: 80px;
      margin-top: 8px;
    }
    .tabBox {
      box-sizing: border-box;
      overflow-y: scroll;
      :deep(.tiny-tabs.tiny-tabs--button-card .tiny-tabs__item) {
        border-radius: 4px;
        &:hover {
          color: var(--te-datasource-common-text-color-primary);
        }
      }
      :deep(.tiny-tabs__content) {
        margin: 12px 0;
      }
      :deep(.is-active) {
        .tiny-tabs__item__title {
          color: var(--te-datasource-common-text-color-primary);
        }
      }
    }
    :deep(.tiny-collapse) {
      .tiny-collapse-item:first-child {
        border-top: 0;
      }
      .tiny-collapse-item__header {
        .tiny-collapse-item__word-overflow {
          margin: var(--te-common-vertical-item-spacing-normal) 0px 0;
        }
      }
    }
  }
}
</style>
