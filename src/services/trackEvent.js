import axios from "axios";
import { debounce } from "lodash";

// 防抖请求方法
const debouncedTrackEvent = debounce(async (event) => {
  try {
    const response = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/event`,
      {
        event: {
          eventName: event.eventName,
          eventTime: getCurrentTime(),
          extraParams: event.extraParams || {},
        },
      }
    );

    console.log("埋点事件发送成功:", response.data);
  } catch (error) {
    console.error(
      "埋点事件发送失败:",
      error.response ? error.response.data : error
    );
  }
}, 1000); // 设置防抖间隔时间为 1000 毫秒（1秒）

function getCurrentTime() {
  const now = new Date();
  now.setHours(now.getHours() + 8); // 将 UTC 时间调整为北京时间
  return now.toISOString(); // 返回 ISO 格式的字符串
}

// 全局埋点请求方法
export const trackEvent = (event) => {
  // console.log("process.env:", process.env);
  if (!process.env.VUE_APP_API_BASE_URL) {
    console.error("VUE_APP_API_BASE_URL 未定义，请检查环境变量");
    return;
  }

  // 防抖调用
  debouncedTrackEvent(event);
};
