import { createApp } from "vue";
import ArcoVue from "@arco-design/web-vue";
import ArcoVueIcon from "@arco-design/web-vue/es/icon";
import "./style.css";
import App from "./App.vue";
import "@arco-design/web-vue/dist/arco.css";

createApp(App).use(ArcoVue).use(ArcoVueIcon).mount("#app");
