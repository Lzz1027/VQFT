
<template>
  <!-- You can use the `BaseEdge` component to create your own custom edge more easily -->
  <BaseEdge :id="id" :style="style" :path="path[0]" :marker-end="markerEnd" />

  <!-- Use the `EdgeLabelRenderer` to escape the SVG world of edges and render your own custom label in a `<div>` ctx -->
  <EdgeLabelRenderer>
    <div
      
      :style="{
        width: '150px',
        backgroundColor: '#255c83',
        color: 'white',
        padding: '5px',
        textAlign: 'center',
        borderRadius: '5px',
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
      }"
      class="nodrag nopan"
    >
      <div class="edge-label-title">
        {{ props.id }}
      </div>
      <!-- Label 选择 -->
      <a-select
        class="edge-label-select"
        show-search
        v-model:value="labelSearchValue"
        placeholder="Add labels to the node"
        style="width: 100%; margin-top: 5px;"
        :options="labelOptions"
        :filter-option="filterFunction"
      ></a-select>
    </div>
  </EdgeLabelRenderer>
</template>

<script setup>
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useVueFlow,
  useEdge,
} from '@vue-flow/core'
import { computed, ref, watch } from 'vue'
import { Background } from '@vue-flow/background'
import { searchProp } from '/src/api/api.js'
import { debounce } from 'lodash-es'
import { useSettingsStore } from '/src/stores/settings'
import { useDataStore } from '../../stores/data'
const settingsStore = useSettingsStore()
const dataStore = useDataStore()


const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  sourceX: {
    type: Number,
    required: true,
  },
  sourceY: {
    type: Number,
    required: true,
  },
  targetX: {
    type: Number,
    required: true,
  },
  targetY: {
    type: Number,
    required: true,
  },
  sourcePosition: {
    type: String,
    required: true,
  },
  targetPosition: {
    type: String,
    required: true,
  },
  markerEnd: {
    type: String,
    required: false,
  },
  style: {
    type: Object,
    required: false,
  },
  data: {
    type: Object,
    required: false,
  },
})

const { edge} = useEdge()

const { removeEdges } = useVueFlow()

const path = computed(() => getBezierPath(props))
const style = {
  strokeWidth: 3,
}

const labelSearchValue = ref(null)

watch(labelSearchValue, ()=>{
  edge.data['labels'] = labelSearchValue.value
})

const filterFunction = (inputValue, option) => {
  if (option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1) {
    return true;
  }
}

const labelOptions = computed(() => {
  // 在label的起始节点上搜索关系，如果不存在，则直接在settingsStore 中获取
  
  let option = []
  if (dataStore.nodes[edge.source].searchList.length > 0) {
    dataStore.nodes[edge.source].searchList.forEach((item) => {
      item.relations.forEach((relation) => {
        // 如果不存在，则添加
        if (!option.find((o) => o.value == relation.rel.type)) {
          option.push({
            value: relation.rel.type,
            label: relation.rel.label,
          })
        }
      })
    })
    // option 按照 value 排序
    // option.sort((a, b) => {
    //   return a.value.localeCompare(b.value)
    // })
  } else {
    if (settingsStore.currentDataSet) {
      option =  settingsStore.dataSetInfo.relationLabelSet.map((item) => {
        return {
          value: item.key,
          label: item.label,
        }
      })
      // option 按照 value 排序
      // option.sort((a, b) => {
      //   return a.value.localeCompare(b.value)
      // })
    }
  }
  // 对option进行排序
  option.sort((a, b) => {
    return a.label.localeCompare(b.label)
  })
  return option
})
</script>

<script>
export default {
  inheritAttrs: false,
}
</script>
