<template>
  <tiny-form
    ref="serviceFormRef"
    class="create-form"
    label-position="top"
    label-width="15%"
    :model="state.serviceForm"
    :rules="rules"
    validate-type="text"
  >
    <tiny-form-item label="请求地址" prop="uri">
      <div class="textarea-warp">
        <tiny-select
          class="selectResType"
          v-model="state.serviceForm.method"
          placeholder="请选择"
          :options="state.requestData"
        >
        </tiny-select>
        <tiny-input class="border-input" v-model="state.serviceForm.uri" resize="none" placeholder="请输入">
        </tiny-input>
      </div>
    </tiny-form-item>
    <tiny-form-item label="请求描述" prop="description">
      <tiny-input type="textarea" v-model="state.serviceForm.description" placeholder="请输入"></tiny-input>
    </tiny-form-item>
  </tiny-form>
</template>

<script>
import { reactive, watchEffect, ref } from 'vue'
import { Form, FormItem, Input, Select } from '@opentiny/vue'

const serviceFormRef = ref(null)

export const getServiceForm = () => {
  return serviceFormRef.value
}

export default {
  components: {
    TinyForm: Form,
    TinyFormItem: FormItem,
    TinyInput: Input,
    TinySelect: Select
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const state = reactive({
      serviceForm: {},
      requestData: [
        { label: 'JSONP', value: 'JSONP' },
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' }
      ]
    })

    watchEffect(() => {
      state.serviceForm = props.modelValue
      state.serviceForm.method = state.serviceForm.method || state.requestData[0].value
    })

    const rules = {
      uri: [{ required: true, message: '必填', trigger: ['change', 'blur'] }],
      method: { required: true, message: '必选', trigger: ['change', 'blur'] }
    }

    return {
      state,
      rules,
      serviceFormRef
    }
  }
}
</script>

<style lang="less" scoped>
.create-form {
  .error-tip {
    color: var(--te-datasource-error-text-color);
    margin-top: 4px;
    font-size: 12px;
  }
  :deep(.tiny-form-item__label) {
    color: var(--te-datasource-label-text-color);
  }
  .textarea-warp {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .selectResType {
      width: 100px;
      border: none;
    }
    :deep(.tiny-input-suffix) {
      width: 100px;
      .tiny-input__inner {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
    :deep(.tiny-input-group__append) {
      border: none;
      background: var(--te-datasource-respones-bg-color);
    }
    :deep(.border-input) {
      input {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: none;
      }
    }
  }
  .tiny-button-group {
    width: 100%;
  }
  :deep(.tiny-group-item) {
    display: flex;
    width: 100%;
    button {
      position: relative;
      min-width: inherit;
      padding: 0 4px;
      margin: 0;
      width: 100%;
    }
    li {
      flex: 1 1 0;
      &:not(:last-child) {
        button:before {
          content: '';
          display: inline-block;
          width: 1px;
          height: 100%;
          position: absolute;
          top: 0;
          right: 0;
          z-index: 99;
        }
      }
    }
  }

  :deep(.tiny-form-item__label) {
    height: 30px;
    line-height: 30px;
  }
}
</style>
