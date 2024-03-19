import { createApp } from 'vue';
import pinia from "./stores";
import './style.css';
import Antd from 'ant-design-vue';
import App from './App.vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);

app.use(pinia).use(Antd).mount("#app");