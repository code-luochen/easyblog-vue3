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

            <Dialog :title="dialogConfig.title" width="800" :buttons="dialogConfig.buttons" :show="dialogConfig.show"
                @close="dialogConfig.show = false">
                <el-form :model="blogFormData" :rules="rules" ref="settingsFormRef" class="blog-setting-form"
                    label-width="80px">
                    <el-form-item prop="categoryId" label="博客分类">
                        <el-select v-model="blogFormData.categoryId" clearable placeholder="请选择分类"
                            :style="{ width: '100%' }">
                            <el-option v-for="item in categoryList" :value="item.categoryId"
                                :label="item.categoryName"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item prop="cover" label="封面">
                        <CoverUpload v-model="blogFormData.cover"></CoverUpload>
                    </el-form-item>
                    <el-form-item prop="type" label="博客类型">
                        <el-radio-group v-model="blogFormData.type">
                            <el-radio :label="0">原创</el-radio>
                            <el-radio :label="1">转载</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item prop="reprintUrl" label="原文地址" v-if="blogFormData.type == 1">
                        <el-input placeholder="请输入原文地址" :autosize="{
                            minRows: 4, maxRows: 4
                        }" v-model="blogFormData.reprintUrl">
                        </el-input>
                    </el-form-item>

                    <el-form-item prop="allowComment" label="评论">
                        <div class="allow-comment">
                            <el-radio-group v-model="blogFormData.allowComment">
                                <el-radio :label="1">允许</el-radio>
                                <el-radio :label="0">不允许</el-radio>
                            </el-radio-group>
                            <span class="info">请先在评论设置里设置好相应参数，评论才会生效</span>
                        </div>
                    </el-form-item>

                    <el-form-item prop="summary" label="博客摘要">
                        <el-input type="textarea" placeholder="请输入简介" :autosize="{
                            minRows: 4, maxRows: 4
                        }" v-model="blogFormData.summary">
                        </el-input>
                    </el-form-item>

                    <el-form-item prop="categoryDesc" label="博客标签">
                        <div class="tag-input-panel">
                            <el-tag v-for="(item, index) in blogFormData.tag" closable @close="closeTag(index)">
                                {{ item }}
                            </el-tag>
                            <span class="info" v-if="!blogFormData.tag.length > 0">添加标签更容易被搜索引擎收录</span>
                            <span class="iconfont icon-jiahao" v-if="!showTagInput" @click="showTagInputHandler"></span>
                            <el-input class="tag-input" v-if="showTagInput" v-model.trim="tagInputValue"
                                @blur="tagInputResult" @keyup.enter="tagInputResult"></el-input>
                        </div>
                    </el-form-item>
                </el-form>
            </Dialog>
        </Window>
    </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, reactive, ref, nextTick, onUnmounted } from 'vue'
const { proxy } = getCurrentInstance()

const editorHeightHtml = window.innerHeight - 260;
const editorHeightMark = window.innerHeight - 230;
const api = {
    // 获取博客分类
    loadCategory: "/category/loadAllCategory4Blog",
    saveBlog: '/blog/saveBlog',
    // 获取他的编辑器类型
    getUserInfo: 'getUserInfo',
    getBlogDetail: '/blog/getBlogById',
    // 自动保存
    autoSave: "/blog/autoSaveBlog"
}

const blogFormRef = ref(null)

// 博客正文
let blogFormData = ref({
    tag: []
})

const init = (type, data) => {
    startTimmer()
    windowConfig.show = true
    nextTick(() => {
        blogFormRef.value.resetFields()
        blogFormData.value = { tag: [] }
        // 用户新增博客操作
        if (type === 'add') {
            dialogConfig.title = '新增博客'
            getUserInfo()
        }
        // 用户修改操作
        else {
            dialogConfig.title = '修改博客'
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
    if (blogFormData.value.title == null && blogFormData.value.content == null || timmer.value == null || dialogConfig.show) {
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
                showSettings()
            }
        }
    ]
})
const showSettings = () => {
    blogFormRef.value.validate((valid) => {
        if (!valid) {
            return;
        }
        dialogConfig.show = true
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


// 提交博客按钮对象
const dialogConfig = reactive({
    show: false,
    title: '博客设置',
    buttons: [
        {
            type: "danger",
            text: "确定",
            click: (e) => {
                submitBlog()
            }
        }
    ]
})

// 获取博客的分类
const categoryList = ref([])
const loadCategoryList = async () => {
    let result = await proxy.Request({
        url: api.loadCategory
    })
    if (!result) {
        return;
    }
    categoryList.value = result.data
}
// 页面第一次渲染后加载分数据
onMounted(() => {
    loadCategoryList()
})

onUnmounted(() => {
    cleanTimmer()
})


//删除标签，关闭标签
const closeTag = (index) => {
    blogFormData.value.tag.splice(index, 1)
}
// 是否显示tag输入框
const showTagInput = ref(false)

// 点击添加输入框
const showTagInputHandler = () => {
    showTagInput.value = true
}

// 标签输入的值
const tagInputValue = ref('')

// 输入后的结果
const tagInputResult = () => {
    showTagInput.value = false
    if (tagInputValue.value === '' || tagInputValue.value === " ") {
        return;
    }
    // 如果用户输入一样的数据，我们应该将他排除掉
    if (blogFormData.value.tag.includes(tagInputValue.value)) {
        return;
    }
    blogFormData.value.tag.push(tagInputValue.value)
    tagInputValue.value = ''

}
const settingsFormRef = ref(null)

// 提交博客
const submitBlog = () => {
    settingsFormRef.value.validate(async (valid) => {
        if (!valid) {
            return;
        }
        const params = {}
        Object.assign(params, blogFormData.value)

        if (Array.isArray(params.tag)) {
            params.tag = params.tag.join('|')
        }

        let result = await proxy.Request({
            url: api.saveBlog,
            params
        })
        if (!result) {
            return
        }
        proxy.Message.success("保存博客成功")
        emit('callback')
        dialogConfig.show = false
        windowClose()
    })
}

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

.blog-setting-form {
    .allow-comment {
        display: flex;
        align-items: center;

        .info {
            margin-left: 10px;
            color: #908e8e;
            font-size: 13px;
        }
    }

    .tag-input-panel {
        display: flex;
        align-items: center;

        .info {
            margin-right: 10px;
            color: #908e8e;
            font-size: 13px;
        }

        .icon-jiahao {
            margin: 0 10px;
            color: red;
            cursor: pointer;
            margin-right: 10px;
        }

        .tag-input {
            width: 100px;
        }

        .el-tag {
            margin: 3px;
        }
    }
}
</style>