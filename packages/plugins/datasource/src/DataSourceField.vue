<template>
  <div class="right-item">
    <span class="title">
      <span class="title">数据源字段</span>
      <div class="btn">
        <tiny-button @click="openNewFieldForm"><svg-icon name="add"></svg-icon>添加字段</tiny-button>
        <tiny-button @click="$emit('openRemotePanel')">{{ editable ? '修改远程配置' : '获取远程字段' }}</tiny-button>
      </div>
    </span>
    <div class="section">
      <div class="field-list">
        <div v-if="state.showNewFieldForm" class="new-field-form">
          <data-source-field-type @cancel="closeFieldType" @select="selectFieldType"></data-source-field-type>
          <data-source-field-form
            ref="fieldForm"
            :modelValue="modelValue"
            :field="state.field"
            :editable="true"
            :is-open="false"
            @cancel="closeFieldForm"
            @save="saveFieldForm"
          ></data-source-field-form>
        </div>
        <!-- 字段列表 -->
        <data-source-field-list
          ref="fieldList"
          v-model="state.fields"
          @update:modelValue="$emit('update:modelValue', state.fields)"
        ></data-source-field-list>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, watchEffect, nextTick } from 'vue'
import { Button } from '@opentiny/vue'
import DataSourceFieldList from './DataSourceFieldList.vue'
import DataSourceFieldType, { open as openFieldType } from './DataSourceFieldType.vue'
import DataSourceFieldForm from './DataSourceFieldForm.vue'

export default {
  components: {
    TinyButton: Button,
    DataSourceFieldList,
    DataSourceFieldType,
    DataSourceFieldForm
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'openPanel'],
  setup(props, { emit }) {
    const format = {
      required: false,
      stringType: '',
      min: 0,
      max: 0,
      dateTime: false
    }

    const state = reactive({
      showNewFieldForm: false,
      fields: [],
      field: {
        title: '',
        name: '',
        type: '',
        format,
        icon: ''
      }
    })

    const fieldList = ref(null)

    const fieldForm = ref(null)

    const openNewFieldForm = () => {
      state.showNewFieldForm = true
      nextTick(() => {
        openFieldType()
      })

      fieldList.value.reset()
    }

    const selectFieldType = (fieldType) => {
      fieldForm.value.open()
      state.field.type = fieldType.type
      state.field.icon = fieldType.icon
      state.field.format = format
    }

    const closeFieldType = () => {
      state.showNewFieldForm = false
    }

    const closeFieldForm = () => {
      state.showNewFieldForm = false
      fieldForm.value.close()
    }

    const saveFieldForm = (field) => {
      const { name, title } = field

      if (name && title) {
        field.type = state.field.type
        state.fields.unshift(field)
        emit('update:modelValue', state.fields)
      }

      state.showNewFieldForm = false
      fieldForm.value.close()
    }

    watchEffect(() => {
      state.fields = props.modelValue || []
      state.showNewFieldForm = false
    })

    return {
      state,
      fieldList,
      fieldForm,
      openNewFieldForm,
      selectFieldType,
      closeFieldType,
      closeFieldForm,
      saveFieldForm
    }
  }
}
</script>

<style lang="less" scoped>
.right-item {
  margin-top: 8px;
  color: var(--te-datasource-toolbar-icon-color);

  .title {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    line-height: 22px;
    font-weight: normal;
    margin-bottom: 10px;
    color: var(--te-datasource-label-text-color);

    :deep(.tiny-button--text:hover) {
      text-decoration: underline;
      font-weight: normal;
    }
    .tiny-button + .tiny-button {
      margin-left: 4px;
    }
  }

  .section {
    margin-top: 12px;
    svg {
      color: var(--te-datasource-toolbar-icon-color);
    }

    .group {
      font-size: 14px;
      line-height: 16px;
      font-weight: 600;
    }

    .field-list {
      margin-top: 8px;
      margin-bottom: 16px;
      border-radius: 3px;

      .field-row {
        display: flex;
        flex-wrap: wrap;
        padding: 8px 10px;
        -webkit-box-shadow: none;
        box-shadow: none;
        justify-content: space-between;
        align-items: center;

        &.field-row-add {
          color: var(--te-datasource-json-border-color);

          svg {
            color: var(--te-datasource-json-border-color);
          }
        }
      }

      .icon-and-text {
        display: flex;
        align-items: center;

        .field-cell-type {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
        }

        .field-cell-name {
          margin-left: 5px;

          .description {
            color: var(--te-datasource-input-icon-color);
            margin-left: 5px;
          }
        }
      }
    }
  }
}
</style>
