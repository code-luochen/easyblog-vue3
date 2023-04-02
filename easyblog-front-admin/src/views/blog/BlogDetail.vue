<template>
    <div>
        <Window :show="windowConfig.show" :buttons="windowConfig.buttons"
        :showCancel="windowConfig.showCancel"
        @close="windowClose">
            <div class="title">{{ blog.title }}</div>
            <div v-html=" blog.content " class="blog-detail">
            </div>
        </Window>
    </div>
</template>

<script setup>
import { getCurrentInstance, ref ,reactive} from "vue"
import hljs from "highlight.js"
import "highlight.js/styles/atom-one-light.css"
import { nextTick } from "process";
const { proxy } = getCurrentInstance()
const blog = ref({})

const api = {
    getBlogDetail: '/blog/getBlogById',
}

const windowConfig = reactive({
    show: false,
    showCancel:false,
    buttons: [
        {
            type: 'danger',
            text: '关闭',
            click: (e) => {
                windowConfig.show = false
            }
        }
    ]
})

const showDetail = async (blogId) => {
    windowConfig.show = true
    let result = await proxy.Request({
        url: api.getBlogDetail,
        params: {
            blogId
        }
    })
    if (!result) {
        return
    }
    blog.value = result.data

    nextTick(()=>{
        let blocks = document.querySelectorAll("pre code")
        blocks.forEach((block)=>{
            hljs.highlightBlock(block)
        })
    })

}
// 暴露给父组件使用
defineExpose({ showDetail })

const windowClose = () => {
    windowConfig.show = false
}
</script>

<style lang="scss" scoped>
.title{
    font-size: 18px;
}
.blog-detail{
    blockquote{
        padding: 0 1em;
        color:#6a737d;
        border-left: 0.25em solid #dfe2e5;
    }
    img{
        max-width: 50%;
    }
}
</style>