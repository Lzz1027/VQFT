<template>
  <a-image class="wiki-image" :src="fileUrl" alt="Wikidata Image">
    <template #placeholder>
      <a-spin></a-spin>
    </template>
  </a-image>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  pageUrl: String,
})

console.log(decodeURIComponent(props.pageUrl))
// http://commons.wikimedia.org/wiki/File:LBCC_2014_-_Game_of_Thrones_(15383053186).jpg
const fileUrl = ref('')

const getFileUrl = () => {
  const baseUrl =
    ' https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file'
  const fileName = decodeURIComponent(props.pageUrl).split(':').pop()
  fileUrl.value = `${baseUrl}/${fileName}&width=300`
}

onMounted(() => {
  getFileUrl()
})
</script>

<style scoped>
.wiki-image {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
