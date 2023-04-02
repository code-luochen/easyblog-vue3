<template>
    <div class="window" :style="{width:windowWidth+'px'}" v-if="show">
        <div class="title">
            <span class="iconfont icon-back" @click="close"></span>
        </div>
        <div class="body">
            <slot></slot>
        </div>
        <div class="footer">
            <template v-if="buttons && buttons.length > 0 || showCancel">
                <div class="dialog-fotter">
                    <!-- 含有默认的取消按钮 -->
                    <el-button v-if="showCancel" link @click="$emit('close')">
                        取消
                    </el-button>
                    <el-button v-for="btn in buttons" :type="btn.type" @click="btn.click">
                        {{ btn.text }}
                    </el-button>
                </div>

            </template>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'
const windowWidth = ref(window.innerWidth - 280)
const props=defineProps({
    show:{
        type:Boolean,
        default:false
    },
    buttons:{
        type:Array
    }, 
    showCancel: {
        type: Boolean,
        default: true
    },
})

const emit = defineEmits()
const close = ()=>{
    emit("close")
}

</script>

<style lang="scss" scoped>
.window{
    position: absolute;
    top:0;
    left:0;
    width: 100%;
    height: calc(100vh - 70px);
    background-color: #fff;
    z-index: 50;
    .title{
        height: 30px;
        display: flex;
        align-items: center; 
        padding-left: 10px;
        .icon-back{
            font-size: 24px;
            cursor: pointer;
        }
       
    }
    .body{
        height: calc(100vh - 151px);
        padding: 10px;
        overflow: auto;
    }
    .footer{
        text-align: center;
        border-top: 1px solid #ddd;
        line-height: 50px;
    }


}
</style>