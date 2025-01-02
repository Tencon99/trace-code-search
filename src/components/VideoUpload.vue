<template>
  <div class="video-upload">
    <input type="file" accept="video/*" @change="handleFileUpload" />
    <div v-if="trackingCode" class="result">
      <p>
        追溯码：<strong>{{ trackingCode }}</strong>
      </p>
      <video controls :src="videoUrl" width="400"></video>
    </div>
  </div>
</template>

<script>
import videoService from "../services/videoService";

export default {
  data() {
    return {
      trackingCode: "",
      videoUrl: "",
    };
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const { trackingCode, url } = videoService.uploadVideo(file);
      this.trackingCode = trackingCode;
      this.videoUrl = url;
    },
  },
};
</script>

<style>
.video-upload {
  margin: 20px 0;
  text-align: center;
}
video {
  margin-top: 10px;
  border: 1px solid #ccc;
}
</style>
