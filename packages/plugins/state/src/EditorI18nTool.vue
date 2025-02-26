<template>
  <tiny-popover
    v-model="state.showPopover"
    width="260"
    trigger="manual"
    :visible-arrow="false"
    popper-class="lowcode"
    @hide="onClosePopover"
  >
    <div class="popover-content">
      <div class="content-header">
        <span class="content-header-title">国际化管理</span>
        <icon-close class="icon-close" @click="state.showPopover = false"></icon-close>
      </div>
      <bind-i18n
        ref="bindI18nRef"
        v-model="i18nValue"
        :lang-data="langs"
        :is-bind="false"
        :currentLang="currentLanguage"
        :locales="i18nResource.locales"
        @bind="handleChooseI18n"
      >
        <template #suffix>
          <div class="buttons">
            <tiny-button @click="createI18n">新建词条</tiny-button>
            <tiny-button type="primary" :disabled="!i18nData" @click="handleConfirm">插入词条</tiny-button>
          </div>
        </template>
      </bind-i18n>
    </div>

    <template #reference>
      <tiny-tooltip content="插入国际化词条" effect="light" placement="top" :open-delay="OPEN_DELAY.Default">
        <svg-icon name="internationalization" @click="openPopover"></svg-icon>
      </tiny-tooltip>
    </template>
  </tiny-popover>
</template>

<script>
import { reactive, ref, computed } from 'vue'
import { Button, Popover, Tooltip } from '@opentiny/vue'
import { iconClose } from '@opentiny/vue-icon'
import { BindI18n } from '@opentiny/tiny-engine-common'
import { useTranslate } from '@opentiny/tiny-engine-meta-register'
import { constants } from '@opentiny/tiny-engine-utils'
const { OPEN_DELAY } = constants

export default {
  components: {
    TinyButton: Button,
    TinyTooltip: Tooltip,
    TinyPopover: Popover,
    IconClose: iconClose(),
    BindI18n
  },
  props: {},
  emits: ['confirm'],
  setup(props, { emit }) {
    const { currentLanguage, getLangs, i18nResource } = useTranslate()
    const i18nValue = ref('')
    const bindI18nRef = ref(null)
    const i18nData = ref(null)

    const state = reactive({
      showPopover: false
    })

    const langs = computed(() => getLangs())

    const onClosePopover = () => {
      if (bindI18nRef.value) {
        bindI18nRef.value.showEditItem = false
      }
      i18nData.value = null
      i18nValue.value = ''
    }

    const handleChooseI18n = (data) => {
      i18nData.value = data
      i18nValue.value = data.zh_CN
    }

    const handleConfirm = () => {
      if (!i18nData.value.key) return
      emit(
        'confirm',
        `{
        "type": "i18n",
        "key": "${i18nData.value.key}"
      }`
      )
      i18nValue.value = ''
      i18nData.value = null
      if (bindI18nRef.value) {
        bindI18nRef.value.showEditItem = false
      }
      state.showPopover = false
    }

    const createI18n = () => {
      bindI18nRef.value.openCreateForm()
    }

    const openPopover = () => {
      state.showPopover = true
      bindI18nRef.value.selectValue = ''
    }

    return {
      bindI18nRef,
      i18nValue,
      state,
      i18nData,
      langs,
      i18nResource,
      currentLanguage,
      openPopover,
      onClosePopover,
      createI18n,
      handleChooseI18n,
      handleConfirm,
      OPEN_DELAY
    }
  }
}
</script>

<style lang="less" scoped>
.popover-content {
  padding: 8px 4px;
  text-align: right;
  .icon-close {
    font-size: 16px;
    cursor: pointer;
  }
  .buttons {
    margin-top: 16px;
  }
  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .content-header-title {
      font-size: var(--te-base-font-size-1);
      font-weight: var(--te-base-font-weight-7);
    }
    margin-bottom: 16px;
  }
  .tiny-button.tiny-button.tiny-button.tiny-button--default {
    margin-right: 4px;
    border-color: var(--te-state-editor-btn-border-color);
  }
}
.buttons {
  .button-icon {
    width: 1.3em;
    height: 1.3em;
    margin-left: 10px;
    margin-bottom: 2px;
  }
}
</style>
