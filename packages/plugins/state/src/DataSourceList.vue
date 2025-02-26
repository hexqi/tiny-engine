<template>
  <div class="data-source-list lowcode-scrollbar">
    <ul>
      <li v-for="key in filteredKey" :key="key" :class="['data-source-list-item', { selected: key === selectedKey }]">
        <div class="item-head">
          <div class="item-head-left">
            <svg-icon name="plugin-icon-var" class="item-head-left-icon"></svg-icon>
            <span class="protocal"> {{ stateScope === STATE.CURRENT_STATE ? 'state.' : 'stores.' }}</span>
            <span class="name">{{ key }}</span>
          </div>
          <div class="item-head-right">
            <svg-button name="to-edit" :hoverBgColor="false" @click="openPanel(OPTION_TYPE.UPDATE, key)"></svg-button>
            <svg-button name="copy" :hoverBgColor="false" @click="openPanel(OPTION_TYPE.COPY, key)"></svg-button>
            <svg-button name="delete" :hoverBgColor="false" @click="confirmClick(key)"></svg-button>
          </div>
        </div>
      </li>
    </ul>
    <search-empty :isShow="!filteredKey.length" />
  </div>
</template>

<script lang="jsx">
import { computed } from 'vue'
import { useModal, useResource } from '@opentiny/tiny-engine-meta-register'
import { findExpressionInAppSchema } from '@opentiny/tiny-engine-common/js/ast'
import { constants } from '@opentiny/tiny-engine-utils'
import { SvgButton, SearchEmpty } from '@opentiny/tiny-engine-common'
import { STATE, OPTION_TYPE } from './js/constants'

const { COMPONENT_NAME } = constants

export default {
  components: {
    SvgButton,
    SearchEmpty
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    query: {
      type: String,
      default: ''
    },
    stateScope: {
      type: String
    },
    selectedKey: {
      type: String
    }
  },
  emits: ['openPanel', 'remove', 'removeStore'],
  setup(props, { emit }) {
    const filteredKey = computed(() => props.modelValue.filter((key) => key.includes(props.query)))

    const openPanel = (flag, key) => {
      emit('openPanel', flag, key)
    }

    const removeConfirm = (key) => {
      useModal().confirm({
        title: '提示',
        message: `您确定要删除 ${key} 吗？`,
        exec: () => emit('remove', key)
      })
    }

    const removeStoreConfirm = (key) => {
      const appPages = useResource().appSchemaState.pageTree.filter(
        (page) => page.componentName === COMPONENT_NAME.Page && page?.meta?.group !== 'publicPages'
      )
      const expression = `stores.${key}`
      const expresstionPages = findExpressionInAppSchema(appPages, expression)

      if (expresstionPages.length > 0) {
        useModal().message({
          title: '提示',
          message: (
            <div>
              不允许删除，因为检查到 {expression} 在以下页面中被引用：
              {expresstionPages.map((pagaName) => (
                <div key={pagaName}>{pagaName}</div>
              ))}
            </div>
          )
        })
      } else {
        useModal().confirm({
          title: '提示',
          message: `您确定要删除 ${key} 吗？`,
          exec: () => emit('removeStore', key)
        })
      }
    }

    const confirmClick = (key) => {
      if (props.stateScope === STATE.CURRENT_STATE) {
        removeConfirm(key)
      } else {
        removeStoreConfirm(key)
      }
    }

    return {
      filteredKey,
      confirmClick,
      openPanel,
      STATE,
      OPTION_TYPE
    }
  }
}
</script>

<style lang="less" scoped>
.data-source-list {
  padding-top: 12px;
  border-top: 1px solid var(--te-state-common-border-color-divider);
  overflow-y: scroll;
  .data-source-list-item {
    &.selected,
    &:hover {
      background: var(--te-state-common-bg-color-hover);
      .item-head-right {
        display: flex;
        justify-content: flex-end;
        width: 30%;
      }
    }
  }

  .item-head {
    height: 24px;
    padding: 0 10px;
    color: var(--te-state-data-list-text-color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item-head-left {
      display: flex;
      align-items: center;
      width: 70%;

      .tiny-svg {
        margin-right: 4px;
        cursor: pointer;
        transition: 0.3s;
        color: var(--te-state-data-list-left-icon-color);
        flex-shrink: 0;

        &.is-expand {
          transform: rotate(90deg);
        }
      }

      .protocal {
        margin-right: 4px;
        font-size: 12px;
        flex-shrink: 0;
      }

      .remote {
        color: #3ac295;
      }

      .name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .item-head-left-icon {
        color: var(--te-state-data-list-left-icon-color);
        margin-right: 8px;
      }
    }

    .item-head-right {
      display: none;
    }
  }

  .item-content {
    padding: 0 8px;
    transition: 0.3s;
  }

  .content-item {
    p span {
      &:first-child {
        font-size: 14;
        color: var(--te-state-common-label-text-color);
      }

      &:last-child {
        color: var(--te-state-common-text-color);
      }
    }
  }
}
</style>
