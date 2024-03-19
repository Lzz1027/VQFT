<template>
  <div class="menu-selector-container">
    <a-select
      class="menu-selector"
      ref="select"
      v-model:value="dataPath"
      @focus="focus"
      @change="handleChange"
    >
      <a-select-option value="gof">Game Of Throne Datasets</a-select-option>
      <a-select-option value="jprailway"
        >Japan Railway Station Datasets</a-select-option
      >
    </a-select>

    <Transition name="loading">
      <div v-show="isLoading" class="menu-selector-loading">
        <a-spin size="large" />
        loading datasets...
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '/src/stores/settings'
import { loadDataSet } from '/src/api/api.js'

// 加载
const isLoading = ref(false)

// 读取设置
const settingsStore = useSettingsStore()
const dataPath = ref(settingsStore.currentDataSet)

// 切换数据集
const handleChange = (value) => {
  // /获取当前时间
  let time = new Date().getTime()
  isLoading.value = true
  loadDataSet({
    dataSet: value,
  }).then((res) => {
    // /获取当前时间
    let time2 = new Date().getTime()
    // 如果时间小于1000ms，就等待1000ms
    if (time2 - time < 1000) {
      setTimeout(() => {
        settingsStore.setCurrentDataSet(value)
        settingsStore.setDataSetInfo(res.info)
        isLoading.value = false
        console.log(res)
      }, 1000 - (time2 - time))
    } else {
      settingsStore.setCurrentDataSet(value)
      settingsStore.setDataSetInfo(res.info)
      isLoading.value = false
      console.log(res)
    }
  })
}

onMounted(() => {
  handleChange(dataPath.value)
})
</script>

<style scoped>
.menu-selector-container {
  margin: 0px 10px;
  height: 50px;
}
.menu-selector {
  width: 100%;
  background-color: #f6f6f6;
}

:global(.menu-selector .ant-select-selector) {
  background-color: #eaecf0 !important;
  border: 1px solid #a7d7f9 !important;
  color: #000 !important;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}

:global(.menu-selector .ant-select-arrow) {
  color: #000 !important;
}

:global(.menu-selector .ant-menu-item) {
  background-color: #eaecf0 !important;
}

.menu-selector-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  z-index: 99;
  background-color: rgba(255, 255, 255, 0.5);
  color: #000;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: larger;
}

.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.5s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}
</style>
