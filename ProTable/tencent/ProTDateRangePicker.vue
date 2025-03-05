<template>
  <t-space direction="vertical">
    <t-date-range-picker
      v-model="dateValue"
      allow-input
      clearable
      format="YYYY-MM-DD HH:mm:ss"
    />
  </t-space>
</template>

<script setup>
import { computed, useAttrs } from 'vue';
const attrs = useAttrs();
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(['update:modelValue']);
const dateValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    if (attrs.dataMap) {
      emit('update:modelValue', attrs.dataMap(val));
    } else {
      emit('update:modelValue', val);
    }
  },
});

console.log('dateValue', dateValue.value, attrs.dataMap);

// const onPick = (value, context) => console.log('onPick:', value, context);
// const onChange = (value, context) => {
//   console.log('onChange:', value, context);
//   console.log(
//     'timestamp:',
//     context.dayjsValue.map((d) => d.valueOf()),
//   );
//   console.log(
//     'YYYYMMDD:',
//     context.dayjsValue.map((d) => d.format('YYYYMMDD')),
//   );
// };
</script>
