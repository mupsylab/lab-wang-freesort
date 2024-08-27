import { defineStore } from "pinia";

export const useLoaderAssets = defineStore("loader-assets-to-blobs", {
    state() {
        return {
            _running: false,
            tmpSet: new Set<string>(), // 用于存储准备加载的静态资源
            blobMap: new Map<string, string>(), // 用于存储最后的blob资源
        }
    },
    getters: {
        isInit(): boolean { return !!this.blobMap.size },
        isRunning(): boolean { return this._running },
        isFinish(): boolean { return !this.tmpSet.size },
        progress(): {len: number, left: number} {
            return {
                len: this.tmpSet.size + this.blobMap.size,
                left: this.tmpSet.size
            }
        }
    },
    actions: {
        _addAssetsToBlobAsync(url: string) {
            const _this = this;
            fetch(url, {
                keepalive: false,
                method: "get"
            }).then(r => r.blob())
            .then(blob => {
                _this._loadSuccess(url, blob);
            })
            .catch((e: string) => {
                _this._loadError(url, e);
            })
        },
        _loadSuccess(url: string, blob: Blob) {
            this.tmpSet.delete(url);
            this.blobMap.set(url, URL.createObjectURL(blob));
        },
        _loadError(url: string, e: string) {
            console.warn(`load Assets Error: ${e}, url: ${url}`);
        },
        addAssets(str: string) {
            this.tmpSet.add(str);
        },
        getAssets(str: string) {
            this.blobMap.get(str);
        },
        startLoad() {
            if(this.isRunning) {
                return 0;
            }
            this._running = false;

            this.tmpSet.forEach(v => {
                this._addAssetsToBlobAsync(v);
            });

            this._running = true;
            return 1;
        }
    }
});