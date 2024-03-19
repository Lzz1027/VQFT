<script setup>
import { ref, onMounted, createVNode } from 'vue'
import FlowCanvas from './components/container/FlowCanvas.vue'
import PreView from './components/container/Preview.vue'
import DataSelector from './components/container/DataSelector.vue'
import { useSettingsStore } from '/src/stores/settings';

const settingsStore = useSettingsStore()

const viSearch = ref(null)
const dataSelector = ref(null)
const dataPreviewer = ref(null)
const flowCanvas = ref(null)
const runButton = ref(null)
const helpButton = ref(null)
const workplaceVueflow = ref(null)

const openGuide = ref(settingsStore.firstLoad)
if (settingsStore.firstLoad) {
  settingsStore.firstLoad = false
}


const currentGuide = ref(0)

const steps = [
  {
    title: 'Welcome to ViSearch!',
    // 跟随以下指导步骤，你将轻松学会如何使用ViSearch
    description:
      'Follow this guide, you will easily learn how to use ViSearch.',
    target: null,
  },
  {
    title: 'Select a dataset',
    description:
      'You can select a dataset from the list. We now offer two datasets: "Game of Thrones" and "Japan Railway Stations". All datasets are dumped from WikiData.',
    placement: 'right',
    target: () => dataSelector.value && dataSelector.value.$el,
  },
  {
    type: 'primary',
    cover: createVNode(
      'div',
      { style: { width: '100%', 'text-align': 'left' } },
      [
        createVNode(
          'div',
          {
            style: {
              'font-size': '16px',
              'font-weight': '600',
              'margin-bottom': '8px',
              'text-align': 'left',
            },
          },
          'Start building your query here!'
        ),
        createVNode(
          'div',
          {
            style: 'width: 100%;',
          },
          [
            'Right click on the canvas to add a new node.',
            createVNode('img', {
              src: '/src/assets/newNode.gif',
              style: 'width: 100%;',
            }),
          ]
        ),
      ]
    ),
    placement: 'left',
    target: () => workplaceVueflow.value && workplaceVueflow.value.$el,
  },
  {
    type: 'primary',
    cover: createVNode('div', { style: 'width: 100%; ' }, [
      createVNode(
        'div',
        {
          style: {
            'font-size': '16px',
            'font-weight': '600',
            'margin-bottom': '8px',
            'text-align': 'left',
          },
        },
        'Two types of nodes'
      ),
      createVNode(
        'div',
        { style: 'width: 100%; display: flex; text-align: left' },
        [
          createVNode('div', { style: 'padding:10px; flex: 1' }, [
            createVNode('img', {
              src: '/src/assets/commonNode.png',
              style: 'width: 100%;',
            }),
            'Common nodes are used to build the query. ',
          ]),
          createVNode('div', { style: 'padding:10px; flex: 1' }, [
            createVNode('img', {
              src: '/src/assets/endNode.png',
              style: 'width: 100%;',
            }),
            'End nodes are used to identify the data you want to search for. ',
          ]),
        ]
      ),
    ]),
    placement: 'left',
    target: () => workplaceVueflow.value && workplaceVueflow.value.$el,
  },
  {
    type: 'primary',
    cover: createVNode('div', { style: 'width: 100%;' }, [
      createVNode(
        'div',
        {
          style: {
            'font-size': '16px',
            'font-weight': '600',
            'margin-bottom': '8px',
            'text-align': 'left',
          },
        },
        'Link nodes'
      ),
      createVNode('div', { style: 'width: 100%; text-align: left' }, [
        'You can connect the nodes by holding the handle and dragging it to another node.',
      ]),
      createVNode('img', {
        src: '/src/assets/link.gif',
        style: 'width: 100%;',
      }),
    ]),
    placement: 'left',
    target: () => workplaceVueflow.value && workplaceVueflow.value.$el,
  },

  {
    title: 'Preview the query',
    description:
      'After you add filters with full-text search on a node, you can preview the data in this area.',
    placement: 'right',
    target: () => dataPreviewer.value && dataPreviewer.value.$el,
  },
  {
    title: 'Run query',
    description:
      'When you have finished building the query, you can click the run button to run the query and get the result.',
    placement: 'bottom',
    target: () => runButton.value && runButton.value.$el,
  },
  {
    title: 'Help',
    description:
      'You can find some information about the dataset. If you have any other questions, you can contact us for help.',
    placement: 'bottom',
    target: () => helpButton.value && helpButton.value.$el,
  },
]

const handleOpen = (val) => {
  openGuide.value = val
}

const getWorkPlaceRefs = () => {
  helpButton.value = flowCanvas.value.helpButton
  runButton.value = flowCanvas.value.runButton

  workplaceVueflow.value = flowCanvas.value.workplaceVueflow
}
</script>

<template>
  <div class="vql-app" ref="viSearch">
    <div class="menu">
      <div class="menu-header">
        <div style="font-size: 55px">
          <span style="color: cadetblue">Vi</span>
          <span
            style="
              background: linear-gradient(to right, cadetblue, coral);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            "
            >S</span
          >
          <span style="color: coral">EARCH</span>
        </div>

        <div style="font-size: 15px; height: 20px; line-height: 20px">
          [ <span style="color: cadetblue">Vi</span>
          <span
            style="
              background: linear-gradient(to right, cadetblue, black);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            "
            >s</span
          >ual query with Full-text
          <span
            style="
              background: linear-gradient(to right, black, coral);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            "
            >S</span
          >
          <span style="color: coral">EARCH</span> ]
        </div>
      </div>
      <div class="menu-main">
        <DataSelector ref="dataSelector" />
        <PreView ref="dataPreviewer" />
      </div>
      <div class="menu-footer">TJUDB © 2023-2024</div>
    </div>
    <div class="main">
      <FlowCanvas ref="flowCanvas" @mounted-vueflow="getWorkPlaceRefs" />
    </div>
  </div>
  <a-tour
    v-model:current="currentGuide"
    :open="openGuide"
    :steps="steps"
    @close="handleOpen(false)"
  />
</template>

<style scoped>
.vql-app {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: row;
}

.menu {
  width: 300px;
  height: 100%;
  background-color: #f6f6f6;
  color: #000;
  text-align: center;
  line-height: 50px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #a7d7f9;
}

.menu-header {
  width: 100%;
  padding: 20px;
  font-size: 30px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.menu-main {
  height: calc(100% - 150px);
}

.menu-footer {
  width: 100%;
  height: 50px;
  line-height: 50px;
}

.main {
  flex: 1;
  height: 100%;
  padding: 10px;
  background-color: #ffffff;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
