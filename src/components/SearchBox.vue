<template>
  <div class="search-box">
    <input
      type="text"
      placeholder="请输入追溯码"
      v-model="code"
      @keyup.enter="onSearch"
    />
    <button @click="onSearch">查询</button>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  emits: ["search"],
  setup(props, { emit }) {
    const code = ref("");

    const onSearch = () => {
      if (!code.value.trim()) {
        alert("请输入追溯码！");
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
.search-box input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}
.search-box button {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.search-box button:hover {
  background-color: #0056b3;
}
</style>
