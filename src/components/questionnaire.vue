<template>
    <div class="question-naire-box">
        <div class="title-box">
            <div class="title">{{ props.title }}</div>
            <div class="desc">{{ props.desc }}</div>
        </div>
        <form class="question-box" action="" @submit="formSubmit">
            <div v-for="item1, i1 in questionList" class="q-box">
                <div class="text">
                    <div class="title">{{ item1.title }}</div>
                    <div class="desc">{{ item1.desc }}</div>
                </div>
                <div class="radio" v-if="item1.type == 'radio'">
                    <label :for="`${i1}_${i2}`" v-for="item2, i2 in item1.choices">
                        <input type="radio" :name="`${item1.name}`" :id="`${i1}_${i2}`" :value="`${i2}`" :required="item1.required ? item1.required : true" />
                        {{ item2 }}
                    </label>
                </div>
                <div class="number" v-if="item1.type == 'number'">
                    <input type="number" :name="`${item1.name}`" :placeholder="item1.placeholder" :min="item1.min" :max="item1.max" :required="item1.required ? item1.required : true" />
                </div>
                <div class="text" v-if="item1.type == 'text'">
                    <input type="text" :name="`${item1.name}`" :placeholder="item1.placeholder" :required="item1.required ? item1.required : true" />
                </div>
            </div>
            <input type="submit" hidden>
        </form>
        <div class="button-box">
            <div class="submit" @click="submit">提交</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { QuesType } from '../../types/questionnaire';

const emits = defineEmits(["endTrial"]);
const props = defineProps({
    title: String,
    desc: String,
    questionList: Array<QuesType>
});

const { questionList } = props;

const submit = () => { (document.querySelector("input[type=submit]") as HTMLElement).click(); };
const formSubmit = (e: Event) => {
    e.preventDefault();

    const r: { [Key: string]: string } = {};
    const doms = document.querySelectorAll("input");
    doms.forEach((dom) => {
        if (dom.type == "radio" && dom.checked) {
            r[dom.name] = dom.value;
        } else if (["number", "text"].indexOf(dom.type) >= 0) {
            r[dom.name] = dom.value;
        }
    });
    emits("endTrial", r);

    return false;
}
</script>

<style scoped>
.question-naire-box {
    width: 300px;
    padding: 20px;
    border-radius: 10px;
    user-select: none;
    background-color: var(--dashboard-layout);
}

.title-box {
    width: 100%;
    text-align: left;
}

.title-box .title {
    height: 36px;
    font-size: 24px;
    line-height: 1.5em;
    color: var(--font-color);
}

.title-box .desc {
    font-size: 16px;
    line-height: 18px;
    color: var(--font-desc);
}

.button-box {
    width: 100%;
    text-align: center;
}

.button-box>div {
    width: 80px;
    height: 40px;
    margin: auto;
    font-size: 24px;
    line-height: 40px;
    cursor: pointer;
    color: var(--font-high-light);
    background-color: var(--menu-activate);
}

.question-box {
    display: block;
    width: 240px;
    height: 450px;
    margin: 20px auto 20px auto;
    padding: 0 5px 0 0;
    text-align: left;
    overflow: hidden auto;
}

.q-box {
    width: 200px;
    background-color: var(--dashboard-dividing);
    margin: 10px 0;
    box-sizing: content-box;
    padding: 10px 10px;
    border-radius: 10px;
}

.q-box .text .title {
    font-size: 18px;
}

.q-box .text .desc {
    font-size: 12px;
    color: var(--font-desc);

}

.q-box .radio label {
    display: block;
    width: 100%;
    text-align: left;
    cursor: pointer;
}

input[type=text],
input[type=number] {
    display: block;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    border: none;
    font-size: 16px;
    line-height: 36px;
    color: var(--font-color);
    background-color: var(--bg-color-input);
}
</style>