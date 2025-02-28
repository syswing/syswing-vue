<template>
  <el-dialog 
    draggable
    :model-value="visible"
    :title="title"
    :width="width"
    class="pro-dialog"
    overflow  
    :before-close="handleClose"
    v-bind="$attrs"
  >
    <template #header>
      <slot name="header"></slot>
    </template>
    <slot></slot>
    <template #footer>
      <div :class="dialogClass['.dialog-footer']">
        <template v-if="$slots.footer">
          <slot name="footer"></slot>
        </template>
        <template v-else>
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" :loading="dialogLoading" @click="handleSave">保存</el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>
 
<script setup>
import {
  ref ,
  // defineExpose
  // useAttrs
} from "vue"
import dialogClass from './dialogClass'

const dialogLoading = ref(false)
const visible = ref(false)

const show = () => {
  visible.value = true
}

// const attrs = useAttrs()
defineExpose({
  show,
})



const props = defineProps({
  width:Number,
  title:String,
  onOk:Function, // 返回一个promise的函数
})

const handleSave = async () => {
  dialogLoading.value = true
  try{
    const result = typeof props.onOk === 'function' ? await props.onOk() : console.log('dialog:props.onOk 不是一个 function')
    console.log('dialog:result',result)
    visible.value = false
  }catch(e){
    console.log(e)
  }finally{
    dialogLoading.value = false
  }
  
}

const handleClose = (done) => {
  visible.value = false
  typeof done === 'function' && done()
}

</script>
