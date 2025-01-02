<template>
  <div id="app" class="app">
    <h1>美少女肌地-追溯码视频查询</h1>
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
import { ref } from "vue";
import SearchBox from "./components/SearchBox.vue";

export default {
  components: {
    SearchBox,
  },
  setup() {
    const videoUrl = ref(""); // 视频文件路径
    const searched = ref(false); // 是否完成搜索

    const handleSearch = (code) => {
      const filePath = `/videos/${code}.MOV`; // 根据追溯码生成文件路径
      fetch(filePath, { method: "HEAD" }) // 检查文件是否存在
        .then((response) => {
          if (response.ok) {
            videoUrl.value = filePath;
          } else {
            videoUrl.value = "";
          }
          searched.value = true;
        })
        .catch(() => {
          videoUrl.value = "";
          searched.value = true;
        });
    };

    return {
      videoUrl,
      searched,
      handleSearch,
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
