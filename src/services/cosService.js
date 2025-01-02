import COS from "cos-js-sdk-v5";

// 固定的存储桶名称和区域
const BUCKET_NAME = "test-1258029302"; // 存储桶名称
const REGION = "ap-guangzhou"; // 存储桶区域
// const BASE_URL = `https://${BUCKET_NAME}.cos.${REGION}.myqcloud.com`;

// 创建 COS 实例 appId 1258029302
const cosInstance = new COS({
  SecretId: process.env.VUE_APP_COS_SECRET_ID, // 从环境变量获取
  SecretKey: process.env.VUE_APP_COS_SECRET_KEY,
});

// 获取存储桶文件列表，并生成签名 URL
export function getBucketContents() {
  return new Promise((resolve, reject) => {
    cosInstance.getBucket(
      {
        Bucket: BUCKET_NAME,
        Region: REGION,
      },
      async (err, data) => {
        if (err) {
          console.error("获取存储桶内容失败：", err);
          reject(err);
        } else {
          // 为每个文件生成签名 URL
          const files = await Promise.all(
            data.Contents.map(async (file) => {
              const signedUrl = await getSignedUrl(file.Key);
              return {
                name: file.Key, // 文件名
                signedUrl, // 带签名的完整 URL
                size: file.Size, // 文件大小（字节）
                lastModified: file.LastModified, // 上次修改时间
                storageClass: file.StorageClass, // 存储类型
              };
            })
          );
          resolve(files);
        }
      }
    );
  });
}

// 生成签名 URL
export function getSignedUrl(key) {
  return new Promise((resolve, reject) => {
    cosInstance.getObjectUrl(
      {
        Bucket: BUCKET_NAME,
        Region: REGION,
        Key: key,
        Sign: true, // 生成签名 URL
      },
      (err, data) => {
        if (err) {
          console.error("生成签名 URL 失败：", err);
          reject(err);
        } else {
          resolve(data.Url);
        }
      }
    );
  });
}
