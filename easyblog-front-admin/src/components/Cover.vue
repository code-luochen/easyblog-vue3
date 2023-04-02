<!-- 封装公共组件 -->
<template>
    <div class="cover">
        <img :src="proxy.globalInfo.imageUrl + cover" v-if="cover">
        <img src="../assets/default_img.png" v-else alt="">
    </div>
</template>

<script setup>
import {getCurrentInstance,reactive} from 'vue'
const {proxy} = getCurrentInstance()

// 需要传递一个封面地址过来
const porps = defineProps({
    cover:{
        type:String
    }
})

</script>

<style lang="scss" scoped>
.cover{
    width: 80px;
    height: 80px;
    img{
        width: 100%;
        height: 100%;
    }

}
</style>