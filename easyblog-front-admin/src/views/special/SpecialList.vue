<template>
    <div>
        <el-button type="danger" @click="showEdit('add')">新增专题</el-button>
        <el-row :gutter="10" :style="{ 'margin-top': '10px' }">
            <!-- 左边 -->
            <el-col :span="14">
                <el-card class="box-card">
                    <template #header>
                        <div class="card-header">
                            <span>专题</span>
                        </div>
                    </template>
                    <Table :columns="columns" :showPagination="true" :dataSource="tableData" :fetch="loadDataList"
                        :options="tableOptions" @rowClick="rowClick" ref="dataTableRef">
                        <!-- 通过结构将插槽中的数据取出来 -->
                        <!-- 图片插槽 -->
                        <template #cover="{ index, row }">
                            <Cover :cover="row.cover"></Cover>
                        </template>
                        <!-- 操作插槽 -->
                        <template #op="{ index, row }">
                            <div class="op">
                                <a href="javascript:void(0);" class="a-link" @click="showEdit('update', row)" v-if="userInfo.userId==row.userId">修改</a>
                                <span v-else>--</span>
                                <el-divider direction="vertical"></el-divider>
                                <a href="javascript:void(0);" class="a-link" @click="del(row)"  v-if="userInfo.userId==row.userId">删除</a>
                                <span v-else>--</span>
                            </div>
                        </template>
                    </Table>
                </el-card>
            </el-col>
            <!-- 右边 -->
            <el-col :span="10">
                <el-card class="box-card">
                    <template #header>
                        <div class="card-header">
                            <span>专题文章</span>
                        </div>
                    </template>
                    <div :style="{'margin-bottom':'5px'}">
                        <el-alert title="红色表草稿，绿色表已发布，拖动文章修改排序" type="info" show-icon :closable="false"/>
                    </div>
                    <el-tree class="tree-panel" ref="refTree" :data="blogList" defaultExpandAll node-key="blogId"
                        :expand-on-click-node="false" :props="treeProps" :highlight-current="true" draggable
                        @node-drop="blogDrag">
                        <template #default="{ node, data }">
                            <div class="custom-node-style">
                                <span class="node-title">
                                    <span v-if="data.status == 0" :style="{ 'color': 'red', 'font-size': '13px' }">{{ data.title
                                    }}</span>
                                    <span v-else :style="{ 'color': 'green', 'font-size': '13px' }">{{ data.title }}</span>
                                </span>
                                <span class="node-op">
                                    <template v-if="data.blogId === '0'">
                                        <a class="alink" href="javascript:void(0)" @click="editBlog('add', data)">新增文章</a>
                                    </template>
                                    <template v-else>
                                        <a class="alink" href="javascript:void(0)" @click="showDetail(data)">预览</a>
                                        <el-divider direction="vertical" />
                                        <a class="alink" href="javascript:void(0)" @click="editBlog('edit', data)" v-if="userInfo.userId==data.UserId">修改</a>
                                        <span v-else>--</span>
                                        <el-divider direction="vertical" />
                                        <a class="alink" href="javascript:void(0)" @click="delBlog(data)"  v-if="userInfo.userId==data.UserId">删除</a>
                                        <span v-else>--</span>
                                        <el-divider direction="vertical" />
                                        <a class="alink" href="javascript:void(0)" @click="editBlog('add', data)">新增下级文章</a>
                                    </template>
                                </span>
                            </div>
                        </template>
                    </el-tree>
                </el-card>
            </el-col>
        </el-row>
        <Dialog :title="dialogConfig.title" :buttons="dialogConfig.buttons" :show="dialogConfig.show"
            @close="dialogConfig.show = false">
            <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="70px">
                <el-form-item prop="categoryName" label="名称">
                    <el-input placeholder="请输入分类名称" v-model="formData.categoryName">
                    </el-input>
                </el-form-item>
                <el-form-item prop="cover" label="封面">
                    <CoverUpload v-model="formData.cover"></CoverUpload>
                </el-form-item>
                <el-form-item prop="categoryDesc" label="简介">
                    <el-input type="textarea" placeholder="请输入简介" :autosize="{
                        minRows: 4, maxRows: 4
                    }" v-model="formData.categoryDesc">
                    </el-input>
                </el-form-item>
            </el-form>
        </Dialog>

        <BlogEdit ref="blogEditRef" @callback="saveBlogCallback"></BlogEdit>
        <BlogDetail ref="blogDetailRef"></BlogDetail>

    </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, reactive, ref } from 'vue'
import CoverUpload from '../../components/CoverUpload.vue';
import BlogEdit from './BlogEdit.vue'
import BlogDetail from './BlogDetail.vue'
const { proxy } = getCurrentInstance();

const api = {
    // 获取专题
    loadDataList: "/category/loadCategory4Special",
    // 保存专题
    saveCategory: "/category/saveCategory4Special",
    // 删除专题
    delCategory: "/category/delCategory4Special",
    // 获取专题文章
    getSpecialInfo: 'blog/getSpecialInfo',
    // 删除专题博客
    delBlog:"/blog/recoveryBlog",
    // 文章树的更新
    updateSpecialBlogSort:"/blog/updateSpecialBlogSort"
}
const columns = [
    {
        prop: "cover",
        label: '封面',
        width: 100,
        scopedSlots: 'cover',
        align: 'center'
    },
    {
        prop: "categoryName",
        label: '名称',
        width: 150,
        align: 'center'
    },
    {
        prop: "categoryDesc",
        label: '简介',
        align: 'center'
    },
    {
        prop: "blogCount",
        label: '博客数量',
        width: 100,
        align: 'center'
    },
    {
        prop: "op",
        label: '操作',
        width: 120,
        align: 'center',
        scopedSlots: 'op'
    }
]
// 数据源
const tableData = reactive({})

const tableOptions = {
    extHeight: 140
}

// 做一个权限验证，只有自己的博客才能够更改
const userInfo = ref( proxy.VueCookies.get("userInfo") || {})

// 选中一个默认的展示
const currentCategoryId = ref(null)
const dataTableRef = ref(null)

const loadDataList = async () => {
    let result = await proxy.Request({
        url: api.loadDataList
    })
    if (!result) {
        return;
    }
    Object.assign(tableData, result.data)
    if (currentCategoryId.value == null && result.data.list.length > 0) {
        currentCategoryId.value = result.data.list[0].categoryId
        loadBlogList()
    }
    nextTick(() => {
        dataTableRef.value.setCurrentRow("categoryId", currentCategoryId.value)
    })
}
// 新增 修改 专题
// 按钮对象
const dialogConfig = reactive({
    show: false,
    title: '标题',
    buttons: [
        {
            type: "danger",
            text: "确定",
            click: (e) => {
                submitForm()
            }
        }
    ]
})

const formDataRef = ref(null)
const formData = reactive({})
const rules = {
    categoryName: [
        { required: true, message: '请输入分类名称', trigger: 'blur' }
    ]
}
// 点击了修改的按钮
const showEdit = (type, data) => {
    dialogConfig.show = true
    // 确保每次打开都是干净的表单
    nextTick(() => {
        formDataRef.value.resetFields()
        // 当点击了添加按钮
        if (type == "add") {
            dialogConfig.title = "新增专题"
            formData.categoryId = ''
        }
        // 当点击了修改按钮
        else if (type == "update") {
            dialogConfig.title = "修改专题"
            Object.assign(formData, data)
        }
    })
}

// 点击确定，提交表单事件
const submitForm = () => {
    formDataRef.value.validate(async (valid) => {
        if (!valid) {
            return;
        }

        // 拷贝表单数据
        let params = {}
        Object.assign(params, formData)

        // 发起数据请求，添加数据，如果有值就是修改
        let result = await proxy.Request({
            url: api.saveCategory,
            params
        })
        if (!result) {
            return;
        }
        dialogConfig.show = false
        proxy.Message.success("保存成功")
        loadDataList()

    })
}
// 删除
const del = (data) => {
    proxy.Confirm(`你确定要删除${data.categoryName}吗？`, async () => {
        let result = await proxy.Request({
            url: api.delCategory,
            params: {
                categoryId: data.categoryId
            }
        })
        if (!result) {
            return;
        }
        loadDataList()
        currentCategoryId.value = null
        proxy.Message.success("删除成功")
    })
}

// 专题树

// 获取专题文章
const blogList = ref([])

const rowClick = (row) => {
    currentCategoryId.value = row.categoryId
    loadBlogList()
}

const loadBlogList = async () => {
    let result = await proxy.Request({
        url: api.getSpecialInfo,
        params: {
            categoryId: currentCategoryId.value,
            showType: '1'
        }
    })
    if (!result) {
        return
    }
    blogList.value = result.data
}

// 属性展示专题
const treeProps = {
    children: "children",
    label: 'title',
    value: "blogId"
}


// 新增 修改 专题博客

const blogEditRef = ref(null)
const editBlog = (type, data) => {
    blogEditRef.value.init(type, data)
}

// 保存专题博客回调
const saveBlogCallback = () => {
    loadBlogList()
}

// 删除
const delBlog = (data)=>{
    proxy.Confirm(`你确定要删除【${data.title}】吗？`,async()=>{
        let result = await proxy.Request({
            url:api.delBlog,
            params:{
                blogId:data.blogId
            }
        })
        if(!result){
            return;
        }
        loadBlogList()
        proxy.Message.success("删除成功")
    })
}

// 树拖拽排序
// 拖动改变排序，修改父级
const blogDrag =async (draggingNode,dropNode,dropType,ev) => {
    // 拖入某个结点内，修改父级结点为目标结点，同时修改目标结点下的所有子节点排序
    let parentNode = null;
    if(dropType=='inner'){
        parentNode=dropNode;
    }else{
        // 拖入之前，之后，修改被拖动结点的父节点为目标结点的父节点，同时修改目标结点父结点下所有的子节点的排序
        parentNode = dropNode.parent
    }
    // 操作节点id
    const blogId = draggingNode.data.blogId
    const pBlogId = parentNode.data.blogId
    // 需要重新排序的博客Id
    const blogIds = [];
    parentNode.childNodes.forEach(element => {
        blogIds.push(element.data.blogId);
    });
    let params = {
        blogId,
        pBlogId,
        blogIds:blogIds.join(",")
    }
    let result  = await proxy.Request({
        url:api.updateSpecialBlogSort,
        params
    })
    if(!result){
        return
    }
    // 重新加载文章树
    loadBlogList()
}
// 预览
const blogDetailRef = ref(null)
const showDetail = (data)=>{
    blogDetailRef.value.showDetail(data)
}

</script>

<style lang="scss" >
.tree-panel {
    height: calc(100vh - 296px);
    overflow: auto;

    .custom-node-style {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
}
</style>