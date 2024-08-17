<template>
    <div>
        <div>{{ errCode }} {{ errMsg }}</div>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
const errCode = route.params.pathMatch?.[0]||"404";
const errMsg = route.params.pathMatch?.[1]||"未知页面";
</script>