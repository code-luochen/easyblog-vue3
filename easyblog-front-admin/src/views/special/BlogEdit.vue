<template>
    <div>
        <Window :show="windowConfig.show" :buttons="windowConfig.buttons" @close="windowClose">
            <!-- 输入标题区域 -->
            <el-form :model="blogFormData" ref="blogFormRef" :rules="rules">
                <el-form-item prop="title">
                    <div class="title-input">
                        <el-input v-model="blogFormData.title" placeholder="请输入博客标题"></el-input>
                    </div>

                </el-form-item>
                <el-form-item prop="content">
                    <div :style="{ width: '100%' }">
                        <!-- 富文本编辑器 -->
                        <EditorHtml :height="editorHeightHtml" v-model="blogFormData.content"
                            v-if="blogFormData.editorType == 0"></EditorHtml>
                        <!-- Markdown编辑器 -->
                        <EditorMarkdown v-else :height="editorHeightMark" v-model="blogFormData.markdownContent"
                            @htmlContent="setHtmlContent"></EditorMarkdown>
                    </div>
                </el-form-item>
            </el-form>
        </Window>
    </div>
</template>

<script setup>
import { getCurrentInstance,  reactive, ref, nextTick, onUnmounted } from 'vue'
const { proxy } = getCurrentInstance()

const editorHeightHtml = window.innerHeight - 260;
const editorHeightMark = window.innerHeight - 230;
const api = {
    saveBlog: '/blog/saveBlog4Special',
    // 获取他的编辑器类型
    getUserInfo: 'getUserInfo',
    getBlogDetail: '/blog/getBlogById',
    // 自动保存
    autoSave: "/blog/autoSaveBlog4Special"
}

const blogFormRef = ref(null)

// 博客正文
let blogFormData = ref({})
const init = (type, data) => {
    startTimmer()
    windowConfig.show = true
    nextTick(() => {
        blogFormRef.value.resetFields()
        blogFormData.value = { categoryId: data.categoryId ,pBlogId:data.blogId}
        // 用户新增博客操作
        if (type === 'add') {
            getUserInfo()
        }
        // 用户修改操作
        else {
            getBlogDetail(data.blogId)
        }
    })
}

// 将这个方法导出去给父组件使用
defineExpose({ init })

const getUserInfo = async () => {
    let result = await proxy.Request({
        url: api.getUserInfo
    })
    if (!result) {
        return
    }
    blogFormData.value.editorType = result.data.editorType
}

// 获取博客详情
const getBlogDetail = async (blogId) => {
    let result = await proxy.Request({
        url: api.getBlogDetail,
        params: {
            blogId
        }
    })
    if (!result) {
        return
    }
    blogFormData.value = result.data
    if (result.data.tag) {
        blogFormData.value.tag = result.data.tag.split("|")
    } else {
        blogFormData.value.tag = []
    }
}


let timmer = ref(null)

// 开始计时器
const startTimmer = () => {
    timmer.value = setInterval(() => {
        autoSave()
    }, 10000)
}

// 清除计时器
const cleanTimmer = () => {
    if (timmer.value !== null) {
        clearInterval(timmer.value)
        timmer.value = null
    }
}

// 自动保存
const autoSave = async () => {
    if (blogFormData.value.title == null && blogFormData.value.content == null || timmer.value == null) {
        return
    }
    const params = {}
    Object.assign(params, blogFormData.value)

    let result = await proxy.Request({
        url: api.autoSave,
        showLoading: false,
        params: params
    })
    if (!result) {
        return
    }
    blogFormData.value.blogId = result.data
}

// 新增，修改
const windowConfig = reactive({
    show: false,
    buttons: [
        {
            type: 'danger',
            text: '确定',
            click: (e) => {
                submitBlog()
            }
        }
    ]
})
const submitBlog = () => {
    blogFormRef.value.validate(async(valid) => {
        if (!valid) {
            return;
        }
        let params = Object.assign({},blogFormData.value)

        let result = await proxy.Request({
            url:api.saveBlog,
            params
        })
        if(!result){
            return 
        }
        proxy.Message.success("保存博客成功")
        windowClose()
    })
}
// 获取markdown文本编辑器的内容
const setHtmlContent = (htmlContent) => {
    // 将文本信息和富文本编辑器内容关联
    blogFormData.value.content = htmlContent
}
const rules = {
    title: [{ required: true, message: '请输入标题' }],
    content: [{ required: true, message: '请输入正文' }],
    categoryId: [{ required: true, message: '请选择博客分类' }],
    type: [{ required: true, message: '请选择博客类型' }],
    allowComment: [{ required: true, message: '请选择是否允许评论' }],
    reprintUrl: [{ required: true, message: '请输入原文地址' }]
}
const emit = defineEmits()

const windowClose = () => {
    windowConfig.show = false
    emit('callback')
    if (timmer.value !== null) {
        cleanTimmer()
    }
}
onUnmounted(() => {
    cleanTimmer()
})




</script>

<style lang="scss" >
.title-input {
    border-bottom: 1px solid #ddd;
    width: 100%;

    .el-input {
        font-size: 18px;

        .el-input__wrapper {
            box-shadow: none;
        }
    }
}
</style>