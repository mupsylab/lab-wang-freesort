<template>
  <div id="exp"></div>
</template>

<style>
@import "jspsych/css/jspsych.css";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
  background-color: grey;
  width: 100%;
  height: 100%;
}

#exp {
  width: 100%;
  height: 100%;
}
</style>

<script>
import { initJsPsych } from 'jspsych';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

const jsPsych = initJsPsych({
  display_element: "exp",
  on_finish: () => {
    jsPsych.data.displayData();
  }
});

const trial = {
  type: htmlKeyboardResponse,
  stimulus: 'Hello World',
}

jsPsych.run([trial]);

export default {
  name: 'App'
}
</script>
