<template>
  <div>
    <div v-for="(slot, index) in slotList" :key="slot.name" class="slot-list">
      <div class="slot-name">
        <span>
          {{ slot.label }}
        </span>
        <tiny-popover v-if="slot.description" placement="top" trigger="hover" :content="slot.description">
          <template #reference>
            <div>
              <icon-help-circle class="help-icon"></icon-help-circle>
            </div>
          </template>
        </tiny-popover>
      </div>
      <div class="slot-switch">
        <div :class="['e__switch', { 'e_is-checked': slot.bind }]">
          <span class="e__switch-core" @click="toggleSlot(slot, index)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watchEffect, nextTick } from 'vue'
import { Popover } from '@opentiny/vue'
import { useProperties, useModal, useCanvas, useMaterial } from '@opentiny/tiny-engine-meta-register'
import { iconHelpCircle } from '@opentiny/vue-icon'

export default {
  components: {
    TinyPopover: Popover,
    IconHelpCircle: iconHelpCircle()
  },
  props: {
    slots: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const slotList = ref([])

    watchEffect(() => {
      const slots = {}
      let children = useProperties().getSchema()?.children
      Array.isArray(children) &&
        children.forEach((child) => {
          if (child.componentName === 'Template' && child.props?.slot) {
            const slotName = child.props.slot?.name || child.props.slot
            slots[slotName] = child.props.slot
          }
        })
      slotList.value = Object.keys(props.slots).map((name) => {
        const { label, description, params } = props.slots[name] || {}
        return {
          label: label?.['zh_CN'] || name,
          description: description?.['zh_CN'],
          name,
          params,
          bind: Boolean(slots[name])
        }
      })
    })
    const toggleSlot = ({ name = 'default', params, bind }, i) => {
      const schema = useProperties().getSchema()
      const { operateNode } = useCanvas()

      if (!bind) {
        slotList.value[i].bind = !slotList.value[i].bind

        const template = {
          componentName: 'Template',
          props: {
            slot: {
              name
            }
          },
          children: []
        }

        // 如果有作用域插槽参数
        if (params?.length) {
          template.props.slot.params = params
        }

        operateNode({
          type: 'updateAttributes',
          id: schema.id,
          value: { children: [...(schema.children || []), template] }
        })
      } else {
        useModal().confirm({
          title: '提示',
          message: '关闭后插槽内的内容将被清空，是否继续？',
          exec: () => {
            slotList.value[i].bind = !slotList.value[i].bind

            const newChildren = schema.children.filter(
              ({ componentName, props }) =>
                componentName !== 'Template' || (props?.slot !== name && props?.slot?.name !== name)
            )

            operateNode({ type: 'updateAttributes', id: schema.id, value: { children: [...newChildren] } })
          },
          cancel: () => {}
        })
      }
      const config = useMaterial().getMaterial(schema.componentName)
      const isPopper = config?.configure?.isPopper

      if (isPopper) {
        const showProp = typeof isPopper === 'string' ? isPopper : 'modelValue'

        schema.props[showProp] = false
        nextTick(() => {
          schema.props[showProp] = true
        })
      }

      useCanvas().canvasApi.value.updateRect()
    }

    return {
      toggleSlot,
      slotList
    }
  }
}
</script>

<style lang="less" scoped>
.slot-list {
  display: flex;
  justify-content: center;
  align-items: center;
  &:not(:last-child) {
    margin-bottom: var(--te-common-vertical-item-spacing-normal);
  }
  .slot-name {
    width: 30%;
    color: var(--te-configurator-common-text-color-primary);
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    margin-right: 5px;
  }
  .slot-switch {
    flex: 1;
  }
  .help-icon {
    margin-left: 3px;
    cursor: help;
    width: 14px;
    height: 14px;
  }
}
.e__switch {
  display: inline-flex;
  align-items: center;
  position: relative;
  font-size: 14px;
  line-height: 20px;
  height: 20px;
  vertical-align: middle;
  cursor: pointer;
}

.e__switch-core {
  margin: 0;
  position: relative;
  width: 40px;
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
  top: 1px;
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
