<template>
    <div>
        <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="100px">
            <el-row :gutter="10">
                <el-col :span="8">
                    <el-form-item prop="avatar" label="头像">
                        <CoverUpload v-model="formData.avatar" @callback="saveAvatar"></CoverUpload>
                    </el-form-item>
                    <el-form-item prop="nickName" label="昵称">
                        <el-input placeholder="请输入昵称" v-model="formData.nickName">
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="phone" label="手机号">
                        <el-input placeholder="请输入手机号" v-model="formData.phone">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="密码">
                        <a href="javascript:void(0)" class="a-link" @click="showUpdatePassword">修改密码</a>
                    </el-form-item>
                    <el-form-item prop="editorType" label="默认编辑器">
                        <el-radio-group v-model="formData.editorType">
                            <el-radio :label="0">富文本编辑器</el-radio>
                            <el-radio :label="1">MarkDown编辑器</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item prop="profession" label="职业">
                        <el-input placeholder="请输入职业" v-model="formData.profession">
                        </el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="danger" @click="saveMy">保存</el-button>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item label="简介" prop="introduction">
                        <EditorHtml v-model="formData.introduction"></EditorHtml>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <Dialog :title="dialogConfig.title" :buttons="dialogConfig.buttons" :show="dialogConfig.show" @close="dialogConfig.show=false">
            <el-form :model="passwordFormData" :rules="rules" ref="passwordFormDataRef" label-width="80px">
                <el-form-item prop="password" label="密码">
                    <el-input placeholder="请输入密码" v-model="passwordFormData.password" type="password">
                    </el-input>
                </el-form-item>
                <el-form-item prop="rePassword" label="重复密码">
                    <el-input placeholder="请再次输入密码" v-model="passwordFormData.rePassword" type="password" >
                    </el-input>
                </el-form-item>
                
            </el-form>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, getCurrentInstance,reactive,nextTick } from 'vue'
const { proxy } = getCurrentInstance()
const formData = ref({})

const validateRePass = (rule,value,callback)=>{
    if(value !== passwordFormData.value.password){
        callback(new Error(rule.message))
    } else{
        callback()
    }
}
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

const api = {
    // 获去用户信息
    getUserInfo: '/getUserInfo',
    // 保存用户的信息
    saveMyInfo: '/saveMyInfo',
    // 保存头像
    saveAvatar:'/saveAvatar',
    // 保存密码
    updateMyPassword:'/updateMyPassword'
}
const getUserInfo = async () => {
    let result = await proxy.Request({
        url: api.getUserInfo
    })
    if (!result) {
        return
    }
    formData.value = result.data
}
getUserInfo()

const formDataRef = ref(null)

// 保存用户的信息
const saveMy =  () => {
    formDataRef.value.validate(async(valid)=>{
        if(!valid) return 
        let result = await proxy.Request({
        url: api.saveMyInfo,
        params: {
            avatar:formData.value.avatar,
            nickName:formData.value.nickName,
            phone:formData.value.phone,
            editorType:formData.value.editorType,
            profession:formData.value.profession,
            introduction:formData.value.introduction
        }
    })
    if(!result){
        return 
    }
    proxy.Message.success("保存成功")

    })
}
// 修改头像
const saveAvatar = async(avatar)=>{
    let result = await proxy.Request({
            url:api.saveAvatar,
            params:{
                avatar
            }
        })
        if(!result){
            return 
        }
        proxy.Message.success("头像修改成功")

}



// 修改密码配置
const passwordFormDataRef = ref(null)
const passwordFormData = ref({})
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
const showUpdatePassword = ()=>{
    dialogConfig.show=true
    nextTick(()=>{
        passwordFormDataRef.value.resetFields()
        passwordFormData.value={}
    })
}   

const submitPass = ()=>{
    passwordFormDataRef.value.validate(async(valid)=>{
        if(!valid){
            return 
        }
        // 保存密码
        let result = await proxy.Request({
            url:api.updateMyPassword,
            params:{
                password:passwordFormData.value.password
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