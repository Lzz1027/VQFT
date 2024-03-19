<template>
  <div v-if="props.data.type == 'error'" class="cypher-code">
    {{ props.data.data.content }}
  </div>

  <div v-if="props.data.type == 'run'" class="cypher-code">
    <div
      class="cypher-result"
      v-if="cypherResult[0]"
      style="
        width: 100%;
        background-color: #eee;
        border-radius: 6px;
        padding: 10px;
      "
    >
      <!-- 表头 -->
      <div class="cypher-result-item">
        <div class="cypher-result-item-index">index</div>
        <div
          class="cypher-result-item-value"
          v-for="key in cypherResult[0].keys"
        >
          {{ key }}
        </div>
      </div>
      <!-- 表格项 -->
      <div class="cypher-result-item" v-for="(item, index) in cypherResult">
        <div class="cypher-result-item-index">
          {{ index }}
        </div>
        <div
          class="cypher-result-item-value"
          v-for="(value, valueIndex) in item._fields"
        >
          <!-- id -->
          <div class="cypher-result-item-value-item">
            <div class="cypher-result-item-value-item-key">id</div>
            <div class="cypher-result-item-value-item-value">
              {{ value.identity.low }}
            </div>
          </div>
          <!-- labels -->
          <div class="cypher-result-item-value-item">
            <div class="cypher-result-item-value-item-key">labels</div>
            <div class="cypher-result-item-value-item-value">
              {{ value.labels.toString() }}
            </div>
          </div>
          <!-- properties -->
          <div class="cypher-result-item-value-item">
            <div class="cypher-result-item-value-item-key">properties</div>
            <div class="cypher-result-item-value-item-value">
              <div
                class="cypher-result-item-prop"
                v-for="(prop, propIndex) in value.properties"
              >
                <div class="cypher-result-item-prop-key">
                  {{ propIndex }}
                </div>
                <div class="cypher-result-item-prop-value">
                  {{ prop }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { runCode } from '../../api/api'

const props = defineProps({
  data: Object,
})

const genCypherFromData = (data) => {
  console.log(data)
  let cypher = ''
  // 根据 data 中的 data.nodes 和 data.edges 生成 cypher 查询语句
  cypher = 'MATCH '
  let returnCypher = '\nRETURN DISTINCT '
  let returnNodes = []
  let whereCypher = '\nWHERE '
  let whereProps = []
  data.nodes.forEach((node, index) => {
    if (node.type == 'end') {
      console.log(node)
      returnNodes.push(node.label)
    }

    let thisNodeCypher = ''
    if (index > 0) {
      thisNodeCypher += ', '
    }
    thisNodeCypher += `(${node.label}`
    if (node.data.nodeLabels) {
      node.data.nodeLabels.forEach((label, labelIndex) => {
        thisNodeCypher += `:${label}`
      })
    }
    if (node.data.nodeProps) {
      thisNodeCypher += ' {'
      node.data.nodeProps.forEach((prop, propIndex) => {
        // 如果prop的op为 EQUALS，则放入查询条件中，否则，放入 WHERE 条件中
        if (prop.op == 'EQUALS') {
          if (propIndex > 0) {
            thisNodeCypher += ', '
          }
          thisNodeCypher += `${prop.key}: '${prop.value}'`
        } else {
          whereProps.push(
            `${node.label}.${prop.key} =~ '(?i).*${prop.value}.*'`
          )
        }
      })
      thisNodeCypher += '}'
    }
    thisNodeCypher += ')'
    cypher += thisNodeCypher
  })

  data.edges.forEach((edge, index) => {
    let thisEdgeCypher = ', '
    thisEdgeCypher += `(${edge.sourceNode.label})-[${edge.data.label}`
    if (edge.data.labels) {
      thisEdgeCypher += `:${edge.data.labels}`
    }
    thisEdgeCypher += ']->'
    thisEdgeCypher += `(${edge.targetNode.label})`
    cypher += thisEdgeCypher
  })

  returnNodes.forEach((node, index) => {
    if (index > 0) {
      returnCypher += ', '
    }
    returnCypher += node
  })

  if (whereProps.length > 0) {
    whereCypher += whereProps.join(' AND ')

    cypher += whereCypher
  }

  cypher += returnCypher

  return cypher
}

const cypherCode = ref('')
const cypherResult = ref([])

onMounted(() => {
  if (props.data.type == 'run') {
    cypherCode.value = genCypherFromData(props.data.data)
    console.log('fuck')
    runCode({ query: cypherCode.value }).then((res) => {
      cypherResult.value = res
    })
  }

  watch(props, () => {
    if (props.data.type == 'run') {
      cypherCode.value = genCypherFromData(props.data.data)
      console.log('fuck')
      runCode({ query: cypherCode.value }).then((res) => {
        cypherResult.value = res
      })
    }
  })
})
</script>

<style scoped>
.cypher-code {
  white-space: pre-wrap;
  max-height: 600px;
}

.cypher-result {
  max-height: 600px;
  overflow-y: auto;
}

.cypher-result-item {
  display: flex;
  margin-bottom: 5px;
}

.cypher-result-item-index {
  width: 50px;
  background-color: #d5e0dd;
  border-radius: 6px;
  margin-right: 5px;
  padding: 5px;
}

.cypher-result-item-value {
  width: 50px;
  background-color: #f0e3d7;
  border-radius: 6px;
  margin-right: 5px;
  padding: 5px;
  flex: 1;
}

.cypher-result-item-value-item {
  display: flex;
}
.cypher-result-item-value-item-key {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px;
  border-radius: 6px;
  margin-bottom: 3px;
  margin-right: 3px;
  width: 80px;
}
.cypher-result-item-value-item-value {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px;
  border-radius: 6px;
  margin-bottom: 3px;
  width: calc(100% - 80px);
  display: flex;
  flex-direction: column;
}

.cypher-result-item-prop {
  display: flex;
  flex-direction: row;
  margin-bottom: 3px;
}

.cypher-result-item-prop-key {
  width: 120px;
  background-color: rgba(255, 255, 255, 0.3);
  padding: 2px;
  margin-right: 3px;
  border-radius: 6px;
}
.cypher-result-item-prop-value {
  width: calc(100% - 120px);
  background-color: rgba(255, 255, 255, 0.3);
  padding: 2px;
  border-radius: 6px;
  word-wrap: break-word;
}
</style>
