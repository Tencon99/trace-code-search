import { createRouter, createWebHashHistory } from "vue-router";
import COSPrivateReader from "../components/COSPrivateReader.vue";
import TutorialVideo from "../components/TutorialVideo.vue";
import Home from "../components/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home, // 默认页面
    meta: {
      title: "单支防伪追溯查询 - 美少女肌地", // 页面标题
    },
  },
  {
    path: "/files",
    name: "COSPrivateReader",
    component: COSPrivateReader, // COSPrivateReader 页面
  },
  {
    path: "/tutorial",
    name: "Tutorial",
    component: TutorialVideo, // TutorialVideo 页面
    meta: {
      title: "滚针教程 - 美少女肌地", // 页面标题
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(), // 使用 hash 模式
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title || "美少女肌地";
  }
  next();
});

export default router;
