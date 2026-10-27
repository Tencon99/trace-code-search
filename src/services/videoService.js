export async function getVideoThumbnail(videoUrl) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous"; // 跨域设置（如需）
    video.preload = "metadata";

    video.addEventListener("loadeddata", () => {
      // 创建 canvas 元素
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 获取封面数据 URL
      const thumbnail = canvas.toDataURL("image/jpeg");
      //   console.log("封面数据 URL：", thumbnail);
      resolve(thumbnail);
    });

    video.addEventListener("error", (err) => {
      reject(new Error("无法加载视频或提取封面", err));
    });
  });
}
