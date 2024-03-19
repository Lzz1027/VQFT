<template>
  <!-- 右侧工作区 -->
  <div class="workplace-container">
    <div class="workplace-tools">
      <div class="workplace-tools-tip">
        <div class="workplace-tools-tip-item">
          CommonNode: {{ nodeNum.common }}
        </div>
        <div class="workplace-tools-tip-item">EndNode: {{ nodeNum.end }}</div>
      </div>
      <div class="workplace-tools-buttons">
        <a-button
          ref="helpButton"
          class="workplace-tools-buttons-button"
          type="default"
          :icon="h(QuestionCircleOutlined)"
          @click="showHelp"
        >
          Help
        </a-button>
        <a-modal v-model:open="openHelp" @ok="handleHlepOk">
          <Help></Help>
        </a-modal>
        <a-button
          ref="runButton"
          class="workplace-tools-buttons-button"
          type="default"
          :icon="h(PlayCircleOutlined)"
          @click="runCode"
        >
          Run
        </a-button>
        <a-modal
          centered
          v-model:open="openRun"
          @ok="handleRunOk"
          :title="runCodeData.data.title"
          style="width: 1000px"
        >
          <RunCode :data="runCodeData"></RunCode>
        </a-modal>
      </div>
    </div>
    <!-- 画布 -->
    <VueFlow
      ref="workplaceVueflow"
      class="workplace-vueflow"
      @node-remove="onRemoveNodes"
      @pane-context-menu="openMenu"
      @edge-update="onEdgeUpdate"
      @edge-update-start="onEdgeUpdateStart"
      @edge-update-end="onEdgeUpdateEnd"
      :node-types="nodeTypes"
      :edge-types="EdgeType"
      :nodes="nodes"
      :edges="edges"
      :default-viewport="{ zoom: 1 }"
      :max-zoom="4"
      :min-zoom="0.1"
    >
      <Background variant="dots" />
      <MiniMap />
      <Controls />

      <div class="workplace-vueflow-tip">Right-click to add node</div>
    </VueFlow>
    <!-- 右键菜单 -->
    <div
      v-show="showMenu"
      class="contexct-menu"
      :style="{
        left: contextMenuPosition.x + 'px',
        top: contextMenuPosition.y + 'px',
      }"
    >
      <div class="contexct-menu-item" @click="addNode('common')">
        Add Common node
      </div>
      <div class="contexct-menu-item" @click="addNode('end')">Add End node</div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  onUnmounted,
  markRaw,
  h,
} from 'vue'

import { MarkerType, useVueFlow, VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'

// import default controls styles
import '@vue-flow/controls/dist/style.css'

import Help from './Help.vue'
import RunCode from './RunCode.vue'

import CommonNode from '../Node/CommonNode.vue'
import EndNode from '../Node/EndNode.vue'

import CommonEdge from '../Edge/CommonEdge.vue'
import {
  PlayCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons-vue'

import { useSettingsStore } from '/src/stores/settings'
import { useDataStore } from '/src/stores/data'

const emit = defineEmits(['mounted-vueflow'])

const helpButton = ref()
const runButton = ref()
const workplaceVueflow = ref()

defineExpose({ workplaceVueflow,helpButton,runButton })

onMounted(() => {
  emit('mounted-vueflow')
})

const settingsStore = useSettingsStore()
const dataStore = useDataStore()

const {
  onInit,
  findNode,
  fitView,
  snapToGrid,
  screenToFlowCoordinate,
  addNodes,
  addEdges,
  getNodes,
  getEdges,
  updateEdge,
  onNodeMouseEnter,
  onConnect,
  removeNodes,
} = useVueFlow()

const nodeTypes = {
  common: markRaw(CommonNode),
  end: markRaw(EndNode),
}

const EdgeType = {
  common: markRaw(CommonEdge),
}

// 画布上的节点和线
const nodes = ref([])
const edges = ref([])
// 吸附网格
snapToGrid.value = false

// any event that is emitted from the `<VueFlow />` component can be listened to using the `onEventName` method
onInit((instance) => {
  fitView()
})

// 连线事件
onConnect((edge) => {
  console.log('onConnect', edge)
  if (edge.sourceHandle.split('-')[1] !== edge.targetHandle.split('-')[1]) {
    let newEdge = {
      id: edge.source + '_' + edge.target,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: 'common',
      updatable: true,
      animated: true,
      data: {
        label: edge.source + '_' + edge.target,
      },
    }
    addEdges([newEdge])
  }
})

// 更新连线事件
const onEdgeUpdate = ({ edge, connection }) => {
  console.log('onEdgeUpdate', edge)
  if (edge.sourceHandle.split('-')[1] !== edge.targetHandle.split('-')[1]) {
    let newEdge = {
      id: edge.source + '_' + edge.target,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: 'common',
      updatable: true,
      animated: true,
      data: {
        label: edge.source + '_' + edge.target,
      },
    }
    updateEdge(newEdge, connection)
  }
}

// 开始更新连线事件
const onEdgeUpdateStart = (edge) => {
  console.log('onEdgeUpdateStart', edge)
}

// 结束更新连线事件
const onEdgeUpdateEnd = (edge) => {
  console.log('onEdgeUpdateEnd', edge)
}

const nodeNum = reactive({
  common: 0,
  end: 0,
})

// 右键菜单位置
const contextMenuPosition = ref({ x: 0, y: 0 })
// 右键菜单位置转换为画布坐标
const newNodePosition = computed(() => {
  return screenToFlowCoordinate(contextMenuPosition.value)
})

// 右键菜单
const showMenu = ref(false)
const openMenu = (e) => {
  // 阻止右键默认事件
  e.preventDefault()
  // 记录右键位置
  contextMenuPosition.value = { x: e.clientX, y: e.clientY }
  // 显示右键菜单
  showMenu.value = true
  // 开始监听点击事件
  document.addEventListener('click', () => {
    // 点击后隐藏右键菜单
    showMenu.value = false
  })
}

const addNode = (nodeType) => {
  nodeNum[nodeType] += 1
  let newNode = {
    id: nodeType + '_' + nodeNum[nodeType],
    type: nodeType,
    position: { x: newNodePosition.value.x, y: newNodePosition.value.y },
    label: nodeType + '_' + nodeNum[nodeType],
    dragHandle: '.node-drag-handle',
  }
  addNodes([newNode])
  dataStore.addNode(newNode)
}

const openHelp = ref(false)
const showHelp = () => {
  openHelp.value = true
}

const handleHelpOk = () => {
  openHelp.value = false
}

const openRun = ref(false)
const runCodeData = reactive({
  type: 'error',
  data: {},
})

const runCode = () => {
  openRun.value = true
  // 获取画布上的节点和线的信息
  // 如果 nodes 中没有 type 为 end 的节点，提示用户添加 end 节点
  if (getNodes._value.length === 0) {
    runCodeData.type = 'error'
    runCodeData.data = {
      title: 'Error',
      content: 'Please add node',
    }
  } else {
    if (!getNodes._value.find((item) => item.type === 'end')) {
      runCodeData.type = 'error'
      runCodeData.data = {
        title: 'Error',
        content: 'Please add at least one End node',
      }
    } else {
      runCodeData.type = 'run'
      runCodeData.data = {
        title: 'Run Code Result',
        nodes: getNodes._value,
        edges: getEdges._value,
      }
    }
  }

  console.log('nodes', getNodes._value)
  console.log('edges', getEdges._value)
}

const handleRunOk = () => {
  openRun.value = false
}
</script>

<style scoped>
.contexct-menu {
  position: fixed;
  z-index: 100;
  background-color: #eaecf0;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
  cursor: pointer;
}

.contexct-menu-item {
  padding: 10px;
  background-color: #f5f5f5;
  transition: background-color 0.3s;
}

.contexct-menu-item:hover {
  background-color: #e0e0e0;
}

.workplace-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.workplace-tools {
  display: flex;
  flex-direction: row;
  gap: 5px;
  padding: 5px;
  background-color: #f6f6f6;
  border-radius: 6px;
  height: 40px;
  line-height: 30px;
  border: 1px solid #a7d7f9;
}

.workplace-tools-tip {
  color: #000;
  font-size: 20px;
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.workplace-tools-tip-item {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.workplace-tools-buttons {
  display: flex;
  flex-direction: row;
  gap: 5px;
  margin-left: auto;
}

.workplace-vueflow {
  width: 100%;
  height: 100%;
  border: 1px solid #a7d7f9;
}

.workplace-tools-buttons-button {
  background-color: #b7d4e9;
  color: #000;
  border: none;
}

.workplace-tools-buttons-button:hover {
  background-color: #255c83;
  color: #fff;
}

.workplace-vueflow-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ccc;
  font-size: 20px;
  pointer-events: none;
}
</style>
