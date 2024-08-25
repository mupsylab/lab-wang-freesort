import browser from "browser-tool";
import { defineStore } from "pinia";
import { Dictionary } from "../../types/interface";

export const useCheckBrowserInfo = defineStore("browser-info", {
    state() {
        const browser: Dictionary = {};
        return {
            isInit: false,
            browser
        };
    },
    actions: {
        init() {
            browser.getInfo().then((r) => {
                Object.keys(r).forEach(k => {
                    this.browser[k] = r[k];
                });
                this.isInit = true;
            });
        }
    }
});