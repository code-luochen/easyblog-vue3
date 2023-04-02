<template>
    <div>
        <EditorMarkdown v-model="markdownContent"></EditorMarkdown>
        <!-- <EditorHtml v-model="markdownContent"></EditorHtml> -->
        {{ markdownContent }}
    </div>
</template>

<script setup>
import {ref} from 'vue'
const markdownContent = ref()

</script>

<style lang="scss" scoped>

</style>