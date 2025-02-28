<template>
  <t-dialog
    draggable
    v-model:visible="visible"
    :title="title"
    :width="width"
    v-bind="$attrs"
  >
    <template #header>
      <slot name="header"></slot>
    </template>
    <slot></slot>
    <template #footer>
      <div class=".dialog-footer">
        <template v-if="$slots.footer">
          <slot name="footer"></slot>
        </template>
        <template v-else>
          <t-button
            variant="outline"
            @click="handleClose"
            >取 消</t-button
          >
          <t-button
            theme="primary"
            :loading="dialogLoading"
            @click="handleSave"
            >保存</t-button
          >
        </template>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';
const visible = ref(false);
const dialogLoading = ref(false);

const props = defineProps({
  width: Number,
  title: String,
  onOk: Function, // 返回一个promise的函数
});

const show = () => {
  visible.value = true;
};

const handleSave = async () => {
  dialogLoading.value = true;
  try {
    const result =
      typeof props.onOk === 'function' ? await props.onOk() : console.log('dialog:props.onOk 不是一个 function');
    console.log('dialog:result', result);
    visible.value = false;
  } catch (e: any) {
    // console.log(e);
    MessagePlugin.error(e.message);
  } finally {
    dialogLoading.value = false;
  }
};

const handleClose = (done: any) => {
  visible.value = false;
  typeof done === 'function' && done();
};

defineExpose({
  show,
});
</script>
