<template>
  <div>
    <div>
      <t-card
        :class="`transition-all duration-300 ${formExpanded ? 'h-auto' : 'h-0 opacity-0'}`"
        :bordered="false"
      >
        <div class="flex items-center mb-4 h-auto">
          <div class="mr-2"><FiltQuery /></div>
          <span class="text-base text-[#072696] font-bold">筛选条件</span>
        </div>
        <t-form
          v-if="$slots.tableSearchFormItem || searchFormFields.length"
          :data="tableSearchForm"
          layout="inline"
          labelWidth="150px"
          v-bind="attrs?.tableSearchFormAttrs || {}"
        >
          <slot
            name="tableSearchFormItem"
            v-bind="{ tableSearchForm }"
          ></slot>
          <template v-for="filed in searchFormFields">
            <t-form-item
              :label="filed.title"
              :name="filed.colKey"
            >
              <MapFieldTypeToElFormItem
                v-bind="filed"
                :form-model="tableSearchForm"
              />
            </t-form-item>
          </template>
          <t-form-item>
            <t-space size="small">
              <t-button
                theme="primary"
                type="submit"
                @click="submitTableSearchForm"
                >查询</t-button
              >
              <t-button
                theme="default"
                variant="base"
                type="reset"
                >重置</t-button
              >
            </t-space>
          </t-form-item>
        </t-form>
      </t-card>
      <div class="flex justify-center mt-[-8px] cursor-pointer">
        <img
          :class="`transition-all duration-300 ${formExpanded ? 'rotate-270' : 'rotate-90'}`"
          src="@/assets/tprotable/expand.png"
          alt="收起"
          @click="handleExpand"
        />
      </div>
    </div>

    <t-card :bordered="false">
      <t-row v-if="$slots.tableHeadOptions">
        <slot
          name="tableHeadOptions"
          v-bind="{
            handleAddRow,
            handleDeleteRow,
          }"
        ></slot>
      </t-row>
      <t-row
        class="mb-2"
        v-if="rowOpreations?.addRow || rowOpreations?.export || rowOpreations?.import || rowOpreations?.deleteRow"
      >
        <t-space>
          <slot
            v-if="$slots.tableAddSlots"
            name="tableAddSlots"
            v-bind="{ handleAddRow }"
          ></slot>
          <template v-else>
            <t-button
              v-if="rowOpreations?.addRow"
              theme="primary"
              @click="handleAddRow"
              >新增</t-button
            >
          </template>

          <t-button
            theme="danger"
            v-if="rowOpreations?.deleteRow"
            @click="() => handleDeleteRow()"
          >
            删除
          </t-button>
          <t-button
            theme="primary"
            v-if="rowOpreations?.export"
            >导出</t-button
          >
          <t-button
            theme="primary"
            v-if="rowOpreations?.import"
            @click="handleImport"
            >导入</t-button
          >
        </t-space>
      </t-row>
      <t-table
        :row-key="props.rowKey"
        :selected-row-keys="selectedRowKeys"
        @select-change="rehandleSelectChange"
        :select-on-row-click="true"
        :data="tableData.list"
        :columns="tableColumns"
        :loading="tableData.loadingTable"
        v-bind="attrs"
        size="small"
        :pagination="tableData.pagination"
        @page-change="onPageChange"
      />
    </t-card>
    <Dialog
      ref="tableDialogRef"
      :on-ok="okDialog"
    >
      <template #header>
        <h3 class="font-medium text-[16px] height-[56px] leading-[24px]">
          {{ dialogMode[currentDialogMode] }}
        </h3>
      </template>
      <t-form
        v-if="dialogFormFields.length || $slots.editDialog || $slots.addDialog"
        ref="tableDialogFormRef"
        :data="tableDialogForm"
        :rules="dialogRules"
        label-position="right"
        label-width="auto"
      >
        <template v-if="$slots.editDialog && currentDialogMode === 'editForm'">
          <slot
            name="editDialog"
            v-bind="{ tableDialogForm }"
          ></slot>
        </template>
        <template v-else-if="$slots.addDialog && currentDialogMode === 'add'">
          <slot
            name="addDialog"
            v-bind="{ tableDialogForm }"
          ></slot>
        </template>
        <template
          v-else
          v-for="filed in dialogFormFields"
        >
          <t-form-item
            :label="filed.title"
            :name="filed.colKey"
          >
            <MapFieldTypeToElFormItem
              v-bind="filed"
              :form-model="tableDialogForm"
            />
          </t-form-item>
        </template>
      </t-form>
    </Dialog>
  </div>
</template>

<script setup lang="tsx">
import { computed, onMounted, reactive, ref, useAttrs } from 'vue';
import type { DataSource, GetTableData, ProTableProps } from './ProTable.d.ts';
import FiltQuery from '@/assets/tprotable/filtQuery.svg?component';
import tableConfig from './tableConfig';
import Dialog from './dialog.vue';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { request } from '@/utils/request/index.js';
import MapFieldTypeToElFormItem from './MapFieldTypeToElFormItem.vue';
const dialogMode = {
  editForm: '编辑',
  add: '新增',
};

type currentDialogMode = 'editForm' | 'add';

const currentDialogMode = ref<currentDialogMode>('add');

const attrs = useAttrs() as Record<string, any>;
const props = defineProps<ProTableProps>();

const tableSearchForm = reactive<any>({});

const tableData = ref({
  list: [],
  loadingTable: false,
  pagination: {
    defaultCurrent: tableConfig.defaultCurrent,
    defaultPageSize: tableConfig.defaultPageSize,
    total: tableConfig.defaultTotal,
  },
});

const tableDialogRef = ref<InstanceType<typeof Dialog>>();
let tableDialogForm = reactive<any>({});
const tableDialogFormRef = ref();

const dialogFormFields = computed(() => {
  return props.columns
    .map((column: any) => {
      if (column[currentDialogMode.value]) {
        return column;
      } else {
        return false;
      }
    })
    .filter(Boolean);
}) as any;

const searchFormFields = computed(() => {
  return props.columns
    .map((column: any) => {
      if (column.search) {
        return column;
      } else {
        return false;
      }
    })
    .filter(Boolean);
}) as any;
console.log('searchFormFields', searchFormFields.value);
const tableColumns = computed(() => {
  if (props?.rowOpreations?.editRow || props?.rowOpreations?.deleteRow) {
    props.columns.push({
      title: '操作',
      colKey: 'action',
      cell: (h: any, { row }: { row: any }) => {
        return (
          <t-space>
            {props?.rowOpreations?.editRow && (
              <t-link
                hover="color"
                theme="primary"
                onClick={() => handleEditRow(row)}
              >
                编辑
              </t-link>
            )}
            {props?.rowOpreations?.deleteRow && (
              <t-link
                hover="color"
                theme="danger"
                onClick={() => handleDeleteRow(row)}
              >
                删除
              </t-link>
            )}
          </t-space>
        );
      },
    });
  }
  return props.columns;
});

console.log('dialogFormFields', dialogFormFields.value);
// row-select 选中行
const selectedRowKeys = ref<string[]>([]);
const rehandleSelectChange = (value: string[], ctx: any) => {
  selectedRowKeys.value = value;
  console.log(value, ctx);
};

const formExpanded = ref<boolean>(true);

const getTableData = async ({ size, page, params }: GetTableData) => {
  // console.log('getTableDatae', props.dataSource, typeof props.dataSource, props.dataSource instanceof Array);
  if (typeof props.dataSource === 'function') {
    tableData.value.loadingTable = true;
    try {
      const result = (await props.dataSource({ size, page, params })) as DataSource;
      console.log('result', result);
      tableData.value.list = result.list;
      tableData.value.pagination.total = result.total;
      tableData.value.pagination.defaultCurrent = result.page;
      tableData.value.pagination.defaultPageSize = result.size;
    } catch (e) {
      console.log(e);
    } finally {
      tableData.value.loadingTable = false;
      // nextTick(() => {
      //   elTableRef.value.doLayout()
      // })
    }
  } else if (props.dataSource instanceof Array) {
    tableData.value.list = props.dataSource;
  } else {
    console.log('ProTable:datasource 类型错误', typeof props.dataSource);
  }
};

const refresh = async () => {
  await getTableData({
    size: tableData.value.pagination.defaultPageSize,
    page: tableData.value.pagination.defaultCurrent,
    params: tableSearchForm,
  });
};

const handleExpand = () => {
  formExpanded.value = !formExpanded.value;
};

onMounted(async () => {
  !props.firstInit && (await refresh());
});

const submitTableSearchForm = async () => {
  await refresh();
};

const handleImport = () => {
  if (
    typeof props.rowOpreations?.import === 'object' &&
    typeof props.rowOpreations.import.handleImport === 'function'
  ) {
    props.rowOpreations.import.handleImport();
  }
};

const onPageChange = async ({ current, pageSize }: { current: number; pageSize: number }) => {
  console.log('page-change', current, pageSize);
  await getTableData({ page: current, size: pageSize, params: tableSearchForm });
};

const handleAddRow = () => {
  tableDialogRef.value.show();
  currentDialogMode.value = 'add';
  Object.keys(tableDialogForm).map((key) => (tableDialogForm[key] = ''));
  console.log('tableDialogForm', tableDialogForm);
};

const handleEditRow = (row: any) => {
  tableDialogRef.value.show();
  currentDialogMode.value = 'editForm';

  tableDialogForm = Object.assign(tableDialogForm, { ...row });
  console.log('tableDialogForm', tableDialogForm, { ...row });
  typeof props.onEditRow === 'function' && props.onEditRow(tableDialogForm);
};

const handleDeleteRow = (row?: any) => {
  const deleteRow = props.rowOpreations.deleteRow;
  if (!row && !selectedRowKeys.value.length) {
    MessagePlugin.warning('请选择要删除的数据');
    return;
  }
  const confirmDia = DialogPlugin({
    header: '删除确认',
    body: row ? `确定要删除吗？` : `确定要删除选中的${selectedRowKeys.value.length}条数据吗？`,
    onConfirm: async () => {
      try {
        await request.post({
          url: deleteRow.url,
          data: deleteRow.params(row || selectedRowKeys.value),
        });
        MessagePlugin.success('操作成功');
        await refresh();
        confirmDia.hide();
      } catch (e) {
        console.log(e);
      } finally {
        typeof deleteRow.afterDelete === 'function' && deleteRow.afterDelete(row);
      }
    },
    onClose: () => {
      confirmDia.hide();
    },
  });
};

const okDialog = async () => {
  await tableDialogFormRef.value.validate();

  if (currentDialogMode.value === 'add') {
    const addRow = props.rowOpreations.addRow;
    const result = await request.post({
      url: addRow.url,
      data: addRow.params({ ...tableDialogForm, ...tableSearchForm }),
    });
    MessagePlugin.success('操作成功');
    await refresh();
    return result;
  }
  if (currentDialogMode.value === 'editForm') {
    const editRow = props.rowOpreations.editRow;
    const result = await request.post({
      url: editRow.url,
      data: editRow.params({ ...tableDialogForm, ...tableSearchForm }),
    });
    MessagePlugin.success('操作成功');
    await refresh();
    return result;
  }
};

defineExpose({
  refresh,
  tableSearchForm,
  tableData,
});
</script>
