export interface Dictionary {
    [Key: string]: string | number | boolean
}

export interface OP {
    [Key: string]: Array<number[]>
}

declare module 'browser-tool' {
    function getInfo(): Promise<Dictionary>
}