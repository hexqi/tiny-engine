<template>
  <div class="meta-slot-container">
    <div class="label">使用插槽</div>
    <tiny-form ref="slotRef" class="slot-form" :model="slotList" label-width="0" inline>
      <div v-for="(slot, index) in slotList" :key="slot.name" class="use-slot">
        <div class="use-slot-item-name">
          {{ slot.name }}
          <tiny-tooltip effect="light" :content="state.currentComponent?.content" placement="bottom" width="260">
            <span class="item-icon">
              <component :is="state.currentComponent?.icon"></component>
            </span>
          </tiny-tooltip>
        </div>
        <div class="use-slot-item-content">
          <div class="use-slot-switch-wrap">
            <div :class="['e__switch', { 'e_is-checked': slot.bind }]">
              <span class="e__switch-core" @click="updateSlot(index, slot)"></span>
            </div>
          </div>
          <tiny-form-item
            :prop="paramsPropPath(index)"
            :rules="[{ validator: paramsStringValidator, trigger: 'blur' }]"
            class="slot-name-form-item"
          >
            <tiny-input
              v-model="slot.params"
              class="use-slot-params"
              @change="validParams(slot, paramsPropPath(index))"
            ></tiny-input>
          </tiny-form-item>
        </div>
      </div>
    </tiny-form>
  </div>
</template>

<script>
import { ref, inject, watchEffect, reactive } from 'vue'
import { Input, Tooltip, Form, FormItem } from '@opentiny/vue'
import { useProperties, useCanvas, useModal } from '@opentiny/tiny-engine-meta-register'
import SvgICons from '@opentiny/vue-icon'
import { verifyJsVarName } from '@opentiny/tiny-engine-common/js/verification'

export default {
  components: {
    TinyInput: Input,
    TinyForm: Form,
    TinyFormItem: FormItem,
    TinyTooltip: Tooltip
  },
  props: {
    modelValue: {
      type: Object
    },
    slots: {
      type: Array,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const path = inject('path', '')
    const slotList = ref(
      props.slots.map((name) => {
        const slotInfo = props.modelValue?.[name]

        return {
          bind: Boolean(slotInfo),
          name,
          params: slotInfo?.params?.join(',') || ''
        }
      })
    )
    const componentsMap = {
      TinyGrid: {
        content:
          '暴露给插槽使用的变量，为解构的参数，可以使用多个用逗号分隔，如：row(行数据)，column(列数据)，$table(内部表格实例)，seq(序号)，cell(单元格)，columnIndex(列索引),rowIndex(行索引)',
        icon: SvgICons['IconHelpCircle']()
      }
    }

    const state = reactive({
      currentComponent: {}
    })

    const slotRef = ref(null)

    const paramsPropPath = (index) => `${index}.params`

    const paramsStringValidator = (rule, value, callback) => {
      if (value && value.split(',').some((param) => !verifyJsVarName(param))) {
        callback(new Error('仅支持JavaScript中有效的变量名'))
      } else {
        callback()
      }
    }

    const updateSlot = (idx, { bind, name, params = '' }, isToggleSlot = true) => {
      const slotInfo = {
        [name]: {
          type: 'JSSlot',
          value: [
            {
              componentName: 'div'
            }
          ]
        }
      }

      const slotData = { ...slotInfo, ...(props.modelValue || {}) }
      const { setProp } = useProperties()
      const { setNode, operateNode } = useCanvas()

      if (params.length) {
        slotData[name].params = params.split(',')
      } else {
        delete slotData[name].params
      }

      if (bind && isToggleSlot) {
        useModal().confirm({
          title: '提示',
          message: '关闭后插槽内的内容将被清空，是否继续？',
          exec: () => {
            slotList.value[idx].bind = false
            operateNode({ type: 'delete', id: slotData[name].value[0].id })

            delete slotData[name]
            emit('update:modelValue', slotData)
            const [propsName] = path.split('.')

            const schema = useProperties().getSchema()

            setProp(propsName, schema.props[propsName])
          }
        })
      } else {
        slotList.value[idx].bind = true
      }

      emit('update:modelValue', slotData)

      // 更新当前选中组件的根属性，不根新在jsslot中的数据非响应式
      const [propsName] = path.split('.')
      const schema = useProperties().getSchema()

      for (const data of Object.values(slotData)) {
        if (data.value?.[0] && !data.value[0]?.id) {
          // 手动设置节点
          setNode(data.value[0], schema)
        }
      }

      setProp(propsName, schema.props[propsName])
    }

    const setParams = (slot) => {
      if (slot.bind) {
        const slotData = props.modelValue
        const { params, name } = slot

        if (params.length) {
          slotData[name].params = params.split(',')
        } else {
          delete slotData[name].params
        }
      }
    }

    const validParams = (slot, paramsPath) => {
      slotRef.value.validateField([paramsPath], (error) => {
        if (!error) {
          setParams(slot)
        }
      })
    }

    watchEffect(() => {
      const componentName = useCanvas().getCurrentSchema()?.componentName
      state.currentComponent = componentsMap[componentName]
    })

    return {
      updateSlot,
      slotList,
      paramsPropPath,
      slotRef,
      paramsStringValidator,
      validParams,
      setParams,
      state,
      componentsMap
    }
  }
}
</script>

<style lang="less" scoped>
.meta-slot-container {
  text-align: left;
  color: var(--te-configurator-common-text-color-secondary);
}

.slot-form {
  margin-top: 8px;
}

.use-slot {
  display: flex;
  justify-content: center;
  flex-direction: column;
  row-gap: 8px;

  .use-slot-item-content {
    display: flex;
    justify-content: space-between;
  }

  .use-slot-switch-wrap {
    display: flex;
    align-items: center;
  }

  &-item-name {
    width: 100px;
  }

  &-switch {
    width: 60px;
  }

  &-params {
    margin-left: 5px;
  }

  & + .use-slot {
    margin-top: 16px;
  }

  .slot-name-form-item {
    margin-bottom: 0;
    margin-right: 6px;
  }

  .item-icon {
    margin: 0 3px 0 6px;
  }
}

.e__switch {
  display: inline-flex;
  align-items: center;
  position: relative;
  font-size: 14px;
  line-height: 20px;
  width: 40px;
  height: 20px;
  vertical-align: middle;
  cursor: pointer;
}

.e__switch-core {
  margin: 0;
  position: relative;
  width: 60px;
  height: 20px;
  border: none;
  outline: 0;
  border-radius: 10px;
  box-sizing: border-box;
  background-color: var(--te-configurator-common-switch-bg-color);
  transition: border-color 0.3s, background-color 0.3s;
  vertical-align: middle;
}

.e__switch-core::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 1px;
  border-radius: 100%;
  transition: all 0.3s;
  width: 16px;
  height: 16px;
  background-color: var(--te-configurator-common-bg-color);
}

.e__switch.e_is-checked .e__switch-core {
  background-color: var(--te-configurator-common-switch-bg-color-checked);
}

.e__switch.e_is-checked .e__switch-core::after {
  left: 100%;
  margin-left: -17px;
}
</style>
