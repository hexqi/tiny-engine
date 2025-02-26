<template>
  <plugin-panel :title="title" @close="pluginPanelClosed" :docsUrl="docsUrl" :isShowDocsIcon="true" class="page-manage">
    <template #header>
      <svg-button
        class="add-folder-icon"
        name="add-folder"
        placement="bottom"
        tips="新建文件夹"
        @click="createNewFolder()"
      ></svg-button>
      <svg-button
        class="new-page-icon"
        name="new-page"
        placement="bottom"
        tips="新建页面"
        @click="createNewPage('staticPages')"
      ></svg-button>
    </template>

    <template #content>
      <page-tree
        ref="pageTreeRef"
        :isFolder="state.isFolder"
        @add="createNewPage('publicPages')"
        @openSettingPanel="openSettingPanel"
        @createPage="createNewPage"
        @createFolder="createNewFolder"
      ></page-tree>
    </template>
  </plugin-panel>

  <page-setting :isFolder="state.isFolder" @openNewPage="openNewPage"></page-setting>

  <page-folder-setting :isFolder="state.isFolder"></page-folder-setting>
</template>

<script lang="jsx">
import { reactive, ref, watchEffect, provide } from 'vue'
import { useCanvas, usePage, useHelp } from '@opentiny/tiny-engine-meta-register'
import { PluginPanel, SvgButton } from '@opentiny/tiny-engine-common'
import { extend } from '@opentiny/vue-renderless/common/object'
import PageSetting, { openPageSettingPanel, closePageSettingPanel } from './PageSetting.vue'
import PageFolderSetting, { openFolderSettingPanel, closeFolderSettingPanel } from './PageFolderSetting.vue'
import PageTree from './PageTree.vue'
import { fetchPageDetail } from './http'

export const api = {
  getPageById: async (id) => {
    if (id) {
      return fetchPageDetail(id)
    }

    return undefined
  },
  openPageSettingPanel
}

export default {
  components: {
    PageSetting,
    PluginPanel,
    SvgButton,
    PageFolderSetting,
    PageTree
  },
  props: {
    title: {
      type: String,
      default: '页面'
    }
  },
  setup() {
    const { pageState } = useCanvas()
    const { pageSettingState, getDefaultPage, isTemporaryPage, initCurrentPageData } = usePage()

    const pageTreeRef = ref(null)
    const ROOT_ID = pageSettingState.ROOT_ID
    const docsUrl = useHelp().getDocsUrl('page')

    const state = reactive({
      isFolder: false
    })

    const createNewPage = (group, parentId = ROOT_ID) => {
      closeFolderSettingPanel()
      pageSettingState.isNew = true
      try {
        const defaultPage = getDefaultPage()
        if (!defaultPage) {
          throw new Error('Failed to get default page configuration')
        }
        pageSettingState.currentPageData = {
          ...getDefaultPage(),
          ...defaultPage,
          parentId,
          route: '',
          name: 'Untitled',
          page_content: {
            lifeCycles: {}
          },
          group
        }
      } catch (error) {
        // console.error('Failed to create new page:', error)
      }
      pageSettingState.currentPageDataCopy = extend(true, {}, pageSettingState.currentPageData)
      state.isFolder = false
      openPageSettingPanel()
    }

    const createNewFolder = (parentId = ROOT_ID) => {
      closePageSettingPanel()
      pageSettingState.isNew = true
      pageSettingState.currentPageData = { parentId, route: '', name: 'untitled' }
      pageSettingState.currentPageDataCopy = extend(true, {}, pageSettingState.currentPageData)
      state.isFolder = true
      openFolderSettingPanel()
    }

    watchEffect(() => {
      if (isTemporaryPage.saved) {
        openPageSettingPanel()
      }
    })

    const openSettingPanel = async (pageData) => {
      state.isFolder = !pageData.isPage
      pageSettingState.isNew = false

      const isPageChange = pageData.id !== pageSettingState.currentPageData.id

      if (state.isFolder) {
        isPageChange && closePageSettingPanel()
        openFolderSettingPanel()
      } else {
        isPageChange && closeFolderSettingPanel()
        openPageSettingPanel()
      }
      const pageDetail = await fetchPageDetail(pageData?.id)
      initCurrentPageData(pageDetail)
    }

    provide('openSettingPanel', openSettingPanel)

    const pluginPanelClosed = () => {
      closePageSettingPanel()
      closeFolderSettingPanel()
    }

    const openNewPage = (data) => {
      pageTreeRef.value.switchPage(data)
    }

    return {
      state,
      pageState,
      openNewPage,
      pageTreeRef,
      pluginPanelClosed,
      openSettingPanel,
      createNewFolder,
      createNewPage,
      docsUrl
    }
  }
}
</script>

<style lang="less" scoped>
:deep(.tiny-button) {
  border-radius: 4px;
  height: 24px;
  line-height: 24px;
}
</style>
