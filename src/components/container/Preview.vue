<template>
  <div class="preview-container">
    <div class="preview-header">
      <div v-if="dataStore.currentNode == ''">
        Search Preview
      </div>
      <div v-else>
        Current Node: {{ dataStore.currentNode }}
      </div>
    </div>
    <div class="preview-tips" v-if="dataStore.currentNode == ''">
      <div>Search for a term in the search bar to see the results here.</div>
    </div>
    <div class="preview-main" v-if="!dataStore.currentNode == ''">
      <div class="preview-main-list">
        <PreviewItem
          :data="item"
          v-for="item in previewList"
          :key="item.id"
        />
        <a-button type="" @click="showMore" v-if="canShowMore">Show More</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useDataStore } from '/src/stores/data'
import PreviewItem from './PreviewItem.vue'

const dataStore = useDataStore()

const visibleCount = ref(25)
const previewList = computed(() => {
  return dataStore.nodes[dataStore.currentNode].searchList.slice(0, visibleCount.value)
})

const showMore = () => {
  visibleCount.value += 5
}

const canShowMore = computed(() => {
  return visibleCount.value < dataStore.nodes[dataStore.currentNode].searchList.length
})
</script>

<style scoped>
.preview-container {
  margin: 0px 10px;
  padding: 0px 4px 10px 10px;
  height: calc(100% - 50px);
  background: #eaecf0;
  border: 1px solid #a7d7f9;
  border-radius: 6px;
}

.preview-header {
  color: #000;
  height: 40px;
  line-height: 40px;
}

/* 水平居中， 垂直居中，浅色显示 */
.preview-tips {
  height: calc(100% - 50px);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 25px;
}

.preview-main {
  width: 100%;
  flex: 0;
  border-radius: 6px;
  height: calc(100% - 50px);
  padding-right: 5px;
  overflow-y: auto;
}

.preview-main::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.preview-main:hover::-webkit-scrollbar-thumb {
  background-color: #f6f6f6;
  border-radius: 6px;
}

.preview-main-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
