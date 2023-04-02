<template>
    <el-upload name="file" :show-file-list="false" accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
        :multiple="false"
        :http-request="uploadImage"
    >
        <div class="cover-upload-btn">
            <template v-if="modelValue">
                <img :src="proxy.globalInfo.imageUrl + modelValue" alt="">
            </template>
            <span class="iconfont icon-jiahao" v-else></span>
        </div>
    </el-upload>
</template>

<script setup>
import { getCurrentInstance } from 'vue';
const {proxy} = getCurrentInstance();
const props = defineProps({
    // 双向绑定的值
    modelValue:{
        type:String,
        default:null
    }
})

const api = {
    uploadUrl:"file/uploadImage"
}

const emit = defineEmits()

// 覆盖原来的图片请求地址
const uploadImage =async (file)=>{
    let result = await proxy.Request({
        url:api.uploadUrl,
        dataType:"file",
       params:{
        file:file.file,
        // 参数类型，为博客分类，在数据库中分开了，如果type为则不是分类的头像
        type:0
       }
    })
    const fileName = result.data.fileName
    emit('update:modelValue',fileName)
    emit("callback",fileName)
}
</script>

<style lang="scss" scoped>
.cover-upload-btn{
    width: 150px;
    height: 150px;
    background-color: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    .iconfont{
        font-size: 32px;
        color: #767070;
    }
    img{
        width: 100%;
        height: 100%;
    }
}
</style>