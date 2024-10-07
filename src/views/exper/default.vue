<template>
    <div id="exp"></div>
</template>

<script setup lang="ts">
import { initJsPsych } from 'jspsych';
import { onMounted, render, h } from 'vue';

import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { useCheckBrowserInfo } from "../../store/browserCheck";
import { useLoaderAssets } from '../../store/loadAssetsToBlob';
import Session from '../../utils/session';
import { getUuid } from '../../utils/random';
const loader = useLoaderAssets();
const cbi = useCheckBrowserInfo();

const jsPsych = initJsPsych({
    display_element: "exp"
});

const timeline: object[] = [{
    type: jsPsychHtmlKeyboardResponse,
    choices: ["NO_KEYS"],
    stimulus: "<span id='a1'>0</span>/<span id='a2'>1</span>",
    on_load() {
        // 初始化代码放这里
        if(!loader.isInit) {
            // 进行加载，同时避免vue的热更新
            loader.addAssets("./assets/cro_minion/baby.jpg");
            loader.addAssets("./assets/cro_minion/man.jpg");
            loader.addAssets("./assets/cro_minion/monster.jpg");
            loader.addAssets("./assets/cro_minion/short.jpg");
            loader.addAssets("./assets/cro_minion/tall.jpg");
        }
        loader.startLoad();

        const totalNumDom = document.querySelector("#a2") as HTMLDivElement;
        const countNumDom = document.querySelector("#a1") as HTMLDivElement;

        const i = setInterval(() => {
            if (cbi.isInit && loader.isFinish) {
                clearInterval(i);
                jsPsych.finishTrial({
                    type: "init-function"
                });
            } else {
                const { len, left, loading } = loader.progress;
                totalNumDom.innerText = len.toString();
                countNumDom.innerText = (len - left + loading).toFixed(2);
            }
        }, 100);
    }
}];

import freeSort from './trial/freeSort.vue';
import freeLine from './trial/freeLine.vue';
timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    choices: ["NO_KEYS"],
    stimulus: "<div id='box'></div>",
    on_load() {
        let step = 0;
        render(h(freeSort, {
            roleName: ["baby", "man", "monster", "short", "tall"],
            onEndTrial(data: Array<{name: string, posX: number, posY: number}>) {
                data.forEach((item, i: number) => {
                    jsPsych.data.write(Object.assign({}, item, {
                        index: i,
                        save: true,
                        trial_name: "freeSort"
                    }));
                });
                jsPsych.finishTrial({});
            },
            onDragEvent(data: {name: string, posX: number, posY: number}) {
                step += 1;
                jsPsych.data.write(Object.assign({}, data, {
                    save: true,
                    index: step,
                    trial_name: "freeSort_ing"
                }));
                console.log(2222);
            }
        }), document.querySelector("#box") as Element);
    }
});
timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    choices: ["NO_KEYS"],
    stimulus: "<div id='box'></div>",
    on_load() {
        const trials = jsPsych.data.get().filter({save: true}).last(5).values();
        render(h(freeLine, {
            trials: trials,
            onEndTrial(keys, vals) {
                jsPsych.data.write({
                    keys: keys,
                    vals: vals,
                    save: true,
                    trial_name: "freeLine"
                });
                jsPsych.finishTrial({});
            }
        }), document.querySelector("#box") as Element);
    }
});

import endExp from "./endExp.vue";
timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    choices: ["NO_KEYS"],
    stimulus: "<div id='box'></div>",
    on_load() {
        jsPsych.data.write(cbi.browser);
        new Session().offlineSave(jsPsych.data.get().csv(), getUuid());
        render(h(endExp), document.querySelector("#box") as Element);
    }
});

onMounted(() => {
    jsPsych.run(timeline);
});
</script>