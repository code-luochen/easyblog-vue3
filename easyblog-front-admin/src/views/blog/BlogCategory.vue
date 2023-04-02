<template>
    <div>
        <el-button type="danger" @click="showEdit('add')" v-if="userInfo.roleType==1">新增分类</el-button>
        <Table :columns="columns" :showPagination="false" :dataSource="tableData" :fetch="loadDataList"
            :options="tableOptions">
            <!-- 通过结构将插槽中的数据取出来 -->

            <!-- 图片插槽 -->
            <template #cover="{ index, row }">
                <Cover :cover="row.cover"></Cover>
            </template>

            <!-- 操作插槽 -->
            <template #op="{ index, row }" v-if="userInfo.roleType==1">
                <div class="op">
                    <a href="javascript:void(0);" class="a-link" @click="showEdit('update',row)" >修改</a>
                    <el-divider direction="vertical"></el-divider>
                    <a href="javascript:void(0);" class="a-link" @click="del(row)">删除</a>
                    <el-divider direction="vertical"></el-divider>
                    <a href="javascript:void(0);" :class="[index==0 ? 'not-allow' : 'a-link']" @click="changeSort(index,'up')">上移</a>
                    <el-divider direction="vertical"></el-divider>
                    <a href="javascript:void(0);" :class="[index==tableData.list.length-1 ? 'not-allow' : 'a-link']" @click="changeSort(index,'down')" >下移</a>
                </div>
            </template>
        </Table>

        <Dialog :title="dialogConfig.title" :buttons="dialogConfig.buttons" :show="dialogConfig.show" @close="dialogConfig.show=false">
            <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="70px">
                <el-form-item prop="categoryName" label="名称">
                    <el-input placeholder="请输入分类名称" v-model="formData.categoryName" >
                    </el-input>
                </el-form-item>
                <el-form-item prop="cover" label="封面"> 
                    <CoverUpload v-model="formData.cover"></CoverUpload>
                </el-form-item>
                <el-form-item prop="categoryDesc" label="简介"> 
                    <el-input  type="textarea" placeholder="请输入简介" :autosize="{
                        minRows:4,maxRows:4
                    }"  v-model="formData.categoryDesc">
                    </el-input>
                </el-form-item>
            </el-form>
        </Dialog>

    </div>
</template>

<script setup>
import { getCurrentInstance,nextTick, reactive ,ref} from 'vue'
import CoverUpload from '../../components/CoverUpload.vue';
const { proxy } = getCurrentInstance();

const api = {
    // 获取博客分类列表
    loadDataList: "/category/loadAllCategory4Blog",
    // 保存分类
    saveCategory:"/category/saveCategory4Blog",
    // 删除分类
    delCategory:"/category/delCategory4Blog",
    // 修改分类的排序
    changSort:'/category/changeCategorySort4Blog'
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
        width: 200,
        align: 'center',
        scopedSlots: 'op'
    }
]
// 数据源
const tableData = reactive({})

// 做一个权限验证，只有自己的博客才能够更改
const userInfo = ref( proxy.VueCookies.get("userInfo") || {})

const tableOptions = {
    extHeight: 10
}
const loadDataList = async () => {
    let result = await proxy.Request({
        url: api.loadDataList
    })
    if (!result) {
        return;
    }
    tableData.list = result.data
}

// 新增和修改

// 按钮对象
const dialogConfig = reactive({
    show:false,
    title:'标题',
    buttons:[
        {
            type:"danger",
            text:"确定",
            click:(e)=>{
                submitForm()
            }
        }
    ]
})

const formDataRef = ref(null)
const formData = reactive({})
const rules = {
    categoryName:[
        {required:true,message:'请输入分类名称',trigger:'blur'}
    ]
}
// 点击了修改的按钮
const showEdit =(type,data)=>{
    dialogConfig.show = true
    // 确保每次打开都是干净的表单
    nextTick(()=>{
        formDataRef.value.resetFields()
        // 当点击了添加按钮
    if( type == "add"){
        dialogConfig.title="新增分类"
        // 否则他会将上一次的categoryId保留导致修改以前的数据
        formData.categoryId = ''
    }
    // 当点击了修改按钮
    else if(type == "update"){
        dialogConfig.title="修改分类"
        Object.assign(formData,data)
    }  
    })
}

// 点击确定，提交表单事件
const submitForm = ()=>{
    formDataRef.value.validate(async (valid)=>{
        if(!valid){
            return; 
        }

        // 拷贝表单数据
        let params = {}
        Object.assign(params,formData)

// 发起数据请求，添加数据，如果有值就是修改
        let result = await proxy.Request({
            url:api.saveCategory,
            params
        })
        if(!result){
            return;
        }
        dialogConfig.show = false
        proxy.Message.success("保存成功")
        loadDataList()

    })
}

// 删除
const del = (data)=>{
    proxy.Confirm(`你确定要删除${data.categoryName}吗？`,async()=>{
        let result = await proxy.Request({
            url:api.delCategory,
            params:{
                categoryId:data.categoryId
            }
        })
        if(!result){
            return;
        }
        loadDataList()
        proxy.Message.success("删除成功")
    })
}
// 修改排序
const changeSort =async (index,type)=>{
    let categoryList = tableData.list
    if( type==='down' && index === categoryList.length-1 || type==='up'&&index ===0){
        return;
    }
    // 记录一会儿要删除的值
    let temp = categoryList[index]
    // 判断类型,
    let number = type === 'down' ? 1 : -1
    
    // 删除当前位置的数据
    categoryList.splice(index,1)
    // 在当前位置的下一个位置加上刚才的数据
    categoryList.splice(index+number,0,temp)
    // 发起请求将排好序的数据存放到数据库中
    let result = await proxy.Request({
            url:api.changSort,
            // 他改变完就是一个完整的JSON数组
            dataType:'json',
            params:categoryList
    })
    if(!result){
        return;
    }
    proxy.Message.success("重新排序成功")
    loadDataList()
}

</script>

<style lang="scss" scoped>
</style>