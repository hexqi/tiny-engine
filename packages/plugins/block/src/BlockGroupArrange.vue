<template>
  <div class="footer-toolbar">
    <span
      v-for="item in state.arrangeList"
      :key="item.id"
      :class="['icon-wrap', { active: state.type === item.id }]"
      @click="typeClick(item.id)"
    >
      <svg-icon :name="item.svgName"></svg-icon>
    </span>
  </div>
</template>

<script>
import { reactive } from 'vue'

export default {
  components: {},
  props: {
    modelValue: {
      type: String,
      default: 'grid'
    },
    arrangeList: {
      type: Array,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const state = reactive({
      type: props.modelValue,
      arrangeList: props.arrangeList
    })

    const typeClick = (type) => {
      state.type = type
      emit('update:modelValue', state.type)
    }

    return {
      state,
      typeClick
    }
  }
}
</script>

<style lang="less" scoped>
.footer-toolbar {
  border-radius: 4px;
  background-color: var(--te-block-panel-footer-btn-bg-color);
  .icon-wrap {
    width: 24px;
    height: 24px;
    color: var(--te-block-panel-footer-btn-icon-color);
    font-size: 16px;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    transition: 0.3s;
    &.active {
      border: 1px solid var(--te-block-panel-footer-btn-border-color-active);
      color: var(--te-block-panel-footer-btn-color-active);
      border-radius: 4px;
      background-color: var(--te-block-panel-footer-btn-bg-color-active);
    }
  }
}
</style>
