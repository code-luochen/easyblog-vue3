<template>
    <!-- 封装成我们想要的模样 -->
    <div class="editor-html">
        <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
      />
      <Editor
        :style="{height: height+'px', 'overflow-y': hidden}"
        v-model="(modelValue)"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="handleChange"
      />
    </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { onBeforeUnmount, ref, shallowRef } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const props = defineProps({
    modelValue:{
        type:String,
        default:''
    },
    height:{
        type:Number,
        default:500
    }
})

 // 编辑器实例，必须用 shallowRef
 const editorRef = shallowRef()
 const mode = ref('default')

const toolbarConfig = {}
const editorConfig = { placeholder: '请输入内容...' ,
    MENU_CONF:{
        uploadImage:{
            maxFileSize:3*1024*1024,
            server:"/api/file/uploadImage4WangEditor",
            customInsert(res,insertFn){
                insertFn(res.data.url,"","")
            }
        }
    }
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const emit = defineEmits()
const handleChange =(editor)=>{
    emit("update:modelValue",editor.getHtml())
}

</script>

<style lang="scss" scoped>
.editor-html{
    border:1px solid #ddd;
}
</style>