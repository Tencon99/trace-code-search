import { createRouter, createWebHashHistory } from "vue-router";
import COSPrivateReader from "../components/COSPrivateReader.vue";
import Home from "../components/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home, // 默认页面
  },
  {
    path: "/files",
    name: "COSPrivateReader",
    component: COSPrivateReader, // COSPrivateReader 页面
  },
];

const router = createRouter({
  history: createWebHashHistory(), // 使用 hash 模式
  routes,
});

export default router;
