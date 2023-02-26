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
import Naodao from "@/utils/naodao";
const naodao = new Naodao();
const session = new Session({
  startTime: new Date().toLocaleDateString() + "-" + new Date().toLocaleTimeString(),
  experId: Config.experId,
  subjIdx: "002",
  finish: false
});
const jsPsych = initJsPsych({
  display_element: "exp",
  on_finish: () => {
    session.addInfo("endTime", new Date().toLocaleDateString() + "-" + new Date().toLocaleTimeString());
    session.changeInfo("finish", true);
    naodao.save();
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
naodao.getData = () => {
  return session.t["getData"]().csv();
}
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
    return "正在加载实验资源，已加载：<span id='n1'>0</span> / <span id='t1'>0</span>"
  },
  choices: "NO_KEYS",
  on_load: () => {
    let progress = {};
    let arr1 = jsPsych.utils.deepCopy(Config.assets);
    let arr2 = jsPsych.utils.deepCopy(Config.html);
    arr1.forEach((v, i) => {
      progress[v] = 0;
      new Promise(() => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `./assets/media/${v}`, true);
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
          if (this.status == 200) {
            var blob = this.response;
            session.media = [v, URL.createObjectURL(blob)];
          } else {
            alert("加载图片出错，位置于：" + v);
            location.reload();
          }
        };
        xhr.onprogress = (e) => {
          progress[v] = e.loaded / e.total;
        }
        xhr.ontimeout = function (event) {
          alert('请求超时！请检查你的网络！' + v);
          location.reload();
        }
        xhr.send();
      });
    });
    arr2.forEach((v, i) => {
      progress[v] = 0;
      new Promise(() => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `./assets/external_html/${v}.html`, true);
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
          if (this.status == 200) {
            this.response.text().then(e => {
              progress[v] = 1;
              session.html = [v, e];
            });
          } else {
            alert("加载图片出错，位置于：" + v);
            location.reload();
          }
        };
        xhr.ontimeout = function (event) {
          alert('请求超时！请检查你的网络！' + v);
          location.reload();
        }
        xhr.send();
      });
    });
    session.t = [
      "cca",
      setInterval(() => {
        let sum = 0;
        Object.keys(progress).forEach((v, i) => {
          sum += progress[v];
        });
        $('#n1').text(Math.floor(sum * 100) / 100);
        $('#t1').text(arr1.length + arr2.length);
        if ((Object.keys(session.html).length + Object.keys(session.media).length) == (arr1.length + arr2.length)) {
          clearInterval(session.t["cca"]);
          jsPsych.finishTrial();
        }
      }, 500)
    ]
  }
}, {
  type: jsPsychFullscreen,
  fullscreen_mode: !Config.debug,
  button_label: "全屏进入实验",
  message: '<p style="margin: 0 0 53px 0;">欢迎参加本实验，请点击下方按钮进入全屏状态。</p>'
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
