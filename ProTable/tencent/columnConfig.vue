<template>
  <t-tooltip content="鼠标长按可以拖动列的位置,点击左侧框可控制列是否显示,点击右侧开关可控制列是否固定">
    <div class="flex items-center">
      <span style="margin-right: 6px; font-size: 16px">列配置</span>
      <TipIcon />
      <t-button
        theme="primary"
        size="small"
        @click="handleReset"
        class="ml-auto"
      >
        重置
      </t-button>
    </div>
  </t-tooltip>

  <div class="flex items-center">
    <span>显示</span>
    <span class="ml-2">列名</span>
    <span class="ml-auto">固定列</span>
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
      class="flex"
      v-for="element in list"
      :key="element.colKey"
    >
      <t-checkbox
        v-model="element.check"
        :value="element.title"
        @change="(v) => changeCheckStatus(v, element)"
        class="w-[28px] ml-[4px]"
      ></t-checkbox>
      <div class="ml-[6px] w-full">{{ element.title }}</div>
      <t-switch
        v-model="element.isFixed"
        @change="(v) => changeSwitch(v, element)"
      />
    </li>
  </VueDraggableNext>
</template>

<script setup>
import TipIcon from '@/assets/tprotable/tipIcon.svg?component';
import { VueDraggableNext } from 'vue-draggable-next';
import { ref, computed, nextTick } from 'vue';

const emits = defineEmits(['changeCloumnsDisplay', 'changeCloumnsFixed', 'changeCloumnsDrag', 'resetColumns']);

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
});

const columns = computed(() => props.columns.filter((item) => item.colKey !== 'action' && item.title));

const list = ref(columns.value);

const unCheckedColumns = computed(() => {
  return list.value.filter((item) => !item.check).map((item) => item.colKey);
});

const fixedColumns = computed(() => {
  return list.value.filter((item) => item.isFixed).map((item) => item.colKey);
});

const changeCheckStatus = (val, element) => {
  element.check = val;
  emits('changeCloumnsDisplay', unCheckedColumns.value);
};

const handleReset = async () => {
  emits('resetColumns', list.value);
  console.log('handleReset', columns.value);
  await nextTick();
  list.value = columns.value.map((item) => {
    item.isFixed = false;
    return item;
  });
};

const onStart = () => {
  console.log('onStart');
};

const onEnd = () => {
  emits(
    'changeCloumnsDrag',
    list.value.map((item) => item.colKey),
  );
};
const changeSwitch = (val, element) => {
  console.log('changeSwitch', val, element);
  element.isFixed = val;
  emits('changeCloumnsFixed', fixedColumns.value);
};
</script>

<style scoped></style>
