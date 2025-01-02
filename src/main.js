import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { getBucketContents, getSignedUrl } from "./services/cosService";

const app = createApp(App);

app.config.globalProperties.$cos = {
  getBucketContents,
  getSignedUrl,
};

app.use(router);
app.mount("#app");
