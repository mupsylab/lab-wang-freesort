<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useCheckBrowserInfo } from './store/browserCheck';
import { onMounted } from 'vue';

const cbi = useCheckBrowserInfo();
cbi.init();

onMounted(() => {
  document.body.addEventListener('touchmove', function (e) {
    e.preventDefault(); // 阻止默认的处理方式(阻止下拉滑动的效果)
  }, { passive: false });
});
</script>

<template>
  <div class="app-box">
    <RouterView></RouterView>
  </div>
</template>

<style scoped>
.app-box {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>