<template>
  <div>
    <div class="header">
      <icon-setting class="icon-setting"></icon-setting>
      <div>属性设置</div>
      <span class="icon-wrap">
        <icon-close class="icon-close" @click="closePanel"></icon-close>
      </span>
    </div>
    <ConfigGroup :group="propertiesList" :index="0">
      <template #item="{ data, propIndex }">
        <ConfigItem
          :key="propIndex"
          :property="data"
          :data-prop-index="propIndex"
          :data-group-index="groupIndex"
          :isTopLayer="true"
        >
          <template #prefix>
            <slot name="prefix" :data="data"></slot>
          </template>
          <template v-if="!data.noBinding" #suffix>
            <slot name="suffix" :data="data"></slot>
          </template>
        </ConfigItem>
      </template>
    </ConfigGroup>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useMaterial, useProperties, useCanvas, useProperty } from '@opentiny/tiny-engine-meta-register'
import { iconSetting, iconClose } from '@opentiny/vue-icon'

export default {
  components: {
    IconSetting: iconSetting(),
    IconClose: iconClose()
  },
  setup(props, { emit }) {
    const { getMaterial } = useMaterial()
    const { pageState } = useCanvas()
    const { properties } = useProperty().getProperty({ pageState })
    const active = ref('props')

    const propertiesList = computed(() => {
      const quickProps = []

      const schema = useProperties().getSchema()
      if (!schema) return []
      const nodeType = getMaterial(schema.componentName)
      const shortcuts = nodeType.configure?.shortcuts?.properties || []

      properties.value.forEach((group) => {
        group.content.forEach((prop) => {
          shortcuts.includes(prop.property) && quickProps.push(prop)
        })

        // 如果目标元素的快速设置值没有，则取属性值放置
        if (!quickProps.length) {
          quickProps.push(...group.content.slice(0, 2))
        }
      })

      return {
        content: quickProps
      }
    })

    const closePanel = () => {
      emit('active', 'props')
    }

    return {
      active,
      propertiesList,
      closePanel
    }
  }
}
</script>

<style lang="less" scoped>
.header {
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-bottom: 1px solid var(--te-canvas-container-border-color);
  height: 36px;

  div {
    flex: 1;
    margin: 0 10px;
  }

  .icon-setting {
    font-size: 16px;
    fill: var(--te-canvas-container-text-color-secondary);
  }

  .icon-wrap {
    width: 20px;
    height: 20px;
    fill: var(--te-canvas-container-icon-color);
    font-size: 16px;
    border-radius: 2px;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    transition: 0.3s;
    &:hover {
      fill: var(--te-canvas-container-icon-color-primary);
      background: var(--te-canvas-container-bg-color-hover);
    }
  }
}
.body {
  padding: 0 12px;

  .properties-item {
    width: 100%;
    padding: 8px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .item-label {
      width: 40%;
      word-break: break-all;
    }
    .item-component {
      width: 100%;
      padding-left: 8px;
    }
    .nolabel {
      width: 100%;
    }
    &.col-6 {
      width: 50%;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      .item-label {
        width: auto;
        margin-bottom: 6px;
      }
    }
    &.col-4 {
      width: 33.33%;
      flex-direction: column;
      align-items: flex-start;
      .item-label {
        width: auto;
        margin-bottom: 6px;
      }
    }
  }
}
.footer {
  padding: 8px;
  cursor: pointer;
  span {
    width: 100%;
    padding: 4px 0;
    display: inline-block;
    background: var(--te-canvas-container-short-cut-bg-color);
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  svg {
    fill: var(--te-canvas-container-text-color-secondary);
    margin-left: 4px;
  }
}
</style>
