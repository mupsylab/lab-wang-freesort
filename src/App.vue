<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useCheckBrowserInfo } from './store/browserCheck';

const cbi = useCheckBrowserInfo();
cbi.init();
</script>

<template>
  <RouterView></RouterView>
</template>
