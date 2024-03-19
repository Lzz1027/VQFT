<template>
  <div>
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane key="1" tab="Prefix Defination">
        <table style="width: 100%; text-align: left;">
          <tr>
            <th>Prefix</th>
            <th>URI</th>
          </tr>
          <tr v-for="(value, key) in dataSetInfo.NsPrefDef">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </table>
      </a-tab-pane>
      <a-tab-pane key="2" tab="Graph Config">
        <table style="width: 100%; text-align: left;">
          <tr>
            <th>Graph Config</th>
          </tr>
          <tr v-for="(value, key) in dataSetInfo.graphConfig">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </table>
      </a-tab-pane>
      <a-tab-pane key="3" tab="Help">
        <p>Github Link: </p>
        <p>Email: Lizhaozhuo@tju.edu.cn</p>
        <a-button @click="showGuide" >Show Guide Again</a-button>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '/src/stores/settings'

const settings = useSettingsStore()

// 从 settings 中获取数据集的信息，用于展示
const dataSetInfo = computed(() => {
  if (!settings.dataSetInfo) {
    return {}
  } else {
    return settings.dataSetInfo
  }
})

const activeKey = ref('1')

const showGuide = () => {
  settings.firstLoad = true
  // 重新加载页面
  location.reload()
}
</script>

<style scoped>
/* Your component's CSS styles go here */
</style>
