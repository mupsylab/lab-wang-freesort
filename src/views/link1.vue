<script>
import $ from "jquery";
import Session from "@/utils/session";
import Questionnaire from "@/utils/questionnaire";
import { initJsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import jsPsychCallFunction from '@jspsych/plugin-call-function';
import jsPsychFullscreen from '@jspsych/plugin-fullscreen';
import jsPsychSurveyHtmlForm from '@jspsych/plugin-survey-html-form';

import Config from "@/config";
import { createApp, defineAsyncComponent, ref } from "vue";

const session = new Session({
  startTime: new Date().toLocaleDateString() + "-" + new Date().toLocaleTimeString(),
  experId: Config.experId,
  subjIdx: "002",
  finish: false
});
session.t = [
  "getFileName", () => {
    return `${Config.experId}-ver${Config.version}-subj${session.getInfo("subjIdx")}`
  }
];
const jsPsych = initJsPsych({
  display_element: "exp",
  on_finish: () => {
    session.addInfo("endTime", new Date().toLocaleDateString() + "-" + new Date().toLocaleTimeString());
    session.changeInfo("finish", true);
    if (!Config.upload || (document.location.protocol == "file:" && session.url == "./")) {
      session.offlineSave(session.t["getData"]().csv(), session.t.getFileName());
      session.stopMonitor();
    } else {
      session.onlineSave(
        session.t["getData"]().csv(),
        session.t.getFileName(),
        function () {
          let DOM = jsPsych.getDisplayElement();
          DOM.innerHTML = "当前正在上传数据，进度为：" + `${session.t.uploadProgress}/${session.t.uploadLength}`;
          if (session.t.uploadProgress == session.t.uploadLength) {
            DOM.innerHTML = "上传成功，可以关闭窗口啦～";
            session.stopMonitor();
          }
        },
        function () {
          let DOM = jsPsych.getDisplayElement();
          DOM.innerHTML = "上传失败，请联系研究人员。";
          session.offlineSave(session.t["getData"]().csv(), session.t.getFileName());
        });
    }
  }
});
session.t = [
  "getData", () => {
    return jsPsych
      .data
      .get()
      .filter({ save: true })
      .addToAll(session.getAllInfo())
      .filterColumns(session.getInfoKeys().concat(["questionId", "answer"]))
  }
];
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
}, {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => {
    return "<div>正在加载实验资源，已加载：<span id='n1'>0</span> / <span id='t1'>0</span></div><div id='loadingBox'></div>"
  },
  choices: "NO_KEYS",
  on_load: () => {
    const BeginLoading = defineAsyncComponent(() => import("@/components/BeginLoading.vue"));
    const loading = ref(0);
    const playing = ref(false);
    const box1 = createApp(BeginLoading);
    box1.mount("#loadingBox");
    box1.provide("loading", loading);
    box1.provide("playing", playing);
    playing.value = true;

    let progress = {};
    let arr1 = jsPsych.utils.deepCopy(Config.assets);
    let arr2 = jsPsych.utils.deepCopy(Config.html);

    const downloadXHR = (id, url, track = true) => {
      return new Promise((reslove, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.addEventListener('loadstart', (e) => { });
        xhr.addEventListener('load', function (e) {
          reslove(this);
        });
        xhr.addEventListener('loadend', (e) => { });
        xhr.addEventListener('progress', (e) => {
          progress[id] = track ? e.loaded / e.total : 0;
        });
        xhr.addEventListener('error', (e) => {
          reject("error");
        });
        xhr.addEventListener('abort', (e) => {
          reject("abort");
        });
        xhr.send();
      });
    };
    const updataXHR = () => {
      let sum = 0;
      Object.keys(progress).forEach((v, i) => {
        sum += progress[v];
      });
      $('#n1').text(Math.floor(sum * 100) / 100);
      // document.querySelector("#loading").dataset.progress = Math.floor((sum / (arr1.length + arr2.length)) * 100);
      loading.value = Math.floor((sum / (arr1.length + arr2.length)) * 100);
      $('#t1').text(arr1.length + arr2.length);
      if ((Object.keys(session.html).length + Object.keys(session.media).length) == (arr1.length + arr2.length)) {
        playing.value = false;
        jsPsych.finishTrial();
      }
    };
    arr1.forEach((v, i) => {
      progress[v] = 0;
      downloadXHR(v, `./assets/media/${v}`)
        .then(e => {
          if (e.status == 200) {
            session.media = [v, URL.createObjectURL(e.response)]
            updataXHR();
          } else {
            alert("加载图片出错，位置于：" + v);
            playing.value = false;
            location.reload();
          }
        })
        .catch(e => {
          playing.value = false;
          alert(`${e}! ${v}`);
        });
    });
    arr2.forEach((v, i) => {
      progress[v] = 0;
      downloadXHR(v, `./assets/external_html/${v}.html`, false)
        .then(e => {
          if (e.status == 200) {
            e.response.text().then(e => {
              progress[v] = 1;
              session.html = [v, e];
              updataXHR();
            });
          } else {
            alert("加载图片出错，位置于：" + v);
            playing.value = false;
            location.reload();
          }
        })
        .catch(e => {
          alert(`${e}! ${v}`);
          playing.value = false;
        });
    });
  }
}, {
  type: jsPsychFullscreen,
  fullscreen_mode: !Config.debug,
  button_label: "全屏进入实验",
  message: '<p style="margin: 0 0 53px 0;">欢迎参加本实验，请点击下方按钮进入全屏状态。</p>' + document.location.protocol
}];

timeline.push({
  type: jsPsychCallFunction,
  func: () => {
    session.t = [
      "q",
      new Questionnaire([
        {
          questionTxt: [
            "我认为与一辆自动驾驶汽车相遇是一件令人放松的事情",
            "我认为与一辆自动驾驶汽车相遇是一件令人安心的",
            "我认为与一辆自动驾驶汽车相遇是一件令人害怕的",
            "我认为与一辆自动驾驶汽车相遇是一件令人焦虑的",
            "此问题用于检测是否对您仔细阅读问题，请选择非常不同意"
          ],
          questionId: "emotionalSecurity",
          chooseScale: [
            {
              minScale: 1,
              maxScale: 5,
              minTxt: "我没有信心",
              maxTxt: "有信心",
            }, {
              minScale: 1,
              maxScale: 5,
              minTxt: "cc",
              maxTxt: "asd",
            }, {
              minScale: 1,
              maxScale: 5,
              minTxt: "aacc",
              maxTxt: "asd",
            }
          ]
        }
      ], {
        width: 700,
        height: 400,
        title: "asd",
        subheading: "ccc",
        isChildren: [
          session.media["imgs/1.png"],
          session.media["imgs/2.png"],
          session.media["imgs/3.png"],
          session.media["imgs/4.png"],
          session.media["imgs/5.png"]
        ]
      })
    ]
    session.t["q"].reset();
  }
}, {
  timeline: [{
    type: jsPsychSurveyHtmlForm,
    html: () => {
      return session.t["q"].renderNext(6);
    },
    on_load: () => {
      session.t["q"].initScript();
    },
    on_finish: (data) => {
      Object.keys(data.response).forEach((v, i) => {
        jsPsych.data.write({
          save: true,
          answer: data.response[v],
          questionId: v
        });
      });
    },
    button_label: "继续"
  }],
  loop_function: () => {
    return !session.t["q"].isEnd();
  }
});

timeline.push({
  type: jsPsychSurveyHtmlForm,
  html: () => {
    return session.renderInfo([
      {
        size: 4,
        type: "text",
        name: "name",
        required: true,
        prefix: "您的姓名"
      },
      {
        size: 20,
        type: "text",
        name: "name",
        required: true,
        prefix: "您所在的单位"
      },
      {
        size: 11,
        type: "text",
        name: "phone",
        required: true,
        prefix: "您的支付宝账号",
        suffix: ""
      },
      {
        size: 11,
        type: "text",
        name: "phone",
        required: true,
        prefix: "您的手机号",
        suffix: "岁"
      },
      {
        size: 15,
        type: "text",
        name: "phone",
        required: true,
        prefix: "您的身份证号",
        suffix: ""
      },
      {
        type: "radio",
        name: "phone",
        required: true,
        choose: ["男", "女"],
        align: "hor",
        prefix: "您的性别"
      },
      {
        type: "radio",
        name: "phone",
        required: true,
        choose: ["男", "女"],
        align: "col",
        prefix: "您的性别"
      }
    ]);
  },
  button_label: "继续",
  on_finish: (data) => {
    Object.keys(data.response).forEach((v, i) => {
      session.addInfo(v, data.response[v]);
    });
  }
});

export default {
  name: "App",
  mounted() {
    if (!Config.debug) session.startMonitor();
    if (Config.autoId) {
      $.ajax({
        url: "./data/ss.php",
        type: "GET",
        dataType: "json",
        success: (e) => {
          console.log(e);
          console.log(e.cond);
          if (e.success == 1) {
            session.changeInfo("subjIdx", e.id);
            session.addInfo("cond", e.cond);
          }
        }
      })
    }
    jsPsych.run(timeline);
  }
}
</script>

<template>
  <div id="exp"></div>
</template>

<style scoped>
@import "jspsych/css/jspsych.css";
@import "@/assets/css/reset.css";
@import "@/assets/css/index.css";

#exp {
  width: 100%;
  height: 100%;
}
</style>
