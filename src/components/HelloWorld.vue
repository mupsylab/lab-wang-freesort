<template>
    <div style="{color: color}">
        <slot>Hello World!</slot>
    </div>
</template>

<style>

</style>

<script>
    export default {
        props: {
            color: String
        }
    }
</script>