<template>
  <div>
    <h1>文件列表</h1>
    <ul>
      <li v-for="file in files" :key="file.name">
        <p>文件名: {{ file.name }}</p>
        <p>大小: {{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
        <p>修改时间: {{ new Date(file.lastModified).toLocaleString() }}</p>
        <video
          v-if="isVideo(file.name)"
          controls
          :src="file.signedUrl"
          width="400"
        ></video>
        <a v-else :href="file.signedUrl" target="_blank">下载文件</a>
      </li>
    </ul>
  </div>
</template>

<script>
import { getBucketContents } from "@/services/cosService";

export default {
  data() {
    return {
      files: [], // 存储桶文件列表
    };
  },
  methods: {
    async fetchFiles() {
      try {
        this.files = await getBucketContents(); // 获取文件列表
      } catch (error) {
        console.error("获取文件列表失败：", error);
      }
    },
    isVideo(fileName) {
      // 检查文件是否为视频
      return /\.(mov|mp4|avi)$/i.test(fileName);
    },
  },
  mounted() {
    this.fetchFiles(); // 页面加载时获取文件列表
  },
};
</script>
