import { createWebHistory,createRouter} from "vue-router";
import VueCookies from 'vue-cookies'

const routes = [
    {
        path:'/login',
        name:'登录',
        component:()=>import("../views/Login.vue")
    },
    {
        path:'/',
        name:'框架页',
        component:()=>import("../views/Framework.vue"),
        redirect:"/blog/list",
        children:[
            {
                path:'/blog/test',
                name:'test',
                component:()=>import("../views/blog/Test.vue")
            },
            {
                path:'/blog/list',
                name:'博客管理',
                component:()=>import("../views/blog/BlogList.vue")
            },
            {
                path:'/blog/category',
                name:'分类管理',
                component:()=>import("../views/blog/BlogCategory.vue")
            },
            {
                path:'/specail/list',
                name:'专题管理',
                component:()=>import("../views/special/SpecialList.vue")
            },
            {
                path:'/settings/my',
                name:'个人设置',
                component:()=>import("../views/settings/MyInfo.vue")
            },
            {
                path:'/settings/user',
                name:'博客成员',
                component:()=>import("../views/settings/TeamUser.vue")
            },
            {
                path:'/settings/sysSetting',
                name:'系统设置',
                component:()=>import("../views/settings/SysInfo.vue")
            },
            {
                path:'/recovery/list',
                name:'回收站',
                component:()=>import("../views/recovery/RecoveryList.vue")
            }
        ]
    }


];

const router = createRouter({
    routes,
    history:createWebHistory(),
})

router.beforeEach((to,from,next)=>{
    const userInfo = VueCookies.get("userInfo") ;

    if ( !userInfo && to.path != "/login" ){
        router.push('/login');
    }
    next();
})

export default router