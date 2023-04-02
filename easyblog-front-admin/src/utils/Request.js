import axios from "axios";
import { ElLoading} from "element-plus";
import message from '@/utils/Message'
import router from "@/router"

// 定义发请求的header头信息

const contentTypeForm = "application/x-www-form-urlencoded;charset=UTF-8";
const contentTypeJson = "application/json";
const contentTypeFile = "multipart/form-data";

const request = (config) => {
    // // 从前端传递过来的数据
    // let url = config.url;
    // let params= config.params  || {} ;

    // // 前端传递过来的数据类型，可能是form 类型的  也可能是JSON格式的，所以需要进行处理一下
    // let dataType = config.dataType;
    // dataType =  dataType ? "form" : dataType;
    // // 有些请求可能需要一些遮罩
    // let showLoading = config.showLoading;

    // showLoading = showLoading ? true : showLoading;

    // 通过结构的方式将数据结构出来,后面params要改变值，所以将他改成let类型
    let {url,params,dataType='form',showLoading='true'} = config

    // 默认的格式
    let contentType = contentTypeForm;

    if (dataType === "json") {
        contentType = contentTypeJson
    } else if (dataType === 'file') {
        contentType = contentTypeFile

        // 上传文件，需要进行处理
        let param = new FormData();

        for (let key in params) {
            param.append(key, params[key]);
        }

        params = param;
    }

    const instantce = axios.create({
        baseURL: '/api',
        timeout: 10 * 1000,
        headers: {
            'Content-Type': contentType,
            'X-Requested-With': "XMLHttpRequest",
        }
    })

    // 用来关闭loading的变量
    let loading = null;
    //      请求拦截器
    instantce.interceptors.request.use((config) => {
        if (showLoading) {
            loading = ElLoading.service({
                lock: true,
                text: '加载中......',
                background: 'rgba(0, 0, 0, 0.7)',
            })
        }
        return config;
    },
        (error) => {
            if (showLoading && loading) {
                loading.close();
            }
            message.error('发送请求失败')
            return Promise.reject("发送请求失败")
        })

    // 响应拦截器
    instantce.interceptors.response.use((response) => {
        if (showLoading && loading) {
            loading.close();
        }
        const res = response.data;

        if (res.status == 'error') {
            return Promise.reject(res.info)
        } else {
            if (res.code == 200){
                return Promise.resolve(res)
            }else if(res.code==901){

                // 设置一个记时器将跳转到登录页

                setTimeout(()=>{
                    router.push('/login')
                },2000);
                return Promise.reject("登录超时")
            }

            
        }
    },
        // 一般服务器出现异常才会走这个错误
        (error) => {
            if (showLoading && loading) {
                loading.close();
            }
            return Promise.reject("网络异常")
        })

    // 
    return instantce.post(url,params).catch(error=>{
         message.error(error)
        return null;
    })
   

  /*   let result = new Promise((resolve, reject) => {
        instantce.post(url, params).then(res => {
            resolve(res);
        }).catch(error => {
            message.error(error)
        })
    })
    return result; */

}

export default request