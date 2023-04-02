<template>
    <div>
        <el-form :model="searchFormData">
            <el-row :gutter="20">
                <el-col :span="4">
                    <el-form-item label="昵称" prop="nickName" label-width="50px">
                        <el-input v-model="searchFormData.nickNameFuzzy" clearable placeholder="请输入昵称"
                            @keyup.enter.native="loadDataList"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="4">
                    <el-form-item label="手机号" prop="phone" label-width="70px">
                        <el-input v-model="searchFormData.phoneFuzzy" clearable placeholder="请输入手机号"
                            @keyup.enter.native="loadDataList"></el-input>
                    </el-form-item>
                </el-col>

                <el-col :span="4">
                    <el-button type="danger" @click="loadDataList">搜索</el-button>
                    <el-button type="danger" @click="showEdit('add')" v-if="userInfo.roleType==1">
                        <span class="iconfont icon-jiahao"
                            style="font-size: 18px; margin-right: 4px;"></span>新增成员</el-button>
                </el-col>
            </el-row>
        </el-form>
        <Table :columns="columns" :showPagination="true" :dataSource="tableData" :fetch="loadDataList"
            :options="tableOptions">
            <template #avatar="{ index, row }">
                <Cover :cover="row.avatar"></Cover>
            </template>

            <template #userInfo="{ index, row }">
                <div>昵&nbsp;&nbsp;&nbsp;称：{{ row.nickName }}</div>
                <div>手机号：{{ row.phone }}</div>
                <div>职&nbsp;&nbsp;&nbsp;业：{{ row.profession }}</div>
            </template>

            <template #roleInfo="{ index, row }">
                <div>{{ row.roleTypeName }}</div>
            </template>

            <template #statusInfo="{ index, row }">
                <div>
                    <span :style="{ color: row.status == 1 ? 'green' : 'red' }">{{ row.statusName }}</span>
                </div>
            </template>

            <template #timeInfo="{ index, row }">
                <div>创建时间：{{ row.createTime }}</div>
                <div>最后登录时间：{{ row.lastLoginTime }}</div>
            </template>

            <template #operation="{ index, row }">
                <span v-if="userInfo.roleType == 1">
                    <a href="javascript:void(0);" class="a-link" @click="showEdit('edit', row)">修改</a>
                    <el-divider direction="vertical"></el-divider>
                    <a href="javascript:void(0);" class="a-link" @click="changeAccountStatus(row)">{{
                        row.status == 0 ? '启用' : '禁用' }} </a>
                    <el-divider direction="vertical"></el-divider>
                    <a href="javascript:void(0);" class="a-link" @click="showUpdatePassword(row.userId)">修改密码</a>
                    <el-divider direction="vertical"></el-divider>
                    <a href="javascript:void(0);" class="a-link" @click="delUser(row)">删除</a>
                </span>
                <span v-else>--</span>
            </template>
        </Table>
        <!-- 新增成员弹框 -->
        <Dialog :title="editDialogInfo.title" :buttons="editDialogInfo.buttons" :show="editDialogInfo.show" :width="'50%'"
            @close="editDialogInfo.show = false">

            <el-form :model="formData" :rules="rules" ref="editFormRef" label-width="110px">

                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item prop="nickName" label="昵称">
                            <el-input :maxLength="30" v-model="formData.nickName">
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item prop="phone" label="手机号">
                            <el-input :maxLength="11" v-model="formData.phone">
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10" v-if="formData.userId==null">
                    <el-col :span="12">
                        <el-form-item prop="password" label="密码">
                            <el-input :maxLength="20" type="password" show-password v-model="formData.password">
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item prop="rePassword" label="再次输入密码">
                            <el-input :maxLength="20" type="password" show-password v-model="formData.rePassword">
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item prop="editorType" label="默认编辑器">
                            <el-radio-group v-model="formData.editorType">
                                <el-radio :label="0">富文本编辑器</el-radio>
                                <el-radio :label="1">MarkDown编辑器</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item prop="profession" label="职业">
                            <el-input :maxLength="20" v-model="formData.profession">
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="24">
                        <el-form-item prop="avatar" label="头像">
                            <cover-upload v-model="formData.avatar"></cover-upload>
                        </el-form-item>
                    </el-col>
                </el-row>

                
                <el-row :gutter="10">
                    <el-col :span="24">
                        <el-form-item prop="introduction" label="简介">
                            <editor-html id="intorduction" ref="introduction" :height="300" v-model="formData.introduction"></editor-html>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </Dialog>

        <!-- 修改密码 -->
        <Dialog :title="dialogConfig.title" :buttons="dialogConfig.buttons" :show="dialogConfig.show" @close="dialogConfig.show=false">
            <el-form :model="formData" :rules="rules" ref="passwordFormDataRef" label-width="80px">
                <el-form-item prop="password" label="密码">
                    <el-input placeholder="请输入密码" show-password v-model="formData.password" type="password">
                    </el-input>
                </el-form-item>
                <el-form-item prop="rePassword" label="重复密码">
                    <el-input placeholder="请再次输入密码" show-password v-model="formData.rePassword" type="password" >
                    </el-input>
                </el-form-item>
                
            </el-form>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance,nextTick } from 'vue'
const { proxy } = getCurrentInstance()

const validateRePass = (rule,value,callback)=>{
    if(value !== formData.value.password){
        callback(new Error(rule.message))
    } else{
        callback()
    }
}
const searchFormData = reactive({})
const api = {
    // 获取用户列表
    loadDataList: '/setting/loadUser',
    // 保存用户
    saveTeamUser:'/setting/saveTeamUser',
    // 状态更新
    updateStatus:"/setting/updateStatus",
    // 删除用户
    delUser:"/setting/delUser",
    // 修改密码
    updatePassword:"/setting/updatePassword"
}

// 做一个权限验证，只有自己的博客才能够更改
const userInfo = ref( proxy.VueCookies.get("userInfo") || {})

const loadDataList = async () => {
    let params = {
        pageNo: tableData.pageNo,
        pageSize: tableData.pageSize
    }
    Object.assign(params, searchFormData)

    let result = await proxy.Request({
        url: api.loadDataList,
        params
    })
    if (!result) {
        return;
    }
    Object.assign(tableData, result.data)
}

const columns = [
    {
        prop: "avatar",
        label: '头像',
        width: 100,
        scopedSlots: 'avatar'
    },
    {
        prop: "nickName",
        label: '用户信息',
        scopedSlots: 'userInfo',
        width: 200
    },
    {
        prop: "editorTypeName",
        label: '默认编辑器',

    },
    {
        prop: "roleTypeName",
        label: '角色',
        width: 100,
        scopedSlots: 'roleInfo'
    },
    {
        prop: "statusInfo",
        label: '状态',
        width: 100,
        scopedSlots: 'statusInfo'
    },
    {
        prop: "createTime",
        label: '时间',
        scopedSlots: 'timeInfo',
        width: 300
    }
    ,
    {
        prop: "operation",
        label: '操作',
        width: 250,
        scopedSlots: 'operation'
    }
]
// 数据源
const tableData = reactive({})

const tableOptions = {
    extHeight: 50
}

// 新增弹框
const editDialogInfo = reactive({
    show: false,
    title: '新增成员',
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
const editFormRef = ref(null)
const formData = ref({})
const rules = {
    nickName: [{ required: true, message: "昵称不能为空" }],
    editorType: [{ required: true, message: "请选择默认编辑器" }],
    password: [{ required: true, message: "请输入密码" },
    {
        validator: proxy.Verify.password,
        message: '密码最少8位,只能是数字字母和特殊字符'
    }
    ],
    rePassword: [{ required: true, message: "请再次输入密码" },
    {
        validator: validateRePass,
        message: '两次输入的密码不一致'
    }
    ],
    phone: [{ required: true, message: "请输入手机号" },
    {
        validator: proxy.Verify.phone,
        trigger: 'blur',
        message: '请输入正确的手机号'
    }
    ],
}
// 点击了修改的按钮
const showEdit =(type,data)=>{
    editDialogInfo.show = true
    // 确保每次打开都是干净的表单
    nextTick(()=>{
        editFormRef.value.resetFields()
    if( type == "add"){
        editDialogInfo.title="新增成员"
        formData.value={
            introduction:''
        }
    }else{
        editDialogInfo.title="修改成员信息"
        Object.assign(formData.value,data)
    }  
    })
}

// 点击确定，提交表单事件
const submitForm = ()=>{
    editFormRef.value.validate(async (valid)=>{
        if(!valid){
            return; 
        }
        // 拷贝表单数据
        let params = {}
        Object.assign(params,formData.value)

// 发起数据请求，添加数据，如果有值就是修改
        let result = await proxy.Request({
            url:api.saveTeamUser,
            params
        })
        if(!result){
            return;
        }
        editDialogInfo.show = false
        proxy.Message.success("保存成功")
        loadDataList()

    })
}

// 修改状态
const changeAccountStatus = (data)=>{
    // 取他的反状态
    let status = data.status == 0 ? 1 : 0
    let statusName = data.status == 0 ? "启用" : "禁用"
    proxy.Confirm(`你确定要【${statusName}】${data.nickName}吗？`,async()=>{
        let result = await proxy.Request({
            url:api.updateStatus,
            params:{
                userId:data.userId,
                status
            }
        })
        if(!result){
            return;
        }
        loadDataList()
        proxy.Message.success(`${statusName}成功`)
    })
}

// 删除
const delUser = (data)=>{
    proxy.Confirm(`你确定要删除【${data.nickName}】吗？`,async()=>{
        let result = await proxy.Request({
            url:api.delUser,
            params:{
                userId:data.userId
            }
        })
        if(!result){
            return;
        }
        loadDataList()
        proxy.Message.success("删除成功")
    })
}

// 修改密码
const passwordFormDataRef = ref(null)
const dialogConfig = reactive({
    show:false,
    title:'修改密码',
    buttons:[
        {
            type:"danger",
            text:"确定",
            click:(e)=>{
                submitPass()
            }
        }
    ]
})
const showUpdatePassword = (userId)=>{
    dialogConfig.show=true
    nextTick(()=>{
        passwordFormDataRef.value.resetFields()
        formData.value={userId:userId}
    })
}   

const submitPass = ()=>{
    passwordFormDataRef.value.validate(async(valid)=>{
        if(!valid){
            return 
        }
        // 保存密码
        let result = await proxy.Request({
            url:api.updatePassword,
            params:{
                userId:formData.value.userId,
                password:formData.value.password
            }
        })
        if(!result){
            return 
        }
        proxy.Message.success("密码修改成功")
        dialogConfig.show=false
    })

}


</script>

<style lang="scss" scoped></style>