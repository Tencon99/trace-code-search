require("dotenv").config();
const COS = require("cos-nodejs-sdk-v5");
const path = require("path");
const fs = require("fs");

// 初始化 COS 实例
const cos = new COS({
  SecretId: process.env.VUE_APP_COS_SECRET_ID,
  SecretKey: process.env.VUE_APP_COS_SECRET_KEY,
});

// 配置信息
const bucket = process.env.COS_BUCKET;
const region = process.env.COS_REGION;
const basePath = "/"; // 基路径，默认为根路径
const distFolder = path.resolve(__dirname, "dist"); // 打包输出的文件夹
const foldersToClean = ["css", "img", "fonts", "js"]; // 需要清理的文件夹

// 获取当前日期（UTC 格式）
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // 格式化为 yyyy-MM-dd
}

// 封装 listObjects 为 Promise
function listObjects(folderPath) {
  return new Promise((resolve, reject) => {
    cos.getBucket(
      {
        Bucket: bucket,
        Region: region,
      },
      (err, data) => {
        if (err) {
          return reject(err);
        }
        // 根据返回列表中的Key：Key: 'css/app.0b13de0e.css', 过滤出文件夹下的文件
        data.Contents = data.Contents.filter((item) =>
          item.Key.startsWith(folderPath)
        );

        console.log(`Listing objects in ${folderPath}:`, data.Contents);
        resolve(data.Contents || []);
      }
    );
  });
}

// 封装 deleteObjects 为 Promise
function deleteObjects(objects) {
  return new Promise((resolve, reject) => {
    if (objects.length === 0) return resolve();

    cos.deleteMultipleObject(
      {
        Bucket: bucket,
        Region: region,
        Objects: objects,
      },
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
}

// 删除存储桶内的指定文件夹内容（仅非当天文件）
async function deleteFolderContents(folderPath) {
  try {
    const today = getTodayDate(); // 获取当天日期
    const objects = await listObjects(folderPath);

    if (objects.length === 0) {
      console.log(`No files to delete in ${folderPath}`);
      return;
    }

    // 过滤出非当天的文件
    const objectsToDelete = objects
      .filter((item) => item.LastModified.split("T")[0] !== today) // 比较日期部分
      .map((item) => ({ Key: item.Key }));

    if (objectsToDelete.length === 0) {
      console.log(`No outdated files to delete in ${folderPath}`);
      return;
    }

    await deleteObjects(objectsToDelete);
    console.log(`Deleted all outdated files in ${folderPath}`);
  } catch (err) {
    console.error(`Error deleting objects in ${folderPath}:`, err);
    throw err;
  }
}

// 上传文件到 COS
async function uploadDir(localDir, cosDir) {
  const files = fs.readdirSync(localDir);

  for (const file of files) {
    const localFilePath = path.join(localDir, file);
    const cosFilePath = path.join(cosDir, file).replace(/\\/g, "/");

    if (fs.lstatSync(localFilePath).isDirectory()) {
      // 如果是文件夹，递归上传
      await uploadDir(localFilePath, cosFilePath);
    } else {
      // 上传文件
      console.log(`Uploading: ${cosFilePath}`);
      await cos
        .putObject({
          Bucket: bucket,
          Region: region,
          Key: cosFilePath.startsWith("/") ? cosFilePath.slice(1) : cosFilePath, // 去掉开头的斜杠
          Body: fs.createReadStream(localFilePath),
        })
        .then(() => console.log(`Uploaded: ${cosFilePath}`))
        .catch((err) => console.error(`Error uploading ${cosFilePath}:`, err));
    }
  }
}

// 主程序
(async () => {
  try {
    console.log("Starting cleanup...");
    for (const folder of foldersToClean) {
      const folderPath = path.join(basePath, folder);
      await deleteFolderContents(folder + "/");
    }

    console.log("Cleanup completed. Starting upload...");
    await uploadDir(distFolder, basePath);
    console.log("Upload completed!");
  } catch (err) {
    console.error("Error during cleanup or upload process:", err);
  }
})();
