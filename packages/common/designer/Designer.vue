<template>
  <div id="tiny-engine">
    <design-toolbars :addons="{ toolbars: addons.toolbars }"></design-toolbars>
    <div class="tiny-engine-main">
      <div class="tiny-engine-left-wrap">
        <div class="tiny-engine-content-wrap">
          <design-plugins
            :addons="{ plugins: addons.plugins }"
            :render-panel="plugins.render"
            @click="toggleNav"
          ></design-plugins>
          <design-canvas :addons="{ plugins: addons.plugins }"></design-canvas>
        </div>
      </div>
      <div class="tiny-engine-right-wrap">
        <design-settings
          :addons="{ settings: addons.settings }"
          v-show="layoutState.settings.showDesignSettings"
          ref="right"
        ></design-settings>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, watch, onUnmounted } from 'vue'
import { ConfigProvider as TinyConfigProvider } from '@opentiny/vue'
import { useResource, useLayout, useEditorInfo, useModal, useApp, useNotify } from '@opentiny/tiny-engine-controller'
import { isVsCodeEnv } from '@opentiny/tiny-engine-controller/js/environments'
import DesignToolbars from './DesignToolbars.vue'
import DesignPlugins from './DesignPlugins.vue'
import DesignCanvas from './DesignCanvas.vue'
import DesignSettings from './DesignSettings.vue'
import { useBroadcastChannel } from '@vueuse/core'
import { constants } from '@opentiny/tiny-engine-utils'

const { message } = useModal()
const { BROADCAST_CHANNEL } = constants

export default {
  name: 'Designer',
  components: {
    DesignToolbars,
    DesignPlugins,
    DesignCanvas,
    DesignSettings,
    TinyConfigProvider
  },
  provide() {
    return {
      editor: this
    }
  },
  props: {
    addons: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const AppManage = props.addons.plugins.find((item) => item.id === 'AppManage')
    const blockPlugin = props.addons.plugins.find((item) => item.id === 'BlockManage')
    const materials = props.addons.plugins.find((item) => item.id === 'Materials')

    const { requestInitBlocks } = blockPlugin?.api || {}
    const { fetchGroups } = materials?.api || {}

    const state = reactive({
      globalClass: '',
      rightWidth: '',
      leftWidfth: '',
      preNode: AppManage,
      jsClose: null
    })

    const { layoutState } = useLayout()
    const { plugins } = layoutState
    const right = ref(null)

    // 此处接收画布内部的错误和警告提示
    const { data } = useBroadcastChannel({ name: BROADCAST_CHANNEL.Notify })

    watch(data, (options) => useNotify(options))

    watch(
      () => state.jsClose,
      () => {
        if (state.preNode) {
          plugins.render = state.preNode.id
        }
      }
    )

    const toggleNav = ({ item, navLists }) => {
      if (navLists) state.preNode = navLists

      if (!item.id) return

      plugins.render = plugins.render === item.id ? null : item.id
    }

    useEditorInfo().getUserInfo()
    useResource().fetchResource()

    const handlePopStateEvent = () => {
      useResource().handlePopStateEvent()
    }

    window.addEventListener('popstate', handlePopStateEvent)

    if (isVsCodeEnv) {
      const appId = useApp().appInfoState.selectedId
      fetchGroups(appId)
        .then((groups) => {
          const blocks = []
          groups.forEach((group) => {
            blocks.push(...group.blocks)
          })
          requestInitBlocks(blocks)
        })
        .catch((error) => {
          message({ message: error.message, status: 'error' })
        })
    }

    onUnmounted(() => {
      window.removeEventListener('popstate', handlePopStateEvent)
    })

    return {
      state,
      right,
      plugins,
      toggleNav,
      layoutState
    }
  }
}
</script>

<style lang="less" scoped>
#tiny-engine {
  display: flex;
  flex-flow: column;
  min-width: var(--base-min-width);
  height: 100vh;
  overflow: hidden;
  .tiny-engine-main {
    display: flex;
    flex: 1;
    overflow-y: hidden;
  }
  .tiny-engine-left-wrap {
    flex: 1 1 0;
    display: flex;
    flex-flow: column nowrap;
    z-index: 4;
    .tiny-engine-content-wrap {
      display: flex;
      max-width: 100vw;
      flex: 1;
    }
  }
  .tiny-engine-right-wrap {
    z-index: 4;
  }
  :deep(.monaco-editor .suggest-widget) {
    border-width: 0;
  }
}
</style>
