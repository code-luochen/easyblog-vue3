<template>
    <div class="layout">
        <el-container>
            <el-header class="header">
                <div class="logo">EasyBlog</div>
                <div class="user-info">
                    <span>欢迎回来,</span>
                    <el-dropdown>
                        <span class="el-dropdown-link">
                            {{ userInfo.nickName }}
                            <span class="iconfont icon-close"></span>
                        </span>

                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="router.push('/settings/my')">个人信息</el-dropdown-item>
                                <el-dropdown-item @click="logout">退出</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <div class="avatar">
                        <img :src="userInfo.avatar" alt="">
                    </div>
                </div>
            </el-header>
            <el-container class="container">
                <el-aside class="left-aside">
                    <div>
                        <el-button class="post-btn" @click="createHtml">发布</el-button>
                    </div>

                    <!-- 菜单区域 -->
                    <div class="menu-panel">
                        <ul>
                            <li v-for=" (item, index) in menuList">
                                <span class="menu-title-p" @click="openClose(index)">
                                    <span :class="['iconfont', item.icon]"></span>
                                    <span class="menu-title">{{ item.title }}</span>
                                    <span :class="['iconfont', 'point', item.open ? 'icon-open' : 'icon-close']"></span>
                                </span>

                                <ul class="sub-menu" v-show="item.open">
                                    <li v-for="menu in item.children">
                                        <router-link :to="menu.path"
                                            :class="['sub-menu-item', menu.path == activePath ? 'active' : '']"
                                            v-if="menu.roleType == null || menu.roleType==userInfo.roleType"
                                            >
                                            {{ menu.title }}
                                        </router-link>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </el-aside>
                <el-main class="right-main">
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>

        <Dialog :title="progressDialog.title" :buttons="progressDialog.buttons" :show="progressDialog.show"
            @close="progressDialog.show = false" :show-close="false" :showCancel="false" width="400px">
            <div class="progress-container">
                <div class="progress-panel">
                    <el-progress type="circle" :percentage="progressInfo.progress" :status="progressInfo.status"
                        :color="colors"></el-progress>
                </div>
                <div class="error" v-if="progressInfo.result == 0">
                    <div>生成页面出错了：{{ progressInfo.errorMsg }}</div>
                    <div class="info">具体错误，请查看服务器日志</div>
                </div>
                <div class="success" v-if="progressInfo.progress == 100 && progressInfo.result == 1">
                    发布成功
                </div>
                <div class="btn-panel" v-if="progressInfo.progress == 100 || progressInfo.result == 0">
                    <el-button class="btn" type="primary" @click="progressDialog.show = false">关闭</el-button>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { getCurrentInstance, ref, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router';
const { proxy } = getCurrentInstance()

// 获去路由对象
const router = useRouter()
const route = useRoute()

const api = {
    getUserInfo: '/getUserInfo',
    logout: '/logout',
    // 发布
    createHtml: 'createHtml',
    // 进度条
    checkProgress: 'checkProgress'
}


// 获取用户信息
const userInfo = ref({})

const init = async () => {

    let result = await proxy.Request({
        url: api.getUserInfo
    })
    if (!result) {
        return
    }

    userInfo.value = result.data
    userInfo.value.avatar = proxy.globalInfo.imageUrl + result.data.avatar
}
init()

// 定义当前显示路由
const activePath = ref(null)

// 监听路由的变化
watch(route, (newVal, oldVal) => {
    // 将监听到当前的路由
    activePath.value = newVal.path
}, { immediate: true, deep: true })

// 定义菜单元素
const menuList = ref([
    {
        title: '博客',
        icon: 'icon-blog',
        open: true,
        children: [
            {
                title: '博客管理',
                path: '/blog/list'
            },
            {
                title: '分类管理',
                path: '/blog/category'
            }
        ]
    },
    {
        title: '专题',
        icon: 'icon-zhuanti',
        open: true,
        children: [
            {
                title: '专题管理',
                path: '/specail/list'
            }
        ]
    },
    {
        title: '设置',
        icon: 'icon-settings',
        open: true,
        children: [
            {
                title: '个人信息设置',
                path: '/settings/my'
            },
            {
                title: '博客成员',
                path: '/settings/user'
            },
            {
                title: '系统设置',
                path: '/settings/sysSetting',
                roleType: 1
            }
        ]
    },
    {
        title: '回收站',
        icon: 'icon-delete',
        open: true,
        children: [
            {
                title: '回收站',
                path: '/recovery/list'
            }
        ]
    }
]);

// 打开和关闭菜单
const openClose = (index) => {
    const open = menuList.value[index].open
    menuList.value[index].open = !open
}

// 退出登录
const logout = () => {
    proxy.Confirm(`你确定要退出吗？`, async () => {
        let result = await proxy.Request({
            url: api.logout
        })
        if (!result) {
            return;
        }
        router.push('/login')
    })
}

// 颜色改变
const colors = [
    { color: '#f56c6c', percentage: 20 },
    { color: '#e6a23c', percentage: 40 },
    { color: '#6f7ad3', percentage: 60 },
    { color: '#1989fa', percentage: 80 },
    { color: '#5cb87a', percentage: 100 },
]
const progressDialog = reactive({
    show: false,
    title: '发布',
    buttons: []
})

const progressInfo = reactive({
    progress: 0
})

let checkTimer = null;
const createHtml = async()=>{
    progressDialog.show=true
    progressInfo.progress=0
    progressInfo.status = undefined

    let result = await proxy.Request({
        url:api.createHtml
    })
    if(!result){
        return 
    }
    checkProgress()
    checkTimer = setInterval(()=>{
        checkProgress()
    },1000)
}
const checkProgress = async()=>{
    let result = await proxy.Request({
        url:api.checkProgress,
        showLoading:false
    })

    if(!result){
        return
    }
    if(result.data.result == 0){
        progressInfo.status="exception"
        progressInfo.errorMsg=result.data.errorMsg
    }else{
        progressInfo.progress=result.data.progress
    }
    progressInfo.result  = result.data.result
    if((result.data.progress == 100 || result.data.result == 0)&& checkTimer!=null){
            clearInterval(checkTimer)
    }
}

</script>

<style lang="scss" scoped>
.layout {
    .header {
        border: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .logo {
            font-size: 30px;
        }

        .user-info {
            display: flex;
            align-items: center;

            .el-dropdown-link {
                color: #068fea;
                cursor: pointer;

                .icon-close {
                    font-size: 14px;
                    color: #068fea;
                }
            }

            .avatar {
                width: 50px;
                height: 50px;
                margin-left: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                background: #ddd;
                border-radius: 25px;

                img {
                    border-radius: 25px;
                    width: 100%;
                }
            }

        }
    }

    .container {
        background-color: #f5f6f7;
        height: calc(100vh - 60px);
        padding-top: 10px;

        .left-aside {
            width: 280px;
            padding: 0 15px;

            .post-btn {
                background-color: green;
                color: #fff;
                height: 40px;
                width: 100%;
            }

            // 将他原有的样式去掉，自己定义样式
            .menu-panel {
                margin-top: 5px;

                ul,
                li {
                    padding: 0px;
                    margin: 0px;
                    list-style: none;
                }

                .menu-title-p {
                    cursor: pointer;
                    display: flex;
                    line-height: 45px;
                    padding: 0 5px;

                    .iconfont {
                        font-size: 18px;
                        color: #91949a;
                    }

                    .menu-title {
                        flex: 1;
                        color: #3f4042;
                        margin-left: 10px;
                    }

                    .point {
                        width: 20px;
                        text-align: center;
                        font-size: 16px;
                    }

                    // 移动上去改变背景颜色
                    &:hover {
                        background-color: #ddd;
                    }
                }

                .sub-menu {
                    font-size: 14px;

                    .sub-menu-item {
                        border-radius: 5px;
                        padding: 0 10px 0 35px;
                        line-height: 40px;
                        display: block;
                        cursor: pointer;
                        text-decoration: none;
                        color: #3f4042;

                        &:hover {
                            background-color: #ddd;
                        }
                    }

                    .active {
                        background-color: #ddd;
                    }
                }
            }
        }

        .right-main {
            background-color: #fff;
            position: relative;
        }
    }
}

.progress-container {
    .progress-panel {
        display: flex;
        justify-content: center;
    }

    .error {
        color: red;
        margin-top: 20px;

        .info {
            font-size: 13px;
        }
    }

    .success {
        margin-top: 20px;
        text-align: center;
        font-size: 16px;
        color: green;
    }

    .btn-panel {
        text-align: center;
        margin-top: 20px;

        .btn {
            margin: 0 auto;
        }
    }
}</style>