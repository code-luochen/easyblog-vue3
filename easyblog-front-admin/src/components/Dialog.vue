<template>
    <div>
        <el-dialog :show-close="showClose" :draggable="true" v-model="(show)" :close-on-click-modal="false" :title="title"
            class="cust-dialog" :top="top" :width="width" :showCancel="showCancel">
            <div class="dialog-body">
                <slot></slot>
            </div>
            <!-- 可能会有按钮-->
            <template v-if="buttons && buttons.length > 0 || showCancel">
                <div class="dialog-fotter">
                    <!-- 含有默认的取消按钮 -->
                    <el-button link @click="$emit('close')">
                        取消
                    </el-button>

                    <el-button v-for="btn in buttons" :type="btn.type" @click="btn.click">
                        {{ btn.text }}
                    </el-button>
                </div>

            </template>
        </el-dialog>
    </div>
</template>

<script setup>


const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    top: {
        type: String,
        default: '50px'
    }, 
    showCancel: {
        type: Boolean,
        default: true
    },
    showClose:{
        type:Boolean,
        default:false
    },
    width: {
        type: String,
        default: "30%"
    },
    title: {
        type: String,
        required: true
    },
    buttons: {
        type: Array,

    }
})
</script>

<style lang="scss">
.cust-dialog {
    .el-dialog__body {
        padding: 0;

    }

    .dialog-body {
        border-top: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
        padding: 15px;
        min-height: 80px;
    }

    .dialog-fotter {
        text-align: right;
        padding: 5px 20px;
    }
}
</style>