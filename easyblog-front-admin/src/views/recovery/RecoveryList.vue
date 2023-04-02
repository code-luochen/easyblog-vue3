<template>
    <div class="body">
        <div class="top-panel">
            <el-form :model="searchForm" class="search-form" labelAlign="left" @submit.native.prevent>

               <el-row  :gutter="5"> 
                    <el-col :span="5">
                        <el-form-item label="标题" prop="titleFuzzy"> 
                            <el-input v-model="searchForm.titleFuzzy" clearable placeholder="支持模糊搜索" @keyup.enter.native="loadDataList"></el-input>
                        </el-form-item>
                    </el-col>


                    <el-col :span="5">
                        <el-form-item> 
                            <el-button type="danger" @click="loadDataList">搜索</el-button>
                        </el-form-item>
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
                <div>文章类型：{{ row.blogType ==0 ?'博客' :'专题' }}</div>
                <div>分类：{{ row.categoryName }}</div>
                <div>作者：{{ row.nickName }}</div>
            </template>

             <!-- 类型 -->
             <template #typeName="{ index, row }">
                <div>类型：<span v-if="row.type==1">原创</span><span v-if="row.type==0">转载</span></div>
                <div v-if="row.type==0">转载地址：{{ row.reprintUrl}}</div>
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
                <div class="op" v-if="row.userId == userInfo.userId || userInfo.roleType==1">
                    <a href="javascript:void(0);" class="a-link" @click="ruductionBlog(row)" v-if="userInfo.userId==row.userId" >还原</a>
                    <span v-else>--</span>
                    <el-divider direction="vertical"></el-divider> 
                    <a href="javascript:void(0);" class="a-link" @click="del(row)" v-if="userInfo.userId==row.userId">删除</a>
                    <span v-else>--</span>
                </div>
                <span v-else>--</span>
            </template>
        </Table>
    </div>  
</template>

<script setup>
import {ref,reactive,getCurrentInstance} from "vue"
const {proxy} = getCurrentInstance()

const api = {
    loadDataList:"/blog/loadRecoveryList",
    delBlog:'/blog/delBlog',
    reductionBlog:'/blog/reductionBlog'
}

const searchForm = reactive({})

const loadDataList = async () => {
let params ={
    pageNo:tableData.pageNo,
    pageSize:tableData.pageSize
}
    Object.assign(params,searchForm)

    let result = await proxy.Request({
        url: api.loadDataList,
        params
    })
    if (!result) {
        return;
    }
    Object.assign(tableData,result.data)
}


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
// 做一个权限验证，只有自己的博客才能够更改
const userInfo = ref( proxy.VueCookies.get("userInfo") || {})
// 数据源
const tableData = reactive({})
const tableOptions = {
    extHeight: 50
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

// 恢复博客
const ruductionBlog = async (data)=>{
    proxy.Confirm(`你确定要恢复【${data.title}】吗？`,async()=>{
        let result = await proxy.Request({
            url:api.reductionBlog,
            params:{
                blogId:data.blogId
            }
        })
        if(!result){
            return;
        }
        loadDataList()
        proxy.Message.success("恢复成功")
    })
}

</script>

<style lang="scss" scoped>

</style>