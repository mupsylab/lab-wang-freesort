<template>
    <div class="end-exp">
        <div class="content-box">
            实验结束
            <slot></slot>
        </div>
        <div class="footer">
            &copy; Mupsy 技术支持
        </div>
    </div>
</template>

<style scoped>
.end-exp {
    text-align: center;
}
.end-exp .content-box {
    font-size: 48px;
    line-height: 96px;
}
.end-exp .footer {
    color: var(--font-desc);
}
</style>