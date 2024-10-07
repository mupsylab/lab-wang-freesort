<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useLoaderAssets } from '../../../store/loadAssetsToBlob';
const loader = useLoaderAssets();

const props = defineProps({
    roleName: {
        type: Array<string>,
        default: ["baby", "man", "monster", "short", "tall"]
    }
});
const emits = defineEmits(["endTrial", "dragEvent"]);

interface ImageObj {
    name: string, // 标识符
    pos: { x: number, y: number },
    size: { width: number, height: number },
    domObj: HTMLImageElement,
    isChoose: Boolean, // 判断是否被选中，以此进行移动
    chooseOffset: { x: number, y: number }, // 被选中之后，偏移鼠标位置
    isEnd: Boolean, // 判断是否拖动到指定位置
}

interface bgOpts {
    strokeStyle: string,
    lineWidth: number
}

const end = ref(false);
class CanvasFreeSort {
    private dom: HTMLCanvasElement;
    private imgs: ImageObj[];
    private radius: number;
    private strokeOpts: bgOpts;
    constructor(dom: HTMLCanvasElement, roleName: string[]) {
        const imgs: ImageObj[] = [];
        roleName.forEach(item => {
            const img = new Image();
            img.src = loader.getAssets(`./assets/cro_minion/${item}.jpg`);
            img.onload = () => {
                imgs.push({
                    name: item,
                    pos: { x: 0, y: 0 },
                    size: { width: img.width / 10, height: img.height / 10 },
                    domObj: img,
                    isChoose: false,
                    chooseOffset: { x: 0, y: 0 },
                    isEnd: false
                });
                if (imgs.length == roleName.length) {
                    this.initFunc();
                }
            };
        });

        const opt: bgOpts = {
            strokeStyle: "#fff",
            lineWidth: 1
        }

        this.dom = dom;
        this.imgs = imgs;
        this.radius = 250;
        this.strokeOpts = opt;
    }
    initFunc() {
        this.reset_canvas_size();
        this.reset_img_pos();
        this.imgs.forEach(item => {
            item.isChoose = false;
            item.isEnd = false;
        });
    }
    reset_canvas_size() {
        const parentDom = this.dom.parentElement as HTMLDivElement;
        this.dom.width = parentDom.clientWidth;
        this.dom.height = parentDom.clientHeight;
    }
    reset_img_pos() {
        // 计算初始图片位置
        const len = this.imgs.length;
        for (let i = 0; i < len; i++) {
            const angle = (Math.PI * 2 / len) * i - (Math.PI / 2);
            this.imgs[i].pos.x = Math.round(Math.cos(angle) * (this.radius + 80) + this.dom.width / 2);
            this.imgs[i].pos.y = Math.round(Math.sin(angle) * (this.radius + 80) + this.dom.height / 2);
        }
    }

    render_bg(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.dom.width / 2, this.dom.height / 2, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#999";
        ctx.fill();

        ctx.lineWidth = this.strokeOpts.lineWidth;
        ctx.strokeStyle = this.strokeOpts.strokeStyle;
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
    render() {
        // 渲染
        const ctx = this.dom.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, this.dom.width, this.dom.height);
        this.render_bg(ctx);
        this.render_img(ctx);

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
            this.strokeOpts.strokeStyle = "#000";
            this.strokeOpts.lineWidth = 1;

            this.imgs.forEach(item => {
                if(item.isChoose) {
                    emits("dragEvent", {
                        name: item.name,
                        posX: item.pos.x,
                        posY: item.pos.y
                    });
                }
                item.isChoose = false;
            });
        } else if (action == "down") {
            this.get_activate_img(pos).forEach(item => {
                const dx = Math.abs(pos.x - item.pos.x);
                const dy = Math.abs(pos.y - item.pos.y);
                item.isChoose = true;
                item.chooseOffset = {
                    x: pos.x < item.pos.x ? -dx : dx,
                    y: pos.y < item.pos.y ? -dy : dy
                }
            });
        } else if (action == "move") {
            this.imgs.forEach(item => {
                if(item.isChoose) {
                    item.pos = {
                        x: pos.x - item.chooseOffset.x,
                        y: pos.y - item.chooseOffset.y
                    }
                    const dist = Math.pow(Math.pow(item.pos.x - this.dom.width / 2, 2) + Math.pow(item.pos.y - this.dom.height / 2, 2), 0.5);
                    this.strokeOpts.lineWidth = 5;
                    if (dist < this.radius) {
                        item.isEnd = true;
                        this.strokeOpts.strokeStyle = "#0f0";
                    } else {
                        item.isEnd = false;
                        this.strokeOpts.strokeStyle = "#f00";
                    }
                    this.can_end();
                }
            });
        }
    }
    can_end() {
        let tmpA = false;
        this.imgs.forEach(item => {
            if(!item.isEnd) {
                tmpA = true;
            }
        });
        if(!tmpA) {
            end.value = true;
        } else {
            end.value = false;
        }
    }
    submit() {
        const res: object[] = [];
        this.imgs.forEach(item => {
            res.push({
                name: item.name,
                posX: item.pos.x,
                posY: item.pos.y
            });
        });
        return res;
    }
}
let cfs: CanvasFreeSort;

const endTrial = () => {
    emits("endTrial", cfs.submit());
};
const reset = () => {
    cfs.initFunc();
    cfs.can_end();
}
onMounted(() => {
    const dom = document.querySelector("canvas") as HTMLCanvasElement;
    cfs = new CanvasFreeSort(dom, props.roleName);
    cfs.render();

    const calcRelativePos = (e: MouseEvent) => {
        const { top, left } = dom.getBoundingClientRect();
        const { clientX, clientY } = e;
        return {
            y: clientY - top,
            x: clientX - left
        }
    };
    dom.addEventListener("mousedown", (e) => {
        cfs.onmouse("down", calcRelativePos(e))
    });
    dom.addEventListener("mouseup", (e) => {
        cfs.onmouse("up", calcRelativePos(e))
    });
    dom.addEventListener("mousemove", (e) => {
        cfs.onmouse("move", calcRelativePos(e))
    });
});
</script>

<template>
    <div class="free-sort-box">
        <canvas></canvas>
        <div class="button-box">
            <div v-if="end" @click="endTrial">继续</div>
            <div @click="reset">重置</div>
        </div>
    </div>
</template>

<style scoped>
.free-sort-box {
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