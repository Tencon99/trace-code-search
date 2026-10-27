<template>
  <div class="tutorial">
    <h1 class="title primary-text">居家水光滚针教程</h1>

    <div v-if="videoUrl" class="video-container">
      <video
        ref="videoPlayer"
        controls
        :src="cachedVideoUrl || videoUrl"
        width="400"
        preload="metadata"
        :poster="posterUrl"
        @play="onVideoPlay"
        @ended="onVideoEnd"
        controlslist="nodownload"
        @contextmenu.prevent
      ></video>
    </div>
    <div v-else class="loading">
      <p>正在加载视频，请稍候...</p>
    </div>
    <FloatingButton />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { getBucketContents } from "@/services/cosService"; // 调用 COS 服务
import FloatingButton from "@/components/FloatingButton.vue";
import { videoCache } from "@/services/videoCache"; // 引入视频缓存服务
import { trackEvent } from "@/services/trackEvent";

export default {
  name: "TutorialVideo",
  components: {
    FloatingButton,
  },
  mounted() {
    const initEvent = {
      eventName: "page_init",
      extraParams: {
        page: this.$route.name,
      },
    };
    trackEvent(initEvent); // 调用埋点方法
  },
  setup() {
    const videoUrl = ref(""); // 视频文件路径
    const posterUrl = ref(""); // 视频封面路径
    const cachedVideoUrl = ref(null);
    const hasPlayed = ref(false); // 是否首次播放视频

    // 获取 COS 存储桶中的视频文件和封面
    const fetchVideo = async () => {
      try {
        const contents = await getBucketContents();
        // 查找固定文件路径
        const videoFile = contents.find((file) => file.name === "滚针教程.mp4");
        const posterFile = contents.find(
          (file) => file.name === "滚针教程-cover.jpg"
        );

        if (videoFile) {
          videoUrl.value = videoFile.signedUrl;

          // **先播放视频，不影响播放**
          const cachedVideo = await videoCache.getCachedVideo(videoUrl.value); // 获取缓存视频
          if (cachedVideo) {
            cachedVideoUrl.value = cachedVideo;
            console.log("✅ 使用本地缓存视频");
          } else {
            console.log("⚠️ 缓存中没有该视频，开始后台下载...");
            // 在后台并行下载视频，不阻塞用户播放
            videoCache.downloadAndCacheVideo(videoUrl.value);
          }
        } else {
          console.error("视频文件未找到");
        }

        if (posterFile) {
          posterUrl.value = posterFile.signedUrl;
        } else {
          console.error("封面文件未找到");
        }
      } catch (error) {
        console.error("获取存储桶内容失败：", error);
      }
    };

    // 视频播放时的处理
    const onVideoPlay = () => {
      if (!hasPlayed.value) {
        // 如果是首次点击播放视频，发送埋点
        const playEvent = {
          eventName: "click_play_video",
          extraParams: {
            videoUrl: videoUrl.value,
            isCached: !!cachedVideoUrl.value, // 是否使用了缓存视频
          },
        };

        trackEvent(playEvent); // 调用埋点方法
        hasPlayed.value = true; // 标记为已播放
      }
    };

    // 视频播放结束时的处理
    const onVideoEnd = () => {
      const endEvent = {
        eventName: "video_play_end",
        extraParams: {
          videoId: videoUrl.value, // 示例视频ID
          isCached: !!cachedVideoUrl.value, // 是否使用了缓存视频
        },
      };

      trackEvent(endEvent); // 调用埋点方法
    };

    onMounted(fetchVideo); // 页面加载时获取文件内容

    return {
      videoUrl,
      cachedVideoUrl,
      posterUrl,
      onVideoPlay,
      onVideoEnd,
    };
  },
};
</script>

<style scoped>
.tutorial {
  padding: 10px 20px;
  min-width: 100vw;
  .logo {
    img {
      display: block;
      margin: 0 auto;
    }
    .logo-text {
      margin-top: 10px;
    }
    margin-bottom: 40px;
  }
  .title {
    text-align: center;
    margin-bottom: 20px;
  }
  .video-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  .loading {
    text-align: center;
    font-size: 16px;
    color: #666;
  }
}
</style>
