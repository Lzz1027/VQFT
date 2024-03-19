import { defineStore } from 'pinia'
import { searchInDB } from '../api/api'
import { toNumber } from 'lodash-es'
import { useSettingsStore } from './settings'

export const useDataStore = defineStore('data', {
  state: () => ({
    currentNode: '',
    nodes: {},
    edges: {},
  }),
  actions: {
    setCurrentNode(current) {
      this.currentNode = current
    },

    addNode(newNode) {
      this.nodes[newNode.label] = { nodeInfo: newNode, searchList: [] }

      // 根据 idList 访问 neo4j 获取节点信息
      // searchInDB({
      //   array: this.previewList[label].idList.map((id) => toNumber(id)),
      // }).then((res) => {
      //   this.previewList[label]['data'] = res.map((item) => {
      //     let imageUrl = []
      //     let newRelations = []
      //     if (item._fields[1] !== null) {
      //       item._fields[1].forEach((relation) => {
      //         if (relation.rel !== null) {
      //           relation.rel['label'] = this.getLabel(relation.rel.type)
      //           if (relation.rel.label.includes('image')) {
      //             imageUrl.push(relation.target.properties.uri)
      //           }
      //           newRelations.push(relation)
      //         }
      //       })
      //     } else {
      //       newRelations = []
      //     }

      //     return {
      //       id: item._fields[0].identity.low,
      //       labels: item._fields[0].labels,
      //       properties: item._fields[0].properties,
      //       relations: newRelations,
      //       imageUrl: imageUrl,
      //     }
      //   })
      // })
    },

    removeNode(label) {
      delete this.nodes[label]
    },

    // getLabel(id) {
    //   const settingsStore = useSettingsStore()
    //   return settingsStore.dataSetInfo.relationLabelSet.find(
    //     (item) => item.key === id
    //   ).label
    // },
  },
})
