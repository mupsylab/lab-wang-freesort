<template>
    <div id="exp"></div>
</template>

<script setup lang="ts">
import { onMounted, render, h } from 'vue';
import { initJsPsych } from 'jspsych';

import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import endExp from "./endExp.vue";
import checkBrowser from "./checkBrowser.vue";
const jsPsych = initJsPsych({
    display_element: "exp",
    on_finish() {
        const dom = document.querySelector("#exp") as Element;
        dom.innerHTML = "";
        render(h(endExp), dom);
    }
});

const timeline: object[] = [];
timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    choices: ["NO_KEYS"],
    stimulus: "<div id='box'></div>",
    on_load() {
        render(h(checkBrowser), document.querySelector("#box") as Element);
    }
});

onMounted(() => {
    jsPsych.run(timeline);
});
</script>