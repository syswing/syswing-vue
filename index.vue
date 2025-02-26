<template>
  <el-form
    v-if="$slots.tableSearchFormItem"
    ref="tableSearchFormRef"
    :inline="true"
    :model="tableSearchForm"
    label-width="auto"
  >
    <slot name="tableSearchFormItem" v-bind="{ tableSearchForm }"></slot>
    <el-form-item>
      <el-button class="rounded-8" type="primary" @click="submitTableSearchForm">搜索</el-button>
      <el-button class="rounded-8" @click="resetTableSearchForm(tableSearchFormRef)"
        >重置
      </el-button>
    </el-form-item>
  </el-form>
  <el-row v-if="$slots.tableHeadOptions" class="mb-[20px]">
    <slot name="tableHeadOptions"></slot>
  </el-row>
  <el-row
    v-if="rowOpreations?.addRow || rowOpreations?.export || rowOpreations?.import"
    class="mb-[20px]"
  >
    <el-button
      :disabled="rowOpreations?.addRow?.disabled"
      v-if="rowOpreations.addRow"
      class="rounded-8"
      type="primary"
      @click="addRow()"
    >
      <NFIcon name="tianjia" class="mr-1"></NFIcon>
      新增
    </el-button>
    <el-button v-if="rowOpreations.export" class="rounded-8" @click="submitTableSearchForm">
      <NFIcon name="daoru" class="mr-1"></NFIcon>
      导入
    </el-button>
    <el-button v-if="rowOpreations.import" class="rounded-8" @click="submitTableSearchForm">
      <NFIcon name="daochu" class="mr-1"></NFIcon>
      导出
    </el-button>
  </el-row>
  <el-auto-resizer>
    <div class="pb-[32px] h-calc-70">
      <el-table
        ref="elTableRef"
        :data="tableData.list"
        :header-cell-class-name="tableClass.headerCellClassName"
        v-loading="tableData.loadingTable"
        v-bind="attrs"
      >
        <template v-for="column in columns" :key="column.dataIndex">
          <el-table-column
            v-if="!column?.hideInColumn"
            :class-name="column?.alian === 'center' ? 'text-center-important' : ''"
            :prop="column.dataIndex"
            :label="column.title"
          >
            <template v-if="column.dic" #default="scope">
              <span>{{ column.dic[scope.row[column.dataIndex]] }}</span>
            </template>
          </el-table-column>
        </template>
        <el-table-column
          v-if="(rowOpreations || $slots.rowOperation) && !hideOperation"
          class-name="text-center-important"
          fixed="right"
          label="操作"
        >
          <template #default="scope">
            <el-button
              v-if="rowOpreations?.editRow"
              link
              type="primary"
              size="small"
              @click.prevent="editRow(scope.$index)"
            >
              编辑
            </el-button>
            <!-- {{ console.log(rowOpreations?.deleteRow) }} -->
            <el-button
              v-if="rowOpreations?.deleteRow"
              @click="deleteRow(scope.row)"
              link
              type="danger"
              size="small"
            >
              删除
            </el-button>
            <!-- <el-popconfirm v-if="rowOpreations?.deleteRow" title="确定继续操作？" @confirm="deleteRow(scope.row)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>

              </template>
              sdf
            </el-popconfirm> -->
            <slot name="rowOperation" v-bind="{ scope }"></slot>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-if="!hidePagination" class="protable-pagination pb-[20px]">
      <el-pagination
        v-model:current-page="tableData.pagination.page"
        class="nf-pagination"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :default-page-size="tableConfig.defaultPageSize"
        v-bind="pagination"
      />
    </div>
  </el-auto-resizer>

  <pro-dialog
    ref="proDialogRef"
    :modal-class="`${noDialogPadding && 'pro-dialog-padding-0'} rounded-12-important`"
    :on-ok="okDialog"
    :width="dialogWidth"
  >
    <template #header>
      <h3 class="font-medium text-[16px] height-[56px] leading-[24px]">
        {{ dialogMode[currentDialogMode] }}
      </h3>
    </template>
    <el-form
      v-if="dialogFormFields.length || $slots.editDialog || $slots.addDialog"
      ref="tableDialogFormRef"
      :model="tableDialogForm"
      :rules="dialogRules"
      label-position="right"
      label-width="auto"
      :class="curdFormClass"
    >
      <template v-if="$slots.editDialog && currentDialogMode === 'edit'">
        <slot name="editDialog" v-bind="{ tableDialogForm }"></slot>
      </template>
      <template v-else-if="$slots.addDialog && currentDialogMode === 'add'">
        <slot name="addDialog" v-bind="{ tableDialogForm }"></slot>
      </template>
      <template v-else v-for="filed in dialogFormFields">
        <el-form-item :label="filed.title" :prop="filed.dataIndex">
          <map-field-type-to-el-form-item v-bind="filed" :form-model="tableDialogForm" />
        </el-form-item>
      </template>
    </el-form>
  </pro-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, computed, useAttrs, nextTick, onMounted, getCurrentInstance } from 'vue'
import { Column } from './Column'
import tableClass from './tableClass'
import ProDialog from '@/design/ProDialog/index.vue'
import MapFieldTypeToElFormItem from './MapFieldTypeToElFormItem.vue'
import { isArray } from 'lodash-es'
import tableConfig from './tableConfig'
import http from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const message = ElMessage

const attrs = useAttrs()

const dialogMode = {
  edit: '编辑',
  add: '新增'
}

type currentDialogMode = 'edit' | 'add'

const currentDialogMode = ref<currentDialogMode>('add')

const tableSearchFormRef = ref()
const tableDialogFormRef = ref() as any
const elTableRef = ref()
const proDialogRef = ref()
const tableSearchForm = reactive<any>({})

let tableDialogForm = reactive<any>({})
// let deleteLoading = reactive<any>(false)
const emit = defineEmits(['resetTableSearchForm'])

const tableData = ref({
  list: [],
  loadingTable: false,
  pagination: {
    page: tableConfig.defaultCurrent,
    size: tableConfig.defaultPageSize,
    total: tableConfig.defaultTotal
  }
})

const props = defineProps<{
  columns: Array<Column>

  dataSource?: any // 如果datasource 是一个数组 则前端分页 如果是一个promise 则等待promise返回数据

  rowOpreations?: {
    deleteRow: {
      url: string
      params: Function
      afterDelete: Function
    }
    editRow: {
      url: string
      params: Function
    }
    addRow: {
      url: string
      params: Function
      disabled: boolean
    }
    export: boolean | string
    import: boolean | string
  }
  dialogRules?: any
  dialogWidth?: number
  pagination?: any
  hideOperation?: boolean
  hidePagination?: boolean
  noDialogPadding?: boolean
  curdFormClass?: string // curd 弹窗的class
  onEditRow?: Function
  rowKey?: string
  firstInit?: boolean
}>()

const handleSizeChange = async (val: number) => {
  tableData.value.pagination.size = val

  // await nextTick()
  await getTableData({ page: tableData.value.pagination.page, size: val, params: tableSearchForm })
}
const handleCurrentChange = async (val: number) => {
  tableData.value.pagination.page = val

  // await nextTick()
  await getTableData({ page: val, size: tableData.value.pagination.size, params: tableSearchForm })
}

const deleteRow = async (row) => {
  const deleteRow = props.rowOpreations.deleteRow
  ElMessageBox.confirm('确定继续操作?', '确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await http.post(deleteRow.url, deleteRow.params(row))
      message.success('操作成功')
      await refresh()
    } catch (e) {
      console.log(e)
    } finally {
      // deleteLoading.value = false

      typeof deleteRow.afterDelete === 'function' && deleteRow.afterDelete(row)
    }
  })
}

const editRow = (row) => {
  proDialogRef.value.show()
  currentDialogMode.value = 'edit'
  tableDialogForm = Object.assign(tableDialogForm, { ...tableData.value.list[row] })
  typeof props.onEditRow === 'function' && props.onEditRow(tableDialogForm)
}
const resetTableSearchForm = (ref) => {
  if (!ref) return
  emit('resetTableSearchForm')
  Object.keys(tableSearchForm).map((key) => (tableSearchForm[key] = ''))
}
const submitTableSearchForm = async () => {
  await refresh()
}

// const currentInstance = getCurrentInstance() as any

const addRow = async () => {
  proDialogRef.value.show()
  currentDialogMode.value = 'add'
  Object.keys(tableDialogForm).map((key) => (tableDialogForm[key] = ''))
  // await nextTick()
  // tableDialogFormRef.value.resetFields()
}
const okDialog = async () => {
  await tableDialogFormRef.value.validate()

  if (currentDialogMode.value === 'add') {
    const addRow = props.rowOpreations.addRow
    const result = await http.post(
      addRow.url,
      addRow.params({ ...tableDialogForm, ...tableSearchForm })
    )
    message.success('操作成功')
    await refresh()
    return result
  }
  if (currentDialogMode.value === 'edit') {
    const editRow = props.rowOpreations.editRow

    const result = await http.post(
      editRow.url,
      editRow.params({ ...tableDialogForm, ...tableSearchForm })
    )
    message.success('操作成功')
    await refresh()
    return result
  }
}

// const handleClose = (done) => {
//   visibleDialog.value = false
//   typeof done === 'function' && done()
// }

// const handleSave = () => {

// }

const dialogFormFields = computed(() => {
  return props.columns
    .map((column) => {
      if (column[currentDialogMode.value]) {
        return column
      } else {
        return false
      }
    })
    .filter(Boolean)
}) as any

interface GetTableData {
  size: number
  page: number
  params?: any
}

interface DataSource {
  list: Array<any>
  total: number
  page: number
  size: number
}

const getTableData = async ({ size, page, params }: GetTableData) => {
  if (typeof props.dataSource === 'function') {
    tableData.value.loadingTable = true
    try {
      const result = (await props.dataSource({ size, page, params })) as DataSource
      tableData.value.list = result.list
      tableData.value.pagination.total = result.total
      tableData.value.pagination.page = result.page
      tableData.value.pagination.size = result.size
    } catch (e) {
      console.log(e)
    } finally {
      tableData.value.loadingTable = false

      nextTick(() => {
        elTableRef.value.doLayout()
      })
    }
  } else if (isArray(props.dataSource)) {
    tableData.value.list = props.dataSource
  } else {
    console.log('ProTable:datasource 类型错误', typeof props.dataSource)
  }
}
const refresh = async () => {
  await getTableData({
    size: tableData.value.pagination.size,
    page: tableData.value.pagination.page,
    params: tableSearchForm
  })
}
onMounted(async () => {
  !props.firstInit && await refresh()
})

defineExpose({
  refresh,
  tableSearchForm,
  tableData
})
</script>
