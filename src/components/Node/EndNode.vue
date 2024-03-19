<template>
  <Handle
    :id="props.label + '-' + 'end'"
    class="end-handle"
    type="target"
    :position="Position.Left"
  />
  <Handle
    :id="props.label + '-' + 'start'"
    class="start-handle"
    type="source"
    :position="Position.Right"
  />
  <!-- a-badge 右上角搜索徽标 -->
  <a-badge
    :count="
      dataStore.nodes[props.label]
        ? dataStore.nodes[props.label].searchList.length
        : 0
    "
    :overflow-count="999"
  >
    <!-- 自定义节点 -->
    <div class="common-node">
      <!-- 节点标题 -->
      <div class="common-node-header">
        <!-- 拖拽栏 -->
        <div class="node-drag-handle">
          <HolderOutlined />
        </div>
        <!-- 节点名称 label -->
        <div class="common-node-header-label" @click="selectCurrentNode">
          {{ props.label }}
        </div>
      </div>
      <!-- 节点过滤器 -->
      <div class="common-node-search-container">
        <!-- Label 选择 -->
        <a-select
          v-model:value="nodeData.nodeLabels"
          mode="multiple"
          placeholder="Add labels to the node"
          style="width: 100%"
          :options="labelOptions"
        >
        </a-select>
        <!-- props 已添加的过滤器 -->
        <div
          class="props-selected-container"
          v-for="prop in nodeData.nodeProps"
        >
          <div
            class="props-selected-item"
            style="
              border-radius: 6px 0px 0px 6px;
              border-right: 1px solid #dedede;
            "
          >
            {{ prop.key }}
          </div>
          <div
            class="props-selected-item"
            style="border-right: 1px solid #dedede"
          >
            {{ prop.op }}
          </div>
          <div
            class="props-selected-item"
            style="border-right: 1px solid #dedede"
          >
            {{ prop.value }}
          </div>
          <div
            class="props-selected-item"
            style="
              border-radius: 0px 6px 6px 0px;
              width: 10%;
              padding: 0;
              cursor: pointer;
            "
            @click="deleteProp(prop.key)"
          >
            <MinusOutlined />
          </div>
        </div>
        <!-- props 新增过滤器 -->
        <div compact style="width: 100%; border-radius: 6px; display: flex">
          <a-select
            class="props-key-select"
            show-search
            v-model:value="newProps.key"
            placeholder="prop"
            style="width: 30%; text-align: center"
            :options="propsOptions"
            :filter-option="filterFunction"
            @select="onPropSelect"
            @search="onPropSearch"
          >
          </a-select>
          <a-select
            class="props-op-select"
            show-search
            v-model:value="newProps.op"
            placeholder="op"
            style="width: 30%; text-align: center"
            :options="opOptions"
            :filter-option="filterFunction"
          ></a-select>
          <a-auto-complete
            class="props-value-complete"
            v-model:value="newProps.value"
            :options="newPropsValueOptions"
            placeholder="value"
            @search="onSearch"
            @select="onSelect"
            style="width: 30%; text-align: center; border-radius: 0"
          >
          </a-auto-complete>
          <div
            class="props-selected-item"
            style="
              width: 10%;
              border-radius: 6px;
              height: 32px;
              padding: 0;
              cursor: pointer;
            "
            @click="submitNewProps"
          >
            <PlusOutlined />
          </div>
        </div>
      </div>
    </div>
  </a-badge>
</template>

<script setup>
import { computed, ref, reactive, watch, onMounted } from 'vue'
import { useNode, Position, Handle } from '@vue-flow/core'
import { searchProp } from '/src/api/api.js'
import { debounce } from 'lodash-es'
import {
  PlusCircleOutlined,
  PlusOutlined,
  HolderOutlined,
  MinusOutlined,
} from '@ant-design/icons-vue'
import { useDataStore } from '/src/stores/data'
import { useSettingsStore } from '/src/stores/settings'
import { searchInDB } from '../../api/api'

// 获取 pinia 的 Store
const dataStore = useDataStore()
const settingsStore = useSettingsStore()

// 获取 vue-flow 的 node
const { node } = useNode()

// 定义props
const props = defineProps(['label'])

// 选中当前节点作为当前节点
const selectCurrentNode = () => {
  dataStore.setCurrentNode(props.label)
}

// 定义nodeData，其中保存了添加的过滤属性
const nodeData = reactive({
  nodeProps: [],
  nodeLabels: [],
})

// label 选项
const labelOptions = computed(() => {
  if (settingsStore.dataSetInfo) {
    return settingsStore.dataSetInfo.nodeLabelSet.map((item) => {
      return {
        label: item.label,
        value: item.key,
      }
    })
  } else {
    return []
  }
})

// 全文搜索-新建属性输入框 响应式数据
const newProps = reactive({
  key: undefined,
  op: undefined,
  value: undefined,
})
// 全文搜索-绑定查询选项数组
const newPropsValueOptions = ref([])
// 执行全文搜索，使用防抖，获取搜索列表
const onSearch = debounce(async () => {
  newPropsValueOptions.value = []
  const res = await onSearchProp(newProps.key, newProps.value, newProps.op)
  // 如果 res 为数组，且长度大于0
  if (Array.isArray(res) && res.length > 0) {
    // 统计matchData中出现的词频
    let matchData = {}
    res.forEach((item) => {
      Object.keys(item.matchData.metadata).forEach((key) => {
        if (matchData[key]) {
          matchData[key] += 1
        } else {
          matchData[key] = 0
        }
      })
    })
    // 对于matchData中的词频进行排序
    let matchDataSorted = Object.keys(matchData).sort((a, b) => {
      if (matchData[a] === matchData[b]) {
        return a.localeCompare(b)
      } else {
        return matchData[b] - matchData[a]
      }
    })
    // 生成选项
    newPropsValueOptions.value = matchDataSorted.map((item) => {
      return {
        value: item,
        label: item,
      }
    })
  }
}, 300)

const filterFunction = (inputValue, option) => {
  if (option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1) {
    return true;
  }
}
// 全文搜索
const onSearchProp = async (prop, query, op) => {
  if (prop === undefined || query === '' || query === undefined) {
    return
  } else {
    if (op === 'EQUALS') {
      const res = await searchProp({ prop: prop, query: query })
      return res
    } else if (op === 'CONTAINS') {
      const res = await searchProp({ prop: prop, query: '*' + query + '*' })
      return res
    } else if (op === 'STARTS WITH') {
      const res = await searchProp({ prop: prop, query: query + '*' })
      return res
    } else if (op === 'ENDS WITH') {
      const res = await searchProp({ prop: prop, query: '*' + query })
      return res
    } else {
      const res = await searchProp({ prop: prop, query: '*' + query + '*' })
      return res
    }
  }
}

const submitNewProps = () => {
  if (
    newProps.key === undefined ||
    newProps.op === undefined ||
    newProps.value === undefined
  ) {
    return
  }

  newPropsValueOptions.value = []
  nodeData.nodeProps.push({
    key: newProps.key,
    op: newProps.op,
    value: newProps.value,
  })

  newProps.key = undefined
  newProps.op = undefined
  newProps.value = undefined
}

const deleteProp = (key) => {
  newPropsValueOptions.value = []
  // 在 nodeProps 中删除 key 对应的对象
  nodeData.nodeProps = nodeData.nodeProps.filter((item) => {
    return item.key !== key
  })
}

const opOptions = [
  {
    label: 'CONTAINS',
    value: 'CONTAINS',
  },
  {
    label: 'STARTS WITH',
    value: 'STARTS WITH',
  },
  {
    label: 'ENDS WITH',
    value: 'ENDS WITH',
  },
  {
    label: 'EQUALS',
    value: 'EQUALS',
  },
]

// 属性选项
const propsOptions = computed(() => {
  // 检查是否有数据集信息
  if (settingsStore.dataSetInfo) {
    // 如果没有限制 label，则返回所有属性
    if (nodeData.nodeLabels.length === 0) {
      return settingsStore.dataSetInfo.nodePropertySet
        .map((item) => {
          return {
            label: item.label,
            value: item.key,
          }
        })
        .sort((a, b) => {
          return a.label.localeCompare(b.label)
        })
    } else {
      // 如果有输入，则返回输入的属性的交集
      let propsSet = new Set()
      nodeData.nodeLabels.forEach((labelItem) => {
        let thisLabelSet = new Set(
          settingsStore.dataSetInfo.nodeLabelList[labelItem]
        )

        if (propsSet.size === 0) {
          propsSet = thisLabelSet
        } else {
          propsSet = new Set([...propsSet].filter((x) => thisLabelSet.has(x)))
        }
      })

      // 在settingStore.dataSetInfo.nodePropertySet中找到对应的属性，按照 label的值排序后返回
      return settingsStore.dataSetInfo.nodePropertySet
        .filter((item) => {
          return propsSet.has(item.key)
        })
        .map((item) => {
          return {
            label: item.label,
            value: item.key,
          }
        })
        .sort((a, b) => {
          return a.label.localeCompare(b.label)
        })
    }
  } else {
    return []
  }
})

// 从 settings 中获取 label
const getLabel = (id) => {
  return settingsStore.dataSetInfo.relationLabelSet.find(
    (item) => item.key === id
  ).label
}

watch(nodeData, async () => {
  node.data['nodeLabels'] = nodeData.nodeLabels
  dataStore.nodes[props.label].nodeLabels = nodeData.nodeLabels
  dataStore.nodes[props.label].nodeProps = nodeData.nodeProps
  // 监控 nodeData 的变化，分别获取搜索结果，取交集, 全部完成后，存入 dataStore

  // 要区分两种 refSet 为空的情况，一种是没有任何过滤条件，一种是过滤条件的交集为空
  let refSet = new Set()
  let refSetFlag = false
  for (let i = 0; i < nodeData.nodeProps.length; i++) {
    if (
      nodeData.nodeProps[i].key !== undefined &&
      nodeData.nodeProps[i].value !== undefined
    ) {
      let thisRefSet = new Set()
      let queryItem = nodeData.nodeProps[i].value
      if (nodeData.nodeProps[i].op === 'EQUALS') {
        queryItem = nodeData.nodeProps[i].value
      } else if (nodeData.nodeProps[i].op === 'CONTAINS') {
        queryItem = '*' + nodeData.nodeProps[i].value + '*'
      } else if (nodeData.nodeProps[i].op === 'STARTS WITH') {
        queryItem = nodeData.nodeProps[i].value + '*'
      } else if (nodeData.nodeProps[i].op === 'ENDS WITH') {
        queryItem = '*' + nodeData.nodeProps[i].value
      } else {
        queryItem = '*' + nodeData.nodeProps[i].value + '*'
      }
      const res = await searchProp({
        prop: nodeData.nodeProps[i].key,
        query: queryItem,
      })
      res.forEach((resItem) => {
        thisRefSet.add(resItem.ref)
      })
      if (i === 0) {
        refSet = thisRefSet
        refSetFlag = true
      } else {
        refSet = new Set([...refSet].filter((x) => thisRefSet.has(x)))
      }
    }
  }
  selectCurrentNode()
  searchInDB({
    array: refSetFlag ? Array.from(refSet).map((id) => parseInt(id)) : null,
    labels: nodeData.nodeLabels,
  }).then((res) => {
    dataStore.nodes[props.label].searchList = res.map((item) => {
      let imageUrl = []
      let newRelations = []
      if (item._fields[1] !== null) {
        item._fields[1].forEach((relation) => {
          if (relation.rel !== null) {
            relation.rel['label'] = getLabel(relation.rel.type)
            if (relation.rel.label.includes('image')) {
              imageUrl.push(relation.target.properties.uri)
            }
            newRelations.push(relation)
          }
        })
      } else {
        newRelations = []
      }

      return {
        id: item._fields[0].identity.low,
        labels: item._fields[0].labels,
        properties: item._fields[0].properties,
        relations: newRelations,
        imageUrl: imageUrl,
      }
    })
  })
})
</script>

<style scoped>
.common-node {
  width: 350px;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  background-color: #93b7b7;
  cursor: default;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}

.common-node-header {
  color: #000;
  text-align: center;
  font-size: 20px;
  position: relative;
  padding: 10px;
}

.node-drag-handle {
  padding: 10px;
  cursor: move;
  position: absolute;
  left: 0;
  top: 0;
  width: 10px;
}
.node-search-bar {
  width: 100%;
  border-radius: 6px;
}

.common-node-header-label {
}

.common-node-search-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.props-key-select .ant-select-selector {
  border-radius: 6px 0px 0px 6px !important;
}

.props-op-select .ant-select-selector {
  border-radius: 6px 0px 0px 6px !important;
}

.props-value-complete .ant-select-selector {
  border-radius: 6px 0px 0px 6px !important;
}

.ant-select-selector {
  border-radius: 6px 0px 0px 6px !important;
}

.props-selected-container {
  display: flex;
  flex-direction: row;
}

.props-selected-item {
  width: 30%;
  height: 32px;
  background-color: #fff;
  text-align: center;
  line-height: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 10px;
}
</style>