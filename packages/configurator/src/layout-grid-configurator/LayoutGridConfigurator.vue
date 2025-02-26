<template>
  <div class="layout-container">
    <div class="layout-container-module">
      <ul class="list">
        <li
          v-for="(item, index) in modeList"
          :key="index"
          :title="item.colScale"
          :class="[`col-${item.col}`, 'li-item', { active: item.colScale === mode }]"
          @click="modeClick(index, item.colScale)"
        >
          <div v-for="(col, index) in item.spans" :key="index" :class="[`span-${col.span}`, 'col-span']"></div>
        </li>
      </ul>
    </div>
    <div class="layout-splitpanes">
      <div class="customize">
        Customize:
        <span v-if="customizeShow" style="color: #de504e">*</span>
      </div>
      <split-panes class="default-theme" style="height: 28px" @resize="resize">
        <pane
          v-for="i in setting.len"
          :key="i"
          class="layout-pane"
          :size="(setting.modeArray[i - 1] * 100) / total"
          min-size="8.3"
        >
          <span>{{ setting.modeArray[i - 1] }}</span>
        </pane>
      </split-panes>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed } from 'vue'
import { SplitPanes, Pane } from '@opentiny/tiny-engine-common'
import { useProperties, useCanvas } from '@opentiny/tiny-engine-meta-register'

export default {
  components: {
    SplitPanes,
    Pane
  },
  inheritAttrs: false,
  setup() {
    const defaultCols = [{ props: { span: 6 } }, { props: { span: 6 } }]
    const cols = useProperties().getSchema()?.children || defaultCols

    const mode = ref(cols.map((col) => col.props.span).join(':'))

    const total = 12
    const customizeShow = ref(false)

    const setting = computed(() => ({
      mode: mode.value,
      modeArray: mode.value.split(':'),
      len: mode.value.split(':').length
    }))

    const modeList = reactive([
      {
        col: 1,
        colScale: '12',
        spans: [
          {
            span: 12
          }
        ]
      },
      {
        col: 2,
        colScale: '6:6',
        spans: [
          {
            span: 6
          },
          {
            span: 6
          }
        ]
      },
      {
        col: 2,
        colScale: '3:9',
        spans: [
          {
            span: 3
          },
          {
            span: 9
          }
        ]
      },
      {
        col: 2,
        colScale: '8:4',
        spans: [
          {
            span: 8
          },
          {
            span: 4
          }
        ]
      },
      {
        col: 2,
        colScale: '9:3',
        spans: [
          {
            span: 9
          },
          {
            span: 3
          }
        ]
      },
      {
        col: 3,
        colScale: '4:4:4',
        spans: [
          {
            span: 4
          },
          {
            span: 4
          },
          {
            span: 4
          }
        ]
      },
      {
        col: 3,
        colScale: '3:6:3',
        spans: [
          {
            span: 3
          },
          {
            span: 6
          },
          {
            span: 3
          }
        ]
      },
      {
        col: 4,
        colScale: '3:3:3:3',
        spans: [
          {
            span: 3
          },
          {
            span: 3
          },
          {
            span: 3
          },
          {
            span: 3
          }
        ]
      },
      {
        col: 6,
        colScale: '2:2:2:2:2:2',
        spans: [
          {
            span: 2
          },
          {
            span: 2
          },
          {
            span: 2
          },
          {
            span: 2
          },
          {
            span: 2
          },
          {
            span: 2
          }
        ]
      }
    ])

    const setLayout = (item) => {
      const spans = item.split(':')
      mode.value = item

      const { operateNode } = useCanvas()
      const schema = useProperties().getSchema()

      if (!schema) {
        // eslint-disable-next-line no-console
        console.error('Error! There is no node selected. 错误！当前没有节点被选中。')

        return
      }

      const cols = [...(schema?.children || [])]

      spans.forEach((span, index) => {
        if (cols[index]) {
          cols[index].props.span = span
        } else {
          cols.push({
            componentName: 'TinyCol',
            props: {
              style: 'height: 100%;',
              span
            },
            children: [
              {
                componentName: 'div',
                props: {
                  style: 'height: 100%;'
                }
              }
            ]
          })
        }
      })

      operateNode({ type: 'updateAttributes', id: schema.id, value: { children: cols.slice(0, spans.length) } })
    }

    const modeClick = (index, item) => {
      setLayout(item)
    }

    const resize = (event) => {
      const modeArray = []
      let lastSize = total

      for (let i = 0; i < event.length - 1; i++) {
        let size = event[i].size

        size = Math.floor((size * total) / 100)
        size = Math.max(size, 1)
        lastSize = lastSize - size

        modeArray.push(size)
      }

      modeArray.push(lastSize)
      setLayout(modeArray.join(':'))
    }

    return {
      mode,
      modeList,
      setting,
      total,
      customizeShow,
      resize,
      modeClick
    }
  }
}
</script>

<style lang="less" scoped>
.layout-container {
  .layout-container-module {
    margin-bottom: 8px;
    .list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }
    .li-item {
      box-sizing: border-box;
      width: 48px;
      border: 1px solid var(--te-configurator-common-border-color);
      background: var(--te-configurator-layout-grid-bg-color);
      border-radius: 4px;
      padding: 4px;
      margin: 0 4px 4px 4px;
      cursor: pointer;
      display: flex;
      &:hover,
      &.active {
        border-color: #5e7ce0;
      }
    }
    .col-span {
      height: 28px;
      background: var(--te-configurator-common-bg-color);
      &.span-12 {
        width: 100%;
      }
      &.span-9 {
        width: 75%;
      }
      &.span-8 {
        width: 66.666%;
      }
      &.span-6 {
        width: 50%;
      }
      &.span-4 {
        width: 33.333%;
      }
      &.span-3 {
        width: 25%;
      }
      &.span-2 {
        width: 16.66%;
      }
      &:not(:last-child) {
        margin-right: 3px;
      }
    }
  }

  .splitpanes__pane {
    justify-content: center;
    align-items: center;
    display: flex;
    background: var(--te-configurator-layout-grid-bg-color);
    color: var(--te-configurator-common-text-color-secondary);
    transition: none;
  }

  :deep(.splitpanes__splitter) {
    background: var(--te-configurator-layout-grid-bg-color);
    border-left: var(--te-configurator-common-border-color);
  }

  .layout-splitpanes {
    margin: 8px;

    .customize {
      margin-bottom: 8px;
      color: var(--te-configurator-common-text-color-secondary);
    }
  }
}
</style>
