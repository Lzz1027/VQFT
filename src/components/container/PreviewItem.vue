<template>
  <!-- item 容器 -->
  <div class="preview-main-list-item">
    <div class="item-title">
      <!-- 节点标题 -->
      <a
        class="item-title-label"
        :href="props.data.properties.uri ? props.data.properties.uri : ''"
        target="_blank"
      >
        <span v-if="props.data.properties.rdfs__label">
          {{ props.data.properties.rdfs__label }}
        </span>
        <span v-else> Anoymous Node </span>
      </a>

      <!-- 显示更多按钮 -->
      <div class="show-more-button" @click="showDetail = !showDetail">
        <DownOutlined v-show="!showDetail" />
        <UpOutlined v-show="showDetail" />
      </div>
    </div>

    <!-- 节点图片 -->
    <div class="item-image" v-if="showDetail && props.data.imageUrl.length > 0">
      <WikiImage v-for="uri in props.data.imageUrl" :pageUrl="uri" />
    </div>

    <!-- 节点 label -->
    <div v-show="showDetail" class="label-container">
      <span
        class="label-tag"
        v-for="label in props.data.labels"
        :style="{ backgroundColor: stringToColor(label) }"
      >
        {{ getLabelInStore(label) }}
      </span>
    </div>

    <!-- 节点 prop -->
    <div  v-show="showDetail" class="prop-contianer" style="width: 100%">
      <div class="prop-row" v-for="(value, key) in props.data.properties">
        <div class="prop-row-prop">{{ getPropInStore(key) }}</div>
        <div class="prop-row-value">{{ value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { ref } from 'vue'
import { stringToColor } from '../../utils'
import { useSettingsStore } from '/src/stores/settings'

import WikiImage from './WikiImage.vue'

const settingsStore = useSettingsStore()

const props = defineProps({
  data: Object,
})

const showDetail = ref(false)

const getLabelInStore = (key) => {
  // 在 settingsStore.dataSetInfo.nodeLabelSet 中查找 key 对应的 label
  return settingsStore.dataSetInfo.nodeLabelSet.find((item) => item.key === key)
    .label
}

const getPropInStore = (key) => {
  // 在 settingsStore.dataSetInfo.nodeLabelSet 中查找 key 对应的 label

  return settingsStore.dataSetInfo.nodePropertySet.find(
    (item) => item.key === key
  ).label
}
</script>

<style scoped>
.preview-main-list-item {
  position: relative;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  padding: 0px 10px;
  border-radius: 6px;
  background-color: #ccc;
  color: #000;
}

.item-title {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.item-title-label {
  color: #000;
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  text-align: left;
  line-height: 20px;
}

.item-image {
  margin-bottom: 10px;
}

.match-word-container {
  border-radius: 6px;
  margin-left: 10px;
  text-align: left;
  /* 自动换行 */
  word-wrap: break-word;
  white-space: nowrap;
}

.match-word-item {
  max-width: 100px;
  text-align: center;
  height: 20px;
  line-height: 20px;
  color: #fff;
  background: #222;
  margin: 2px;
  padding: 2px 6px;
  border-radius: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.show-more-button {
  cursor: pointer;
}

.label-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.label-tag {
  display: inline-block;
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  border-radius: 6px;
  margin: 0px 5px 5px 0px;

  color: #fff;
  text-shadow: black 1px 1px 1px;
  border: 1px dashed #fff;
}

.prop-contianer {
  width: 100%;
  overflow: hidden;
}

.prop-row {
  width: 100%;
  height: 30px;
  line-height: 30px;
  display: flex;
  text-align: left;
  margin-bottom: 5px;
  font-size: 13px;
}

.prop-row-prop {
  width: 100px;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.1);
  padding: 0px 5px;
  border-radius: 6px;
  height: 30px;
  line-height: 30px;
  overflow: hidden;
}

.prop-row-value {
  margin-left: 5px;
  flex: 1;
  height: 30px;
  background: rgba(0, 0, 0, 0.1);
  padding: 0px 5px;
  border-radius: 6px;
  line-height: 30px;
  overflow: hidden;
}
</style>
