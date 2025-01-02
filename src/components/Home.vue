<template>
  <div id="app" class="app">
    <h1 @dblclick="getVideoCount">美少女肌地-追溯码视频查询</h1>
    <SearchBox @search="handleSearch" />
    <div v-if="videoUrl" class="result">
      <h2>查询结果</h2>
      <video controls :src="videoUrl" width="400"></video>
    </div>
    <div v-else-if="searched" class="no-result">
      <p>未找到对应视频！</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import SearchBox from "./SearchBox.vue";
import { getBucketContents } from "@/services/cosService"; // 调用 COS 服务

export default {
  name: "App",
  components: {
    SearchBox,
  },
  setup() {
    const videoUrl = ref(""); // 视频文件路径
    const searched = ref(false); // 是否完成搜索
    const fileCache = ref({}); // 缓存文件名和对应的完整路径

    // 获取存储桶内容并缓存文件名和路径
    const fetchFiles = async () => {
      try {
        const contents = await getBucketContents();
        fileCache.value = contents.reduce((cache, file) => {
          const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, ""); // 去掉文件后缀
          cache[fileNameWithoutExt] = file.signedUrl; // 映射文件名到签名 URL
          return cache;
        }, {});
        console.log("文件缓存完成：", fileCache.value);
      } catch (error) {
        console.error("获取存储桶内容失败：", error);
      }
    };

    // 处理搜索
    const handleSearch = (code) => {
      if (fileCache.value[code]) {
        videoUrl.value = fileCache.value[code]; // 设置视频 URL
      } else {
        videoUrl.value = ""; // 未找到视频
      }
      searched.value = true; // 标记为已完成搜索
    };

    const getVideoCount = () => {
      const fileCount = Object.keys(fileCache.value).length;
      alert(`当前缓存的视频文件数量为：${fileCount}`);
    };

    onMounted(fetchFiles); // 页面加载时获取文件内容

    return {
      videoUrl,
      searched,
      handleSearch,
      getVideoCount,
    };
  },
};
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}
.result {
  margin-top: 20px;
  text-align: center;
}
.no-result {
  margin-top: 20px;
  color: red;
}
</style>
