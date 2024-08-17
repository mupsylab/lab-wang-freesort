import browser from "browser-tool";
import { defineStore } from "pinia";
import { Dictionary } from "../../types/interface";

export const useCheckBrowserInfo = defineStore("browser-info", {
    state() {
        const browser: Dictionary = {};
        return {
            browser
        };
    },
    actions: {
        init() {
            browser.getInfo().then((r) => {
                Object.keys(r).forEach(k => {
                    this.browser[k] = r[k];
                });
            });
        }
    }
});