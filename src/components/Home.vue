<template>
  <div class="home">
    <div class="logo">
      <img
        class="logo-icon"
        alt="美少女肌地"
        src="@/assets/images/logo_icon.png"
        width="100"
      />
      <!-- <img
        class="logo-text"
        alt="美少女肌地"
        src="@/assets/images/logo_text.png"
        width="260"
      /> -->
    </div>

    <h1 class="title primary-text" @dblclick="getVideoCount">
      单支防伪追溯查询
    </h1>
    <SearchBox
      class="search-input"
      @search="handleSearch"
      :showSuccessIcon="videoUrl !== ''"
    />
    <div class="tutorial-button">
      <button @click="onTutorial">滚针操作教程</button>
    </div>
    <div v-if="videoUrl" class="result">
      <div class="result-text">
        <h2>查询结果</h2>
        <p v-if="productBatch" class="batch-info">
          商品批次：{{ productBatch }}
        </p>
      </div>

      <video
        ref="videoPlayer"
        controls
        :src="cachedVideoUrl || videoUrl"
        width="400"
        preload="metadata"
        @play="onVideoPlay"
        @ended="onVideoEnd"
        controlslist="nodownload"
        @contextmenu.prevent
      ></video>
    </div>
    <div v-else-if="searched" class="no-result">
      <p>未找到溯源视频！</p>
    </div>
    <FloatingButton />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import SearchBox from "./SearchBox.vue";
import { getBucketContents } from "@/services/cosService";
import { trackEvent } from "@/services/trackEvent";
import FloatingButton from "@/components/FloatingButton.vue";
import { videoCache } from "@/services/videoCache"; // 引入视频缓存服务

export default {
  name: "App",
  components: {
    SearchBox,
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
    const cachedVideoUrl = ref(null);
    const searched = ref(false); // 是否完成搜索
    const fileCache = ref({}); // 缓存文件名和对应的完整路径
    const productBatch = ref(""); // 商品批次信息
    const isVideoPlaying = ref(false); // 视频是否正在播放
    const hasPlayed = ref(false); // 是否首次播放视频

    // 获取存储桶内容并缓存文件名和路径
    const fetchFiles = async () => {
      try {
        const contents = await getBucketContents();
        fileCache.value = contents.reduce((cache, file) => {
          const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, ""); // 去掉文件后缀
          cache[fileNameWithoutExt] = file.signedUrl; // 映射文件名到签名 URL
          return cache;
        }, {});
      } catch (error) {
        console.error("获取存储桶内容失败：", error);
      }
    };

    // 处理搜索
    const handleSearch = async (code) => {
      // 将code字母转为大写
      code = code.toUpperCase(); // 待测试
      const queryEvent = {
        eventName: "click_query_button",
        extraParams: {
          queryText: code, // 传递输入框中的内容
        },
      };
      trackEvent(queryEvent); // 调用埋点方法
      if (fileCache.value[code]) {
        videoUrl.value = fileCache.value[code];

        const cachedVideo = await videoCache.getCachedVideo(videoUrl.value); // 获取缓存视频
        if (cachedVideo) {
          cachedVideoUrl.value = cachedVideo;
          console.log("✅ 使用本地缓存视频");
        } else {
          console.log("⚠️ 缓存中没有该视频，下载中...");
          videoCache.downloadAndCacheVideo(videoUrl.value);
        }

        const datePart = code.slice(0, 8);
        const batchPart = code.slice(8);
        if (/^\d{8}$/.test(datePart)) {
          productBatch.value = batchPart || "";
          // 如果批次为V5826的话 更改为 V581126
          if (productBatch.value === "V5826") {
            productBatch.value = "V581126";
          }
        } else {
          productBatch.value = "";
        }
      } else {
        videoUrl.value = "";
        productBatch.value = "";
      }
      searched.value = true;
      isVideoPlaying.value = false; // 重置按钮状态
    };

    // 视频播放事件
    const onVideoPlay = () => {
      isVideoPlaying.value = true;
      trackBandwidthUsage(document.querySelector("video")); // 监控视频流量
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

    const trackBandwidthUsage = (videoElement) => {
      let lastLoadedSize = 0;

      videoElement.addEventListener("progress", () => {
        if (videoElement.buffered.length > 0) {
          const bufferedEnd = videoElement.buffered.end(
            videoElement.buffered.length - 1
          );
          const totalDuration = videoElement.duration;

          // 估算当前加载的视频数据大小
          const estimatedSize =
            (bufferedEnd / totalDuration) * videoElement.fileSize;

          // 计算增量流量
          const deltaSize = estimatedSize - lastLoadedSize;
          if (deltaSize > 0) {
            lastLoadedSize = estimatedSize;
            trackEvent({
              eventName: "video_bandwidth_usage",
              extraParams: {
                videoUrl: videoElement.currentSrc,
                dataUsed: deltaSize, // 估算的流量消耗（字节）
                time: new Date().toISOString(), // 当前时间
                videoSize: videoElement.fileSize, // 视频文件大小（字节）
                bufferedEnd, // 已缓冲的视频时长（秒）
                totalDuration, // 视频总时长（秒）
                bufferedPercent: bufferedEnd / totalDuration, // 已缓冲百分比
                // mb为单位
                dataUsedMb: (deltaSize / 1024 / 1024).toFixed(2),
                videoSizeMb: (videoElement.fileSize / 1024 / 1024).toFixed(2),
              },
            });
          }
        }
      });
    };

    // 跳转到教程页面
    const onTutorial = () => {
      window.location.href = "/#/tutorial"; // 或者使用 this.$router.push("/tutorial");
    };

    const getVideoCount = () => {
      const fileCount = Object.keys(fileCache.value).length;
      alert(`当前缓存的视频文件数量为：${fileCount}`);
    };

    onMounted(fetchFiles);

    return {
      videoUrl,
      cachedVideoUrl,
      searched,
      productBatch,
      isVideoPlaying,
      hasPlayed,
      handleSearch,
      onVideoPlay,
      onVideoEnd,
      onTutorial,
      getVideoCount,
    };
  },
};
</script>

<style class="less" scoped>
.home {
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
  }
  .search-input {
    width: 80vw;
  }
}
.tutorial-button {
  text-align: center;
  margin: 20px 0;
  button {
    padding: 10px 20px;
    color: #fff;
    /* background-color: #007bff; */
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;

    /* &:hover {
      background-color: #0056b3;
    } */
  }
}
.result {
  margin-top: 20px;
  text-align: center;
  h2 {
    margin: 8px 0;
  }
  .batch-info {
    font-size: 16px;
    color: #333;
    font-weight: bold;
    margin: 0;
    margin-bottom: 10px;
  }
  button {
    padding: 10px 20px;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    margin: 0 auto 10px;
    display: block;
  }
}
.no-result {
  margin-top: 20px;
  color: red;
  text-align: center;
}
</style>
