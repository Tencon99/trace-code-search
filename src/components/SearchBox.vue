<template>
  <div class="search-box">
    <div class="input-container">
      <input
        type="text"
        placeholder="请输入溯源码"
        v-model="code"
        @keyup.enter="onSearch"
      />
      <img
        v-if="showSuccessIcon"
        class="success-icon"
        alt="成功"
        src="@/assets/images/success.png"
      />
    </div>
    <button @click="onSearch">查询</button>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  props: {
    showSuccessIcon: {
      type: Boolean,
      default: false, // 默认不显示
    },
  },
  emits: ["search"],
  setup(props, { emit }) {
    const code = ref("");

    const onSearch = () => {
      if (!code.value.trim()) {
        alert("请输入溯源码！");
        return;
      }
      emit("search", code.value.trim());
    };

    return {
      code,
      onSearch,
    };
  },
};
</script>

<style>
.search-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}
.input-container {
  position: relative;
  width: 100%;
}

.input-container input {
  width: 100%;
  padding: 10px;
  padding-right: 40px; /* 为图标预留空间 */
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
}

.success-icon {
  position: absolute;
  right: 10px; /* 图标距右侧的距离 */
  top: 50%;
  transform: translateY(-50%);
  width: 24px; /* 图标大小 */
  height: 24px;
  pointer-events: none; /* 防止图标阻挡输入操作 */
}
.search-box button {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}
.search-box button:hover {
  background-color: #0056b3;
}
</style>
