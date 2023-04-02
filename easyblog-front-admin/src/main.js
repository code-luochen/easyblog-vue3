import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '@/router'

import ElementPlus from "element-plus"
import "element-plus/dist/index.css"
import "../src/assets/icon/iconfont.css"

import Request from './utils/Request'
import Message from './utils/Message'
import Confirm from './utils/Confirm'
import Verify from './utils/Verify'

import Table from "./components/Table.vue"
import Cover from "./components/Cover.vue"
import Dialog from "./components/Dialog.vue"
import CoverUpload from "./components/CoverUpload.vue"
import Window from "./components/Window.vue"
import EditorMarkdown from "./components/EditorMarkdown.vue"
import EditorHtml from "./components/EditorHtml.vue"
import VueCookies from 'vue-cookies'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)

// 定义全局table组件
app.component('Table',Table)

app.config.globalProperties.Request = Request
app.config.globalProperties.Message = Message
app.config.globalProperties.Confirm = Confirm
app.config.globalProperties.Verify = Verify
app.config.globalProperties.VueCookies = VueCookies
// 所有的头像信息都使用这个接口，将他定义为全局的数据
app.config.globalProperties.globalInfo= {
    imageUrl:"/api/file/getImage/"
}
// 定义全局Cover组件
app.component("Cover",Cover)
// 定义全局dialog组件
app.component("Dialog",Dialog)
// 上传头像的组件
app.component("CoverUpload",CoverUpload)
// 弹窗组件
app.component('Window',Window)
// 富文本编辑器组件
app.component('EditorMarkdown',EditorMarkdown)
// 文本编辑器组件
app.component('EditorHtml',EditorHtml)

app.mount('#app')
