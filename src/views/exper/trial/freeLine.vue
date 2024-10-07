<script setup lang="ts">
import { onMounted } from 'vue';
import { useLoaderAssets } from '../../../store/loadAssetsToBlob';
const loader = useLoaderAssets();

interface trialData {
    name: string,
    posX: number,
    posY: number,
    index: number
}

interface ImageObj {
    name: string, // 标识符
    pos: { x: number, y: number },
    size: { width: number, height: number },
    domObj: HTMLImageElement,
    isChoose: Boolean, // 判断是否被选中，以此进行移动
}

const props = defineProps<{
    trials: Array<trialData>
}>();
const emits = defineEmits(["endTrial"]);

class DataSave {
    keys: string[];
    val: number[][];
    constructor(keys: string[]) {
        const vals: number[][] = [];
        keys.forEach(() => {
            const v1: number[] = [];
            keys.forEach(() => {
                v1.push(0);
            });
            vals.push(v1);
        });

        this.keys = keys;
        this.val = vals;
    }
    reset() {
        const vals: number[][] = [];
        this.keys.forEach(() => {
            const v1: number[] = [];
            this.keys.forEach(() => {
                v1.push(0);
            });
            vals.push(v1);
        });
        this.val = vals;
    }
    setVal(key1: string, key2: string, val: number) {
        const kI1 = this.keys.indexOf(key1);
        const kI2 = this.keys.indexOf(key2);
        if(kI1 < 0 || kI2 < 0 || kI1 == kI2) return 0;
        if(kI1 > kI2) {
            this.val[kI1][kI2] = val;
        } else {
            this.val[kI2][kI1] = val;
        }
    }
    getVal(key1: string, key2: string) {
        const kI1 = this.keys.indexOf(key1);
        const kI2 = this.keys.indexOf(key2);
        if(kI1 < 0 || kI2 < 0) return 0;
        if(kI1 > kI2) {
            return this.val[kI1][kI2];
        } else {
            return this.val[kI2][kI1];
        }
    }
}

class CanvasFreeLine {
    private dom: HTMLCanvasElement;
    private radius: number;
    private imgs: ImageObj[];
    private mousePos: {x:number, y:number}
    private data: DataSave;
    constructor(dom: HTMLCanvasElement) {
        const imgs: ImageObj[] = [];
        const keys: string[] = [];
        props.trials.forEach(item => {
            const img = new Image();
            img.src = loader.getAssets(`./assets/cro_minion/${item.name}.jpg`);
            img.onload = () => {
                keys.push(item.name);
                imgs.push({
                    name: item.name,
                    pos: {
                        x: item.posX,
                        y: item.posY
                    },
                    size: { width: img.width / 10, height: img.height / 10 },
                    domObj: img,
                    isChoose: false
                });
                if (imgs.length == props.trials.length) {
                    this.initFunc();
                    this.data = new DataSave(keys);
                }
            };
        });
        this.imgs = imgs;
        this.dom = dom;
        this.radius = 250;
        this.mousePos = {x: 0, y:0};
        this.data = new DataSave([]);
    }
    initFunc() {
        this.reset_canvas_size();
        this.data.reset();
    }
    reset_canvas_size() {
        const parentDom = this.dom.parentElement as HTMLDivElement;
        this.dom.width = parentDom.clientWidth;
        this.dom.height = parentDom.clientHeight;
    }
    render_bg(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.dom.width / 2, this.dom.height / 2, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    render_img(ctx: CanvasRenderingContext2D) {
        this.imgs.forEach(obj => {
            ctx.drawImage(obj.domObj, 0, 0, obj.domObj.width, obj.domObj.height,
                obj.pos.x - obj.size.width / 2,
                obj.pos.y - obj.size.height / 2, obj.size.width, obj.size.height);
        });
    }
    render_line(ctx: CanvasRenderingContext2D) {
        for (let i1 = 0; i1 < this.imgs.length; i1++) {
            if(this.imgs[i1].isChoose) {
                // 添加直线到鼠标位置
                ctx.beginPath();
                ctx.moveTo(this.imgs[i1].pos.x, this.imgs[i1].pos.y);
                ctx.lineTo(this.mousePos.x, this.mousePos.y);
                ctx.stroke();
                ctx.closePath();
            }
            for (let i2 = i1 + 1; i2 < this.imgs.length; i2++) {
                const k1 = this.imgs[i1].name;
                const k2 = this.imgs[i2].name;
                const val = this.data.getVal(k1, k2);
                if (val) {
                    ctx.beginPath();
                    ctx.moveTo(this.imgs[i1].pos.x, this.imgs[i1].pos.y);
                    ctx.lineTo(this.imgs[i2].pos.x, this.imgs[i2].pos.y);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    }
    render() {
        // 渲染
        const ctx = this.dom.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, this.dom.width, this.dom.height);

        ctx.fillStyle = "#999";
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#fff";
        this.render_bg(ctx);
        this.render_img(ctx);
        ctx.strokeStyle = "#f00";
        ctx.lineWidth = 5;
        this.render_line(ctx);

        if (true) {
            window.requestAnimationFrame(() => {
                this.render();
            });
        }
    }

    get_activate_img(pos: { x: number, y: number }) {
        const res: ImageObj[] = [];
        this.imgs.forEach(item => {
            const dx = Math.abs(pos.x - item.pos.x);
            const dy = Math.abs(pos.y - item.pos.y);
            if (dx < item.size.width / 2 && dy < item.size.height / 2) {
                res.push(item);
            }
        });
        return res;
    }
    onmouse(action: string, pos: { x: number, y: number }) {
        if (action == "up") {
            const keys = ["", ""];
            this.get_activate_img(pos).forEach(item => {
                keys[1] = item.name;
            });
            this.imgs.forEach(item => {
                if(item.isChoose) keys[0] = item.name;
                item.isChoose = false;
            });
            this.data.setVal(keys[0], keys[1], 1 - this.data.getVal(keys[0], keys[1]))
        } else if (action == "down") {
            this.get_activate_img(pos).forEach(item => {
                item.isChoose = true;
            });
        } else if (action == "move") {
            this.mousePos = pos;
        }
    }

    getKey() {
        return this.data.keys;
    }
    getVal() {
        return this.data.val;
    }
}

let cfl: CanvasFreeLine;
onMounted(() => {
    const dom = document.querySelector("canvas") as HTMLCanvasElement;
    cfl = new CanvasFreeLine(dom);
    cfl.render();

    const calcRelativePos = (e: MouseEvent) => {
        const { top, left } = dom.getBoundingClientRect();
        const { clientX, clientY } = e;
        return {
            y: clientY - top,
            x: clientX - left
        }
    };
    dom.addEventListener("mousedown", (e) => {
        cfl.onmouse("down", calcRelativePos(e))
    });
    dom.addEventListener("mouseup", (e) => {
        cfl.onmouse("up", calcRelativePos(e))
    });
    dom.addEventListener("mousemove", (e) => {
        cfl.onmouse("move", calcRelativePos(e))
    });
});

const endTrial = () => {
    emits("endTrial", cfl.getKey(), cfl.getVal());
}
const resetButton = () => {
    cfl.initFunc();
}
</script>

<template>
    <div class="free-line-box">
        <canvas></canvas>
        <div class="button-box">
            <div @click="endTrial">继续</div>
            <div @click="resetButton">重置</div>
        </div>
    </div>
</template>

<style scoped>
.free-line-box {
    width: 1280px;
    height: 720px;
    overflow: hidden;
    position: relative;
    user-select: none;
}

.button-box {
    display: block;
    bottom: 0;
    left: 50%;
    position: absolute;
    transform: translate(-50%, -50%);
}

.button-box > div {
    display: inline-block;
    width: 128px;
    height: 48px;
    margin: 8px 24px;
    font-size: 36px;
    line-height: 48px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    background: var(--dashboard-layout);
    border-radius: 25px;
}
.button-box > div:hover {
    background-color: var(--font-desc);
}
</style>