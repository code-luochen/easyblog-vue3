<template>
    <div>
        <div class="top-panel">
            <el-form :model="searchFormData" label-width="40px">
               <el-row  :gutter="20"> 
                    <el-col :span="4">
                        <el-form-item label="标题" prop="titleFuzzy"> 
                            <el-input v-model="searchFormData.titleFuzzy" clearable placeholder="请输入名称" @keyup.enter.native="loadDataList"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="4">
                        <el-form-item label="状态" prop="status"> 
                            <el-select v-model="searchFormData.status" clearable placeholder="请选择状态" :style="{width:'100%'}">
                                <el-option :value="0" label="草稿"></el-option>
                                <el-option :value="1" label="已发布"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="4">
                        <el-form-item label="分类" prop="status"> 
                            <el-select v-model="searchFormData.categoryId" clearable placeholder="请选择分类" :style="{width:'100%'}">
                                <el-option v-for="item in categoryList" :value="item.categoryId" :label="item.categoryName"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="4">
                       <el-button type="danger" @click="loadDataList">搜索</el-button>
                       <el-button type="danger" @click="showEdit('add')">
                        <span class="iconfont icon-jiahao" style="font-size: 18px; margin-right: 4px;" ></span>新增博客</el-button>
                    </el-col>
               </el-row>
            </el-form>
        </div>
        <Table :columns="columns" :showPagination="true" :dataSource="tableData" :fetch="loadDataList"
            :options="tableOptions">
            <!-- 通过结构将插槽中的数据取出来 -->

            <!-- 图片插槽 -->
            <template #cover="{ index, row }">
                <Cover :cover="row.cover"></Cover>
            </template>
            
            <!-- 文章信息 -->
            <template #blogInfo="{ index, row }">
                <div>标题：{{ row.title }}</div>
                <div>分类：{{ row.categoryName }}</div>
                <div>作者：{{ row.nickName }}</div>
            </template>

             <!-- 类型 -->
             <template #typeName="{ index, row }">
                <div>类型：<span v-if="row.type==0">原创</span><span v-if="row.type==1">转载</span></div>
                <div v-if="row.type==1">转载地址：{{ row.reprintUrl}}</div>
            </template>

            <!-- 状态 -->
            <template #statusName="{ index, row }">
                <span v-if="row.status==0" :style="{color:'red'}">{{ row.statusName }}</span>
                <span v-else :style="{color:'green'}">{{ row.statusName }}</span>
            </template>

              <!-- 时间 -->
              <template #time="{ index, row }">
                <div>创建时间：{{ row.createTime }}</div>
                <div>更新时间：{{ row.lastUpdateTime }}</div>
            </template>


            <!-- 操作插槽 -->
            <template #op="{ index, row }">
                <div class="op">
                    <a href="javascript:void(0);" class="a-link" @click="showEdit('update',row)" v-if="userInfo.userId==row.userId" >修改</a>
                    <span v-else>--</span>
                    <el-divider direction="vertical"></el-divider>
                    <a href="javascript:void(0);" class="a-link" @click="del(row)" v-if="userInfo.userId==row.userId">删除</a>
                    <span v-else>--</span>
                    <el-divider direction="vertical"></el-divider>
                    <a href="javascript:void(0);" class="a-link" @click="showDetail(row.blogId)">预览</a>
                </div>
            </template>
        </Table>
        <!-- 编辑组件 -->
        <BlogEdit ref="blogEditRef" @callback="loadDataList"></BlogEdit>
        <!-- 详情组件 -->
        <BlogDetail ref="blogDetailRef"></BlogDetail>
    </div>
</template>

<script setup>
import { reactive , ref,getCurrentInstance} from 'vue';
import BlogEdit from './BlogEdit.vue';
import BlogDetail from "./BlogDetail.vue"
const {proxy} = getCurrentInstance()
const api = {
    // 获取博客分类
    loadCategory:"/category/loadAllCategory4Blog",
    loadDataList:"/blog/loadBlog",
    // 删除博客
    delBlog:"/blog/recoveryBlog"
}

// 做一个权限验证，只有自己的博客才能够更改
const userInfo = ref( proxy.VueCookies.get("userInfo") || {})

// 搜索部分
const searchFormData = reactive({})
const categoryList = ref([])
const loadCategoryList = async()=>{
    let result =await proxy.Request({
        url:api.loadCategory
    })
    if(!result){
        return;
    }
    categoryList.value= result.data
}
loadCategoryList()

// 列表

const columns = [
    {
        prop: "cover",
        label: '封面',
        width: 100,
        scopedSlots: 'cover'
    },
    {
        prop: "blogInfo",
        label: '文章信息',
        scopedSlots: 'blogInfo'
    },
    {
        prop: "editorTypeName",
        label: '编辑器',
        width:100
    },
    {
        prop: "typeName",
        label: '类型',
        width: 200,
        scopedSlots: 'typeName'
    },
    {
        prop: "allowCommentTypeName",
        label: '评论',
        width: 80
    },
    {
        prop: "status",
        label: '状态',
        scopedSlots: 'statusName',
        width: 100
    },
    {
        prop: "time",
        label: '时间',
        width: 300,
        scopedSlots: 'time'
    }
    ,
    {
        prop: "op",
        label: '操作',
        width: 160,
        scopedSlots: 'op'
    }
]

// 数据源
const tableData = reactive({})

const tableOptions = {
    extHeight: 50
}
const loadDataList = async () => {
let params ={
    pageNo:tableData.pageNo,
    pageSize:tableData.pageSize
}
    Object.assign(params,searchFormData)

    let result = await proxy.Request({
        url: api.loadDataList,
        params
    })
    if (!result) {
        return;
    }
    Object.assign(tableData,result.data)
}

const blogEditRef = ref(null)
const blogDetailRef = ref(null)

// 新增和修改
const showEdit=(type,data)=>{
    blogEditRef.value.init(type,data)
}

// 预览
const showDetail = (blogId)=>{
    blogDetailRef.value.showDetail(blogId)
}
// 删除
const del = (data)=>{
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
        loadDataList()
        proxy.Message.success("删除成功")
    })
}

</script>

<style lang="scss" scoped>

</style>