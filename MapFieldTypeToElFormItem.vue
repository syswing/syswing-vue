<template>
  <div class="w-full">
    <template v-if="attrs.dataType === 'input'">
      <el-input class="w-full" v-model="formModel[attrs.dataIndexFrom]" />
    </template>
    <template v-if="attrs.dataType === 'treeSelect' && attrs.options">
      <el-select placeholder="请选择" class="w-full" v-model="formModel[attrs.dataIndexFrom]">
        <el-option
          v-for="item in attrs.options || []"
          :key="item[attrs.value]"
          :label="item[attrs.label]"
          :value="item[attrs.value]"
        >
        </el-option>
      </el-select>
    </template>
  </div>
</template>

<script setup>
import { onMounted, useAttrs } from 'vue'

const props = defineProps({
  formModel: {
    type: Object,
    required: true
  }
})

const attrs = useAttrs()

onMounted(() => {
})
</script>
