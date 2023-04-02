<template>
    <div>
        <Window :show="windowConfig.show" :buttons="windowConfig.buttons" :showCancel="windowConfig.showCancel"
            @close="windowClose">
            <el-row :gutter="10">
                <el-col :span="10">
                    <el-card class="box-card">
                        <template #header>
                            <div class="card-header">
                                <span>专题文章</span>
                            </div>
                        </template>

                        <el-tree class="tree-panel" ref="refTree" :data="blogList" defaultExpandAll node-key="blogId"
                            :expand-on-click-node="false" :props="treeProps" :highlight-current="true"
                            @node-click="treeNodeClick">
                            <template #default="{ node, data }">
                                <div class="custom-node-style">
                                    <span class="node-title">
                                        <span v-if="data.status == 0" :style="{ 'color': 'red', 'font-size': '13px' }">{{
                                            data.title
                                        }}</span>
                                        <span v-else :style="{ 'color': 'green', 'font-size': '13px' }">{{ data.title
                                        }}</span>
                                    </span>

                                </div>
                            </template>
                        </el-tree>
                    </el-card>
                </el-col>
                <el-col :span="14">
                    <el-card class="box-card">
                        <template #header>
                            <div class="card-header">
                                <span>文章详情</span>
                            </div>
                        </template>
                            <div class="title">{{ blog.title }}</div>
                            <div v-html="blog.content" class="blog-detail">
                            </div>
                    </el-card>
                </el-col>

            </el-row>

        </Window>
    </div>
</template>

<script setup>
import { getCurrentInstance, ref, reactive } from "vue"
import hljs from "highlight.js"
import "highlight.js/styles/atom-one-light.css"
import { nextTick } from "process";
const { proxy } = getCurrentInstance()
const blog = ref({})
const api = {
    getBlogDetail: '/blog/getBlogById',
    getSpecialInfo: 'blog/getSpecialInfo',
}

const windowConfig = reactive({
    show: false,
    showCancel: false,
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

const currentBlogId = ref(null)
const showDetail = async (data) => {
    windowConfig.show = true
    // 获取所有文章树
    getSpecialInfo(data.categoryId)
    currentBlogId.value = data.blogId
    // 获取详情
    showBlogDetail(data.blogId)

}

const showBlogDetail = async (blogId) => {
    let result = await proxy.Request({
        url: api.getBlogDetail,
        params: {
            blogId: blogId
        }
    })
    if (!result) {
        return
    }
    blog.value = result.data
    nextTick(() => {
        let blocks = document.querySelectorAll("pre code")
        blocks.forEach((block) => {
            hljs.highlightBlock(block)
        })
    })
}

const treeNodeClick = (data) => {
    if (data.blogId == 0) {
        return;
    }
    showBlogDetail(data.blogId)
}

// 属性展示专题
const treeProps = {
    children: "children",
    label: 'title',
    value: "blogId"
}

const refTree = ref(null)
const blogList = ref([])
const getSpecialInfo = async (categoryId) => {
    let result = await proxy.Request({
        url: api.getSpecialInfo,
        params: {
            categoryId: categoryId,
            showType: '1'
        }
    })
    if (!result) {
        return
    }
    blogList.value = result.data

    nextTick(() => {
        refTree.value.setCurrentKey(currentBlogId.value)
    })
}

// 暴露给父组件使用
defineExpose({ showDetail })

const windowClose = () => {
    windowConfig.show = false
}
</script>

<style lang="scss" scoped>
.title {
    font-size: 18px;
}

.blog-detail {
    blockquote {
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid #dfe2e5;
    }

    img {
        max-width: 50%;
    }
}
</style>