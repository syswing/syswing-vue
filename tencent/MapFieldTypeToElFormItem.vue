<template>
  <div class="w-full">
    <template v-if="attrs.dataType === 'input'">
      <t-input
        class="w-full"
        v-model="formModel[attrs.colKey]"
        clearable
      />
    </template>
    <template v-if="attrs.dataType === 'select' && attrs.options">
      <t-select
        placeholder="请选择"
        class="w-full"
        v-model="formModel[attrs.colKey]"
        clearable
      >
        <t-option
          v-for="item in attrs.options || []"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
          {{ item.label }}
        </t-option>
      </t-select>
    </template>
    <template v-if="attrs.dataType === 'dateRange'">
      <pro-t-date-range-picker
        v-model="formModel[attrs.colKey]"
        v-bind="attrs"
      />
      <!-- <t-date-range-picker
        v-model="formModel[attrs.colKey]"
        allow-input
        clearable
        format="YYYY-MM-DD HH:mm:ss"
      /> -->
    </template>
  </div>
</template>

<script setup>
import { onMounted, useAttrs } from 'vue';
import ProTDateRangePicker from './protdaterangepicker.vue';
const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
});
const attrs = useAttrs();
// console.log('props.formModel', props.formModel, attrs);

onMounted(() => {});
</script>
