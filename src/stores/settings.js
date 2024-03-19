import { defineStore } from 'pinia';

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    firstLoad: true,
    currentDataSet: 'gof',
    dataSetInfo: {},
  }),
  actions: {
    setCurrentDataSet(currentDataSet) {
      this.currentDataSet = currentDataSet;
    },
    setDataSetInfo(dataSetInfo) {
      this.dataSetInfo = dataSetInfo;
    },
  },
  persist: true,
});
