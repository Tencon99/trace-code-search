import { trackEvent } from "@/services/trackEvent";

const DB_NAME = "VideoCacheDB";
const STORE_NAME = "videos";
// const CHUNK_SIZE = 1024 * 1024; // 1MB 分块下载，防止大文件溢出内存

class VideoCache {
  constructor() {
    this.db = null;
  }

  // 初始化 IndexedDB
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "filename" });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // **从 URL 提取文件名**
  extractFileName(videoUrl) {
    if (!videoUrl) return null;
    return videoUrl.split("/").pop().split("?")[0]; // 移除查询参数
  }

  // **检查视频缓存**
  async getCachedVideo(videoUrl) {
    if (!this.db) await this.initDB();
    const fileName = this.extractFileName(videoUrl);
    if (!fileName) return null;
    console.log("fileName:", fileName);

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(fileName);

      request.onsuccess = (event) => {
        const data = event.target.result;
        if (data) {
          const videoUrl = URL.createObjectURL(data.videoBlob);
          console.log(`✅ 找到缓存视频: ${videoUrl}`);
          resolve(videoUrl);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject("❌ 读取缓存失败");
    });
  }

  // **下载视频并缓存**
  async downloadAndCacheVideo(videoUrl) {
    if (!this.db) await this.initDB();
    const filename = this.getFileName(videoUrl);

    console.log(`📥 开始下载: ${videoUrl}`);
    const response = await fetch(videoUrl);
    const reader = response.body.getReader();
    const stream = new ReadableStream({
      start(controller) {
        return pump();
        function pump() {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            return pump();
          });
        }
      },
    });

    const videoBlob = await new Response(stream).blob();

    // **存入 IndexedDB**
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ filename, videoBlob });

      request.onsuccess = () => {
        console.log(`✅ 视频缓存成功: ${filename}`);
        trackEvent({
          eventName: "video_download_complete",
          extraParams: { videoUrl },
        });
        resolve(URL.createObjectURL(videoBlob));
      };

      request.onerror = () => reject("❌ 视频缓存失败");
    });
  }

  getFileName(videoUrl) {
    const urlObj = new URL(videoUrl);
    return urlObj.pathname.split("/").pop().split("?")[0];
  }

  // **存储视频**
  async saveVideo(fileName, videoBlob) {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ fileName, videoBlob });

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject("保存视频失败");
    });
  }

  // **清除特定视频缓存**
  async clearVideoCache(videoUrl) {
    if (!this.db) await this.initDB();
    const fileName = this.extractFileName(videoUrl);
    if (!fileName) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(fileName);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject("清除缓存失败");
    });
  }

  // **清空所有缓存**
  async clearAllCache() {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject("清空缓存失败");
    });
  }
}

// 创建并导出实例
export const videoCache = new VideoCache();
