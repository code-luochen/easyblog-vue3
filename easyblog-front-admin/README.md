# Vue 3 + Vite

初始密码：admin123
管理员是：多洛洛多
运行 npm run dev
注意配置文件

<!-- 项目笔记 -->

## 第一节

1、配置路由的时候，注意要符合规范，引入的两个包是 createRouter 和 createWebHistory
在定义路由数组的时候，其名称应该是 routes ，不要写错成其他的
2、在 vite 中，配置项目所需要的配置，在配置文件中，添加 serve 结点来配置  
export default defineConfig({
plugins: [vue()],
server:{
hmr:true,
port:3001,
proxy:{
'/api':{
target:"http://localhost:8081",// 目标代理接口
secure:false,
changeOrigin:true, // 开启代理，在本地建立一个虚拟的服务器
pathRewrite:{
'^/api':'/api',
},
},
},
},
// 配置 path，需要安装和引入
resolve:{
// 配置路径别名，可以通过@来代替路径
alias:{
'@':path.resolve(\_\_dirname,'./src'),
}
}

})

3、如果使用了 sass 语法 注意要安装上 sass 和 sass-loader

## 第二节

1、定义好的 util 网络工具文件，如果将他定义成全局的，需要在 main 中将这个数据定义在他的原型上

import Request from './utils/Request'
app.config.globalProperties.Request = Request

2、在发送请求的时候，可以引入一个代理对象通过这个可以引用原型链上的数据
import {getCurrentInstance, ref, reactive } from "vue"
const {proxy} = getCurrentInstance();

let result = await proxy.Request({}）

3、封装一个信息提示工具
import { ElMessage } from "element-plus";

const message = {
error:(msg)=>{
ElMessage({
message: msg,
type: 'error',
duration:2000
})
},
success:(msg)=>{
ElMessage({
message: msg,
type: 'success',
duration:2000
})
},
warning:(msg)=>{
ElMessage({
message: msg,
type: 'warning',
duration:2000
})
}
}

export default message

4、本项目的密码是讲过 md5 加密过的，如果要传递需要将密码处理，下再 md5 的包 js-md5
在项目中引入这个包文件

5、cookies 的引入
在本项目中，如果点击了记住，那么就将用户的信息通过 cookies 来保存，当然也可通过本地来存储
需要下载 vue-cookies

## 第三节

1、在使用阿里巴巴的图标库的时候，所使用的类要是 iconfont，然后再将图标的类写入
<span :class="['iconfont',item.icon]"></span>
2、li 中是不能嵌套 div 的
3、路由中的 name 也是不可以重复的
4、建议可以将每个页面都能用到的，把他封装成一个组件来使用
5、在使用 element ui plus 的时候他的语言显示的是英语，我们需要一些配置类将数据转换成中文，这个设置在App.vue 中设置
<el-config-provider :locale="locale"
                        :message="config">
<router-view/>
</el-config-provider>

import {reactive} from 'vue'
import zhCn from 'element-plus/lib/locale/lang/zh-cn'

let locale = zhCn

// 最多打开一个
const config = reactive({
max:1
})

## 第四节 
1、我们在开发过程中要有封装的思想，将公共的不部分，能够抽离出来的，尽量将其抽离出来,通常是必较常用的东西就把他给封装起来
2、如果要a标签不跳转，我们可以给他的href添加上 <a href="javascript:void(0);">上移</a>
3、在本项目中Dialog组件中 v-model的接收值要加上一个 （） 才能生效   prop中的值是不能和v-model 中的值进行绑定
4、在使用e-button 的时候，如果想让他就是一个链接那么直接加上 link  
<el-button link>
    取消
</el-button>
5、在子组件调用父组件的时候，可以通过$emit('close') 来触发
  <el-button link @click="$emit('close')">
    取消
  </el-button>
  同时也可以使用内置函数来定义 

<span @click="close"></span>
const emit = defineEmits()
const close = ()=>{
  console.log("ok")
}

6、在vue3中数据双向绑定,使用 :modelValue= "title",在本案例中在CoverUpload 中如果将数据绑定过去，使用 modelValue 接收
modelValue:{
        type:String,
        default:null
    }
modelValue 就是父组件通过v-model 绑定过来的值
最后通过emit 将值向父组件传递出去  emit('update:modelValue',fileName)

## 第五节
1、nextTick() 的做用，当整个页面加载完成后再执行里面的内容
2、数组的splice方法
1，删除，当参数形式为splice(index,1)时表示删除下标为index的内容
2,更新，当参数形式为splice(index,1,item)时表示用新的值item更新替换掉下标为index的值
3，增加，当参数形式为splice(index,0,item)时表示在下标为index的位置增加一项值为item

## 第六节
1、在标签中以对象的形式来写样式时，样式名应该是字符串类型，要用引号包裹

## 第七节
1、我们使用第三方的文本编辑器处理 v-md-editor 并进行封装,需要进行下载  markdown 的封装
2、富文本编辑器的封装
    主要封装看组件

## 第八节
1、如果在父组件中通过ref来调用子组件中的方法，我们要在子组件中将这个方法给导出去，否则父组件是无法调用这个方法的
const init = (type,data)=>{
    // 用户执行添加操作
    if(type==='add'){
        getUserInfo()
    }
    windowConfig.show=true
}

// 将这个方法导出去给父组件使用
defineExpose({init})

## 第九节
1、在vue中如果直接对reactive赋值的话，会让其失去响应式，这时我们应该使用ref  ，或者用torefs()将reactive变成响应式的数据
2、添加代码块高亮的工具 "highlight.js"
3、@keyup.enter.native  如果不是在原生组件上使用，那么就要需要加上native

## 第十节
1、在使用el-radio 的时候要注意label才代表真正的值，不是使用value
2、在换头像时，使用的是状态管理，通过vuex实现
