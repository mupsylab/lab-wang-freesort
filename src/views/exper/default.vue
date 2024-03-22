<template>
    <div id="exp"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import { initJsPsych } from 'jspsych';
import { jsPsychHtmlKeyboardResponse } from '@/utils/jspsych/plugin_all_in_one.js';

const jsPsych = initJsPsych({
    display_element: "exp",
    on_finish() {
        console.log(jsPsych.data.get().csv());
    }
});

const timeline = [{
  timeline: [{
    type: jsPsychHtmlKeyboardResponse,
    choices: "NO_KEYS",
    stimulus: () => {
      return "请用本地浏览器打开";
    }
  }],
  conditional_function: () => {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/micromessenger/i) == "micromessenger") {
      return true;
    } else {
      return false;
    }
  }
}];

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  choices: ["NO_KEYS"],
  stimulus: "asdad",
});


onMounted(() => {
    jsPsych.run(timeline);
});
</script>