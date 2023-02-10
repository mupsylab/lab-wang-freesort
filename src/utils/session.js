import $ from "jquery";
/**
 * @method stopMonitor
 * @method startMonitor
 * 
 * @method offlineSave
 * @method onlineSave
 * 
 * @method addInfo
 * @method getInfo
 * @method getInfoKeys
 * @method getAllInfo
 * @method changeInfo
 * 
 * @method renderInfo
 */

class Session {
    #info;
    #repeat;
    #mediaAdd;
    #tempD;
    #html;
    #strSplice(str = "", n = 1024) {
        let strArr = [];
        for (var i = 0, l = str.length; i < l / n; i++) {
            var a = str.slice(n * i, n * (i + 1));
            strArr.push(a);
        }
        return strArr;
    }
    constructor(...options) {
        this.#info = options[0] ? options[0] : {};

        this.#repeat = 0;
        this.#mediaAdd = {};
        this.#html = {};
        this.#tempD = {
            uploadLength: 0, // upload length to online
            uploadProgress: 0, // upload progress to online
            getData: () => { return ""; } // get the data from jspsych
        };
    }
    get onlineSaveProgress() {
        return [this.t["uploadProgress"], this.t["uploadLength"]];
    }
    get media() {
        return this.#mediaAdd;
    }
    set media(o) {
        if (Array.isArray(o) && o.length >= 2) {
            this.#mediaAdd[o[0]] = o[1];
        } else if (typeof o == "object" && !Array.isArray(o)) {
            Object.keys(o).forEach(v => {
                this.#mediaAdd[v] = o[v];
            })
        } else {
            console.error("can not add anything");
        }
    }

    get html() {
        return this.#html;
    }
    set html(o) {
        if (Array.isArray(o) && o.length >= 2) {
            this.#html[o[0]] = o[1];
        } else if (typeof o == "object" && !Array.isArray(o)) {
            Object.keys(o).forEach(v => {
                this.#html[v] = o[v];
            })
        } else {
            console.error("can not add anything");
        }
    }

    get t() {
        return this.#tempD;
    }
    set t(o) {
        if (Array.isArray(o) && o.length >= 2) {
            this.#tempD[o[0]] = o[1];
        } else if (typeof o == "object" && !Array.isArray(o)) {
            Object.keys(o).forEach(v => {
                this.#tempD[v] = o[v];
            })
        } else {
            console.error("can not add anything");
        }
    }
    stopMonitor() {
        window.onbeforeunload = () => { };
        window.onunload = () => { };
    }
    startMonitor() {
        Object.keys(localStorage).forEach(v => {
            if (/tmpD\d{11}/.exec(v)) {
                let data = JSON.parse(localStorage.getItem(v));
                let bool = this.offlineSave(data["data"], data["subjIdx"]);
                if (bool) localStorage.removeItem(v);
            }
        });
        window.onbeforeunload = (e) => {
            e.preventDefault()
            e.returnValue = "";
        }
        window.onunload = () => {
            this.changeInfo("endTime", new Date().toLocaleDateString() + "-" + new Date().toLocaleTimeString());
            localStorage.setItem("tmpD" + new Date().getTime().toString(), JSON.stringify(
                Object.assign({}, this.#info, {
                    data: this.t["getData"]().csv()
                })
            ));
        }
    }
    offlineSave(str, id = this.#info["subjIdx"]) {
        try {
            const blobToSave = new Blob([str], {
                type: "text/plain",
            });
            let blobURL = "";
            if (typeof window.webkitURL !== "undefined") {
                blobURL = window.webkitURL.createObjectURL(blobToSave);
            }
            else {
                blobURL = window.URL.createObjectURL(blobToSave);
            }
            const link = document.createElement("a");
            link.id = "jspsych-download-as-text-link";
            link.style.display = "none";
            link.download = `${id}.csv`;
            link.href = blobURL;
            link.click();
            return true;
        } catch {
            return false;
        }
    }
    async onlineSave(str1, id = this.#info["subjIdx"], callback = function() {}, error = function() {}) {
        let strs = this.#strSplice(str1);
        this.t = ["uploadLength", strs.length];
        this.t = ["uploadProgress", 0];
        let _this = this;

        // repeated ?
        let status = $.ajax({
            url: "./data/origin/" + id + ".csv",
            type: "GET",
            async: false
        });
        let repeatI = 0, filename = id;
        while (status.status == 200) {
            repeatI++;
            filename = id + "_" + repeatI.toString();
            status = $.ajax({
                url: "./data/origin/" + filename + ".csv",
                type: "GET",
                async: false
            });
        }
        let i = 0;
        const uploadF = () => {
            $.ajax({
                url: "./data/upload.php",
                type: "POST",
                data: {
                    data: strs[i],
                    id: filename
                },
                success: function (e) {
                    if (i < strs.length) {
                        i++;
                        _this.t = ["uploadProgress", _this.t["uploadProgress"] + 1];
                        uploadF();
                    } else {
                        callback();
                    }
                },
                fail: () => {
                    error();
                },
                error: () => {
                    error();
                }
            });
        }
        uploadF();
    }
    addInfo(key, value) {
        if (Object.keys(this.#info).indexOf(key) >= 0) {
            this.#repeat++;
            return this.addInfo(key + this.#repeat.toString(), value)
        }
        this.#info[key] = value;
        return true;
    }
    getInfo(key) {
        return this.#info[key];
    }
    getInfoKeys(arr = ["subjIdx", "startTime", "endTime"]) {
        let o = Object.keys(this.#info);
        arr.forEach(v => {
            if (o.indexOf(v) >= 0) {
                o.splice(o.indexOf(v), 1);
            }
        })
        return [].concat(arr, Object.keys(this.#info).sort());
    }
    getAllInfo() {
        return this.#info;
    }
    changeInfo(key, value) {
        this.#info[key] = value;
    }
    renderInfo(data, isHalf = false) {
        let result = '<div class="tBox">';

        let arr = [];
        let getUnique = (e, arrc, repeat = 0) => {
            if (repeat) e = `${e}-${repeat}`;
            if (arrc.indexOf(e) >= 0) {
                return getUnique(e, arrc, repeat + 1);
            } else {
                return e;
            }
        };

        let allInput = "margin: 0 11px 0 10px;";
        let unName;
        let maxFontNum = 0;
        data.forEach(v => {
            maxFontNum = v.prefix ? (
                v.prefix.length > maxFontNum ? v.prefix.length : maxFontNum
            ) : maxFontNum;
            switch (v.type) {
                case "radio":
                    unName = getUnique(v.name, arr);
                    arr.push(unName);
                    result += `<div class="para">
                        <div cc>${v.prefix ? v.prefix : ""}</div><div class="${v.align ? v.align : "col"}">`;
                    v.choose.forEach((j, i) => {
                        result += `<div><label>
                        <input type=radio ${v.required ? "required" : ""} name=${unName} value="${i}" style="${allInput}" />
                        ${j}
                        </label></div>`
                    });
                    result += "</div></div>";
                    break;
                case "number":
                    unName = getUnique(v.name, arr);
                    arr.push(unName);
                    result += `
                    <div class="para">
                        <div cc>${v.prefix ? v.prefix : ""}</div>
                        <input size=${v.size} type=number ${v.required ? "required" : ""} name=${unName} style="${allInput}" />${v.suffix ? v.suffix : ""}
                    </div>
                    `;
                    break;
                case "text":
                    unName = getUnique(v.name, arr);
                    arr.push(unName);
                    result += `
                    <div class="para">
                        <div cc>${v.prefix ? v.prefix : ""}</div>
                        <input size=${v.size} type=text ${v.required ? "required" : ""} name=${unName} style="${allInput}" />${v.suffix ? v.suffix : ""}
                    </div>
                        `;
                    break;
            }
        });
        result += '</div>';
        let style = `
<style>
    .tBox {
        text-align: left;
        font-size: 20px;
        height: 500px;
        overflow-x: scroll;
    }
    p {
        margin: 0 0 0 166px;
        padding: 0;
    }
    [type="text"]{
        font-size: 20px;
        line-height: 1.8em;
    }
    .para {
        margin: 20px 0 0 0;
        border-block-end: 1px solid white;
    }
    .para>div {
        vertical-align: top;
    }
    div[cc] {
        display: inline-block;
        width: ${maxFontNum * (isHalf ? 11 : 22) + 20}px;
    }
    .col{
        display: inline-block;
    }
    .col>div{
        display: block;
    }
    .hor {
        display: inline-block;
    }
    .hor>div{
        display: inline-block;
    }
</style>`;
        return `${style} ${result}`
    }
}
export default Session;