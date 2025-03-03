<template>
  <t-tooltip content="鼠标长按可以拖动列的位置,点击左侧框可控制列是否显示,点击右侧开关可控制列是否固定">
    <div class="flex items-center">
      <span style="margin-right: 6px; font-size: 16px">列配置</span>
      <TipIcon />
    </div>
  </t-tooltip>
  <t-divider />
  <div class="flex items-center">
    <span>显示</span>
    <span>列名</span>
    <span>固定列</span>
  </div>
  <VueDraggableNext
    v-model="list"
    class="list-group"
    tag="ul"
    v-bind="{
      animation: 200,
      group: 'description',
      disabled: false,
      ghostClass: 'ghost',
    }"
    @start="onStart"
    @end="onEnd"
  >
    <li
      v-for="element in list"
      :key="element.name"
    >
      <div class="list-group-item">{{ element.name }}</div>
    </li>
  </VueDraggableNext>
</template>

<script setup>
import TipIcon from '@/assets/tprotable/tipIcon.svg?component';
import VueDraggableNext from 'vue-draggable-next';

const list = ref([
  {
    name: '列名',
    fixed: false,
  },
]);

const onStart = () => {
  console.log('onStart');
};

const onEnd = () => {
  console.log('onEnd');
};
</script>

<style scoped></style>
