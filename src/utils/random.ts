import { OP } from "../../types/interface";

export function shuffleNoRepeats(arr: Array<any>, equalityTest: (a: any, b: any) => boolean) {
    if (!Array.isArray(arr)) {
        console.error("First argument to shuffleNoRepeats() must be an array.");
    }
    if (typeof equalityTest !== "undefined" && typeof equalityTest !== "function") {
        console.error("Second argument to shuffleNoRepeats() must be a function.");
    }
    // define a default equalityTest
    if (typeof equalityTest == "undefined") {
        equalityTest = function (a, b) {
            if (a === b) {
                return true;
            } else {
                return false;
            }
        };
    }
    // new function designed by mupsy
    let tmpA: OP = {};
    arr.forEach((v1, i1) => {
        // 0 -> same
        // 1 -> different
        tmpA[i1] = [[], []];
        arr.forEach((v2, i2) => {
            let result = equalityTest(v1, v2) ? 1 : 0;
            if (result == 0) {
                tmpA[i1][1].push(i2);
            } else {
                tmpA[i1][0].push(i2);
            }
        });
    });

    let re = []; // result
    let next = Object.keys(tmpA).map((e) => {
        return parseInt(e);
    }); // 下一个能取的值
    let keep: number[] = []; // 下一个不能取的值

    // 1. 判断在下一个能取的值中 相同数目最多的数量 以及 索引值
    while (Object.keys(tmpA).length > 0) {
        // 取出next中 相同数量最大的索引值
        let max_num = 0,
            max_i: number[] = [];
        next.forEach((v, _i) => {
            if (tmpA[v][0].length > max_num) {
                max_num = tmpA[v][0].length;
                max_i = [v];
            } else if (tmpA[v][0].length == max_num) {
                max_i.push(v);
            }
        });
        let ii = next.length
            ? max_i[Math.floor(Math.random() * max_i.length)]
            : keep[Math.floor(Math.random() * keep.length)];
        re.push(ii); // result
        // 删除 取出的值
        Object.keys(tmpA).forEach((v, _i) => {
            if (tmpA[v][0].indexOf(ii) >= 0) tmpA[v][0].splice(tmpA[v][0].indexOf(ii), 1);
            if (tmpA[v][1].indexOf(ii) >= 0) tmpA[v][1].splice(tmpA[v][1].indexOf(ii), 1);
        });
        // 取出下一个所需的值
        next = tmpA[ii][1];
        keep = tmpA[ii][0];
        delete tmpA[ii];
    }
    let out: any[] = [];
    re.forEach((v) => {
        out.push(arr[v]);
    });
    return out;
}