let timeline = [];
let info = {};
// 实验程序的ID
let subjectID = "mupsy_template";

jsPsych.github.config({
    owner: "mupsylab", // the repo owner
    repo: "repo", // the repo to save the data
    path: "/template", // the file path of the repo
    token: "", // github token
});
// 实验编号填写
timeline.push({
    type: "survey-html-form",
    preamble: "<p style =' color : white'>你分配到的实验编号是</p>",
    html: "<p><input name='Q0' type='text' value='" + subjectID + "' disabled='disabled' /> \
    <input name='Q1' type='number' value='' min='1' required/></p>\
    <p id='numberf' style='font-size: 20px; color: white;'>你的最终编号是：</p>\
    <p>你完整参与本次实验次数是<input name='Q2' type='number' value='0' min='0' style='width: 50px;' required/></p>",
    button_label: "继续",
    on_load: function () {
        $("input[name=Q1]").on("input", function (e) {
            $("#numberf").html("你的最终编号是：" + $("input[name=Q0]").val() + e.currentTarget.value.toString().padStart(4, "0"));
            info["subj_idx"] = $("input[name=Q0]").val() + $("input[name=Q1]").val().toString().padStart(4, "0");
        });
        $("input[name=Q3").on("input", function(e) { 
            info["series"] = $("input[name=Q2]").val();
        })

        let id = jsPsych.github.getID(subjectID, 4);
        $("input[name=Q1]").val(id).trigger('input');
        info["series"] = 0;
    },
    on_finish: function () {
        if (localStorage.getItem(info["subj_idx"])) {
            info = JSON.parse(localStorage.getItem(info["subj_idx"]));
        }
        if(jsPsych.github.isFileExist(`${info["subj_idx"]}.csv`)) {
            alert("你当前的编号可能重复了，请确认你的编号，如果确认没问题，请按继续，否则请联系主试，谢谢");
        }
        jsPsych.github.upload(`${info["subj_idx"]}.csv`, `${info["subj_idx"]} is beginning to start the exper`, "");
    }
});
// 实验主程序
timeline.push({
    type: "html-keyboard-response",
    stimulus: "123",
    data: {
        save: true
    }
});

mupsyStart({
    timeline: timeline,
    on_finish: function() { 
        githubEnd({
            id: `${info["subj_idx"]}`,
            save: false,
            data: jsPsych.data.get().filter({save: true}).addToAll(info)
        })
    }
});