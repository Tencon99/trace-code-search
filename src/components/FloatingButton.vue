<template>
  <div
    class="floating-button"
    :class="{ expanded: isExpanded }"
    @click="toggleExpand"
  >
    <div class="text" v-if="!isExpanded">
      专<br />业<br />指<br />导<br />点<br />这<br />里
    </div>
    <div class="content" v-else>
      <img class="qrcode" src="@/assets/images/wechat.png" alt="微信二维码" />
      <span class="collapse-text">收<br />起</span>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "FloatingButton",
  setup() {
    const isExpanded = ref(false);

    const toggleExpand = () => {
      isExpanded.value = !isExpanded.value;
    };

    return {
      isExpanded,
      toggleExpand,
    };
  },
};
</script>

<style scoped>
.floating-button {
  position: fixed;
  top: 100px; /* 离页面顶部 100px，可调整 */
  right: 0; /* 吸附在右侧边缘 */
  width: 30px;
  height: 116px;
  background-color: #007bff;
  color: white;
  text-align: center;
  font-size: 10px;
  cursor: pointer;
  border-radius: 6px 0 0 6px;
  overflow: hidden;
  transition: width 0.3s ease, height 0.3s ease;
  z-index: 1000;
}

.floating-button.expanded {
  background-color: white;
  color: black;
  width: 130px;
  height: auto;
  /* padding: 10px; */
}

.text {
  /* writing-mode: vertical-rl; */
  /* transform: rotate(180deg); */
  line-height: 1.3;
  /* padding: 5px 0; */
  /* margin: auto; */
  /* padding-right: 20px; */
  font-size: 12px;
  padding-top: 6px;
}

.content {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 5px;
}

.qrcode {
  width: 90px;
  height: 90px;
  margin-right: 10px;
  border-radius: 8px;
}

.collapse-text {
  font-size: 14px;
  color: black;
}
</style>
