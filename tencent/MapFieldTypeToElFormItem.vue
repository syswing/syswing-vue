<template>
  <div class="w-full">
    <template v-if="attrs.dataType === 'input'">
      <t-input
        class="w-full"
        v-model="formModel[attrs.colKey]"
      />
    </template>
    <template v-if="attrs.dataType === 'treeSelect' && attrs.options">
      <t-select
        placeholder="请选择"
        class="w-full"
        v-model="formModel[attrs.colKey]"
      >
        <t-option
          v-for="item in attrs.options || []"
          :key="item[attrs.value]"
          :label="item[attrs.label]"
          :value="item[attrs.value]"
        >
        </t-option>
      </t-select>
    </template>
  </div>
</template>

<script setup>
import { onMounted, useAttrs } from 'vue';

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
});
const attrs = useAttrs();
console.log('props.formModel', props.formModel, attrs);

onMounted(() => {});
</script>
