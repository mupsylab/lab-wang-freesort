interface BaseQuesType {
    name: string;
    title: string;
    desc?: string;
    required?: boolean;
}

interface RadioQuesType extends BaseQuesType {
    type: "radio";
    choices: string[] | number[]; // 强制 choices 为字符串数组
}

interface TextQuesType extends BaseQuesType {
    type: "text";
    placeholder?: string; // placeholder 可选
}

interface NumberQuesType extends BaseQuesType {
    type: "number";
    placeholder?: string; // placeholder 可选
    max?: number,
    min?: number
}

type QuesType = RadioQuesType | TextQuesType | NumberQuesType;
export { QuesType };