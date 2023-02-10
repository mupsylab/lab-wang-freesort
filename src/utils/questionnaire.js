class Questionnaire {
    /**
     * @param {Array} data 文件结构
     */
    constructor(data, options = {}) {
        let opts = Object.assign({}, {
            title: "",
            subheading: "",
            number: true,
            width: document.body.clientWidth * 0.9,
            height: document.body.clientHeight * 0.8,
            isChildren: []
        }, options);
        this.data = data;
        this.num = 0;
        this.title = opts["title"];
        this.subheading = opts["subheading"];
        this.needShowNum = opts["number"];

        this.width = opts["width"];
        this.height = opts["height"];
        this.isChildren = opts["isChildren"];
        this.data.forEach((v, i) => {
            this.num += v.questionTxt.length * v.chooseScale.length;
        });
        this.i = 0; // questionId index
        this.qi = 0, // questionTxt index
            this.ci = 0; // chooseScale index
        this.usedNum = 0;
        this.showNum = 1; // show question number
    }
    isEnd() {
        return this.usedNum >= this.num;
    }
    reset() {
        this.i = 0; // questionId index
        this.qi = 0, // questionTxt index
            this.ci = 0; // chooseScale index
        this.usedNum = 0;
        this.showNum = 1; // show question number
    }
    initScript() {
        if(this.isChildren.length) {
            document.querySelectorAll("input[type=range]").forEach(c => {
                c.oninput = (e) => {
                    let a = document.querySelector("#"+e.target.id+"_span");
                    a.innerText = e.target.value;
                }
            });
    
            document.querySelectorAll("input[type=radio]").forEach(c => {
                c.oninput = (e) => {
                    document.querySelectorAll("label").forEach(v => {
                        v.style.backgroundColor = "";
                    });
                    document.querySelectorAll("label:has(input:checked)").forEach(v => {
                        v.style.backgroundColor = "grey";
                    });
                }
            });
            // document.querySelectorAll(".ChBox").forEach(v => {
            //     v.style.gridTemplateColumns = `repeat(auto-fill, calc((100% - ${
            //         parseInt(v.getAttribute("cLong"))
            //     }px) / ${parseInt(v.getAttribute("long"))}))`;
            // });
        } else {
            document.querySelectorAll("input[type=range]").forEach(c => {
                c.oninput = (e) => {
                    let a = document.querySelector("#"+e.target.id+"_span");
                    a.innerText = e.target.value;
                }
            });
    
            document.querySelectorAll("input[type=radio]").forEach(c => {
                c.oninput = (e) => {
                    document.querySelectorAll("label").forEach(v => {
                        v.style.backgroundColor = "";
                    });
                    document.querySelectorAll("label:has(input:checked)").forEach(v => {
                        v.style.backgroundColor = "grey";
                    });
                }
            });
            document.querySelectorAll("div[choL]").forEach(v => {
                let halfWidth = this.width / (parseInt(v.getAttribute("long")) * 2);
                v.style.left = `${Math.max(halfWidth - v.clientWidth / 2, 0)}px`;
            });
            document.querySelectorAll("div[choR]").forEach(v => {
                let halfWidth = this.width / (parseInt(v.getAttribute("long")) * 2);
                v.style.right = `${Math.max(halfWidth - v.clientWidth / 2, 0)}px`;
            });
        }
        let cc = document.querySelector("#jspsych-survey-html-form-next");
        cc.style.position = "relative";
        cc.style.left = `${this.width / 2 - cc.clientWidth / 2}px`;
    }
    renderNext(max) {
        let result = `<style>
        .tBox {
            text-align: left;
            margin: 0 0 40px 0;
            ${this.width ? `width: ${this.width}px;` : ""}
        }
        #cBox {
            overflow-y: scroll;
            ${this.height ? `height: ${this.height}px;` : ""}
        }
        input[type=radio] {
            /* display: none; */
            position: absolute;
            top: 25%;
            opacity: 0;
        }
        input[type=range] {
            width: 60%;
        }
        .Chos {
            display: inline-block;
            text-align: center;
            word-break: keep-all;
        }
        .choose {
            width: 32px;
            height: 32px;
            display: inline-block;
            border: 1px solid white;
            border-radius: 50%;
            text-align: center;
            line-height: 32px;
            position: relative;
            font-size: 20px;
        }
        .ChBox {
            display: grid;
            grid-template-columns: repeat(auto-fill, calc(100% / 10));
        }
        .Tit {
            margin: 10px 0 0 0;
        }

        .sTitle {
            font-size: 20px;
            font-weight: 200;
            line-height: 1.2em;
        }
        </style>
        <div class="tBox">
            <!-- title -->
            <div class="title">
                ${this.title}
            </div>
            <!-- 2 title -->
            <div class="sTitle">
                ${this.subheading}
            </div>
            <!-- ques -->
            <div id="cBox">
                <!-- first -->
                {{cBox}}
            </div>
        </div>`,
            num = 0;
        if (this.i >= this.data.length) {
            return "too Long!!!";
        }
        let tmpWordA3 = "";
        while (this.i < this.data.length) {
            while (this.qi < this.data[this.i].questionTxt.length) {
                let chooseTxt = "";
                while (this.ci < this.data[this.i].chooseScale.length) {
                    let tmpA3 = this.data[this.i].chooseScale[this.ci];
                    let tmpLeng = tmpA3.maxScale - tmpA3.minScale + 1;
                    if(tmpA3.range) {
                        chooseTxt += `<div class="ChBox" style="margin: 40px 0 0 0; grid-template-columns: repeat(auto-fill, calc(100% / 1));">`;
    
                        chooseTxt += `<div class="Chos" style="text-align: left; position: relative;">
                        <span id="${this.data[this.i].questionId}_q${this.qi + 1}_${this.ci + 1}_span" style="
                                width: 10%; display: inline-block; text-align: center; margin: 0 5%; border: 2px solid #e3e3e3;">${tmpA3.minScale}</span>
                            <div style="position: absolute; left: calc(20%); top: -30px; font-size: 20px; font-weight: 100;" long="${tmpLeng}">${tmpA3.minTxt}</div>
                            <span>${tmpA3.minScale}</span>
                            <input type="range" 
                                max="${tmpA3.maxScale}" min="${tmpA3.minScale}" step="${tmpA3.step}"
                                name="${this.data[this.i].questionId}_q${this.qi + 1}_${this.ci + 1}" 
                                id="${this.data[this.i].questionId}_q${this.qi + 1}_${this.ci + 1}" 
                                value="${tmpA3.minScale}" required />
                            <div style="position: absolute; left: calc(80%); top: -30px; font-size: 20px; font-weight: 100;" long="${tmpLeng}">${tmpA3.minTxt}</div>
                            <span>${tmpA3.maxScale}</span>
                        </div>`;
                    } else {
                        if(this.isChildren.length) {
                            chooseTxt += `<div class="ChBox" long=${tmpLeng} cLong=${(tmpA3.minTxt.length + tmpA3.maxTxt.length) * 20} style="grid-template-columns: repeat(auto-fill, calc(100% / ${tmpLeng + 2})); margin: 20px 0;">`;
                            chooseTxt += `<div class="Chos" style="font-size: 20px; line-height: 2em; font-weight: 200;">${tmpA3.minTxt}</div>`;
                            let aI = 0;
                            for (let i = tmpA3.minScale; i <= tmpA3.maxScale; i++) {
                                chooseTxt += `<div class="Chos">
                                    <label for="${this.data[this.i].questionId}_q${this.qi + 1}_${this.ci + 1}_${i}" class="choose"  style="background: url(${this.isChildren[aI]}) no-repeat; background-size: contain; vertical-align: middle; width: 40px; height: 40px;">
                                        <input type="radio" name="${this.data[this.i].questionId}_q${this.qi + 1}_${this.ci + 1}" value="${i}" id="${this.data[this.i].questionId}_q${this.qi + 1}_${this.ci + 1}_${i}" required>
                                    </label>
                                </div>`
                                aI++;
                            }
                            chooseTxt += `<div class="Chos" style="font-size: 20px; line-height: 1.5em; font-weight: 200;">${tmpA3.maxTxt}</div>`;
                        } else {
                            chooseTxt += `
                        <div style="position: relative; height: 50px; font-size: 20px; font-weight: 100;">
                            <div style="position: absolute; left: 9px;" choL long="${tmpLeng}">${tmpA3.minTxt}</div>
                            <div style="position: absolute; right: 10px;" choR long="${tmpLeng}">${tmpA3.maxTxt}</div>
                        </div>
                        <div class="ChBox" style="grid-template-columns: repeat(auto-fill, calc(100% / ${tmpLeng}));">`;    
                        for (let i = tmpA3.minScale; i <= tmpA3.maxScale; i++) {
                            chooseTxt += `<div class="Chos">
                                <label for="${this.data[this.i].questionId}_q${this.qi + 1}_${this.ci + 1}_${i}" class="choose">
                                    <input type="radio" name="${this.data[this.i].questionId}_q${this.qi + 1}_${this.ci + 1}" value="${i}" id="${this.data[this.i].questionId}_q${this.qi + 1}_${this.ci + 1}_${i}" required>
                                    ${i}
                                </label>
                            </div>`
                        }
                        }
                    }
                    chooseTxt += "</div>";
                    num += 1;
                    this.usedNum += 1;
                    this.ci++;
                    if(num >= max) break;
                }
                tmpWordA3 += `<div>
                    <!-- q title -->
                    <p class="Tit">${this.needShowNum ? `${this.showNum}. ` : ""}${this.data[this.i].questionTxt[this.qi]}</p>
                    ${chooseTxt}
                </div>`;
                if(this.ci == this.data[this.i].chooseScale.length) this.showNum += 1;
                if(this.ci >= this.data[this.i].chooseScale.length) {
                    this.ci = 0;
                    this.qi++;
                }
                if(num >= max) break;
            }
            if(this.qi >= this.data[this.i].questionTxt.length) {
                this.i++;
                this.qi = 0;
                this.ci = 0;
            }
            if(num >= max) break;
        }
        return result.replace("{{cBox}}", tmpWordA3);
    }
}
export default Questionnaire;