<template>
  <tiny-config-provider :design="designSmbConfig">
    <tiny-engine-designer :addons="addons"></tiny-engine-designer>
  </tiny-config-provider>
</template>

<script>
import { ConfigProvider as TinyConfigProvider } from '@opentiny/vue'
import designSmbConfig from '@opentiny/vue-design-smb'
import { Designer } from '@opentiny/tiny-engine-common'
import addons from '../deps/addons'

export default {
  name: 'TinyLowCode',
  components: {
    TinyEngineDesigner: Designer,
    TinyConfigProvider
  },
  setup() {
    return {
      addons,
      designSmbConfig
    }
  }
}
</script>

<style lang="less" scoped>

</style>
