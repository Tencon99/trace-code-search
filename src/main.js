import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { getBucketContents, getSignedUrl } from "./services/cosService";
import "./styles/global.less"; // 引入全局样式

const app = createApp(App);

app.config.globalProperties.$cos = {
  getBucketContents,
  getSignedUrl,
};

app.use(router);
app.mount("#app");
