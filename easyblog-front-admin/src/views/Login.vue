<template>
    <div class="login_body">
        <div class="login_panel">
            <div class="login_title">用户登录</div>
            <el-form :model="formData" :rules="rules" ref="formDataRef">
                <el-form-item prop="account">
                    <el-input placeholder="请输入账号" v-model="formData.account" size="large">
                        <template #prefix>
                            <span class="iconfont icon-account"></span>
                        </template>

                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input placeholder="请输入密码" type="password" show-password v-model="formData.password" size="large">
                        <template #prefix>
                            <span class="iconfont icon-password"></span>
                        </template>
                    </el-input>

                </el-form-item>
                <el-form-item prop="checkCode">
                    <div class="checkCode_panel">
                        <el-input placeholder="请输入验证码" v-model="formData.checkCode" class="input_panel" @keyup.enter.native="login" size="large" />
                        <img :src="checkCodeUrl" alt="" @click="changeCheckCode" class="check_code">
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-checkbox v-model="formData.rememberMe" :true-label="1">记住我</el-checkbox>
                </el-form-item>
                <el-form-item label="">
                    <el-button type="primary" :style="{ width: '100%' }" @click="login">登录</el-button>
                </el-form-item>

            </el-form>
        </div>

    </div>
</template>

<script setup>
import { getCurrentInstance, ref, reactive } from "vue"
import {useRouter} from 'vue-router'
import md5 from "js-md5"
const { proxy } = getCurrentInstance();
const router = useRouter();

// 请求数据的接口
const api = {
    checkCode: "api/checkCode",
    login: 'login'
}

const checkCodeUrl = ref(api.checkCode)

const changeCheckCode = () => {
    checkCodeUrl.value = api.checkCode + "?" + new Date().getTime()
}

const formDataRef = ref()
// 表单数据
const formData = reactive({})
const rules = {
    account: [
        {
            required: true,
            message: '请输入用户名'
        }
    ],
    password: [
        {
            required: true,
            message: '请输入密码'
        }
    ],
    checkCode: [
        {
            required: true,
            message: '请输入验证码'
        }
    ]
}

// 判断是否记住了密码
const init = () => {
    const loginInfo = proxy.VueCookies.get("loginInfo");
    if (!loginInfo) {
        return;
    }
    // es语法
    Object.assign(formData, loginInfo);
}
init()

const login = () => {
    formDataRef.value.validate(async (valid) => {
        if (!valid) {
            return;
        }

        const cookieLoginInfo = proxy.VueCookies.get("loginInfo");

        const cookiePassword = cookieLoginInfo == null ? null : cookieLoginInfo.password;

        if(formData.password != cookiePassword){
            formData.password = md5(formData.password)
        }

        let params = {
            account: formData.account,
            password:formData.password,
            checkCode: formData.checkCode
        }

        let result = await proxy.Request({
            url: api.login,
            params: params
        })
        if (!result) {
            return;
        }

        proxy.Message.success('登录成功')

        // 跳转到首面
        setTimeout(() => {
            router.push('/')
        }, 1500);


        // 将登录的登录信息记录

        const loginInfo = {
            account: params.account,
            password: params.password,
            rememberMe: formData.rememberMe
        }

        // 将用户的数据信息也保存在这里面，不限制时间
        proxy.VueCookies.set("userInfo", result.data, 0)

        if (formData.rememberMe == 1) {
            proxy.VueCookies.set("loginInfo", loginInfo, "7d")
        }

    })
}

</script>

<style lang="scss"  scoped>
.login_body {
    width: 100%;
    height: calc(100vh);
    background-image: url("../assets/login-bc.png");
    background-size: cover;
    background-position: center;

    .login_panel {
        width: 350px;
        background-color: rgba(255, 255, 255, 0.8);
        float: right;
        margin-top: 200px;
        margin-right: 255px;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 2px 2px 10px #ddd;

        .login_title {
            margin-bottom: 10px;
            text-align: center;
            font-size: 20px;
        }

        .checkCode_panel {
            align-items: center;
            display: flex;

            .input_panel {
                flex: 1;
                margin-right: 5px;
            }

            .check_code {
                cursor: pointer;
            }

        }
    }
}
</style>