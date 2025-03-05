<template>
  <div>
    <div>
      <t-card
        :class="`transition-all duration-300 ${formExpanded ? 'h-auto' : 'h-0 opacity-0'}`"
        :bordered="false"
      >
        <div class="flex items-center mb-4 h-auto">
          <div class="mr-2"><FiltQuery /></div>
          <span
            :style="{ color: color }"
            :class="`text-base font-bold`"
            >筛选条件</span
          >
          <t-space
            class="ml-auto"
            size="small"
          >
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
              @click="resetTableSearchForm"
              >重置</t-button
            >
          </t-space>
        </div>
        <t-form
          v-if="$slots.tableSearchFormItem || searchFormFields.length"
          :data="tableSearchForm"
          layout="inline"
          v-bind="attrs?.tableSearchFormAttrs || {}"
        >
          <slot
            name="tableSearchFormItem"
            v-bind="{ tableSearchForm }"
          ></slot>
          <template v-for="filed in searchFormFields">
            <!-- <t-row :gutter="[8, 24]"> -->
            <t-col :span="filed.formItemAttrs?.span || 4">
              <t-form-item
                :label="filed.title"
                :name="filed.colKey"
                v-bind="filed.formItemAttrs || {}"
                :style="{
                  width: '90%',
                  marginLeft: '10px',
                }"
              >
                <MapFieldTypeToElFormItem
                  v-bind="filed"
                  :form-model="tableSearchForm"
                />
              </t-form-item>
            </t-col>
            <!-- </t-row> -->
          </template>
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
      <t-row
        class="mb-2"
        v-if="
          rowOpreations?.addRow ||
          rowOpreations?.export ||
          rowOpreations?.import ||
          rowOpreations?.deleteRow ||
          $slots.tableHeadOptions
        "
      >
        <t-space>
          <t-popup
            placement="bottom"
            destroy-on-close
            trigger="click"
          >
            <t-button>
              <template #icon>
                <SetIcon />
              </template>
              列配置
            </t-button>

            <template #content>
              <column-config
                :columns="tableColumns"
                @changeCloumnsDisplay="changeCloumnsDisplay"
                @changeCloumnsFixed="changeCloumnsFixed"
                @changeCloumnsDrag="changeCloumnsDrag"
                @resetColumns="resetColumns"
              />
            </template>
          </t-popup>

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
          <slot
            v-if="$slots.tableImportSlots"
            name="tableImportSlots"
            v-bind="{ handleImport }"
          ></slot>
          <template v-else>
            <t-button
              theme="primary"
              v-if="rowOpreations?.import"
              @click="handleImport"
              >导入</t-button
            >
          </template>

          <template v-if="$slots.tableHeadOptions">
            <slot
              name="tableHeadOptions"
              v-bind="{
                handleAddRow,
                handleDeleteRow,
              }"
            ></slot>
          </template>
        </t-space>
      </t-row>
      <t-table
        v-model:displayColumns="displayColumns"
        :row-key="props.rowKey"
        :selected-row-keys="selectedRowKeys"
        @select-change="rehandleSelectChange"
        :data="tableData.list"
        :columns="tableColumns"
        :loading="tableData.loadingTable"
        v-bind="attrs"
        size="small"
        :pagination="tableData.pagination"
        @page-change="onPageChange"
        resizable
      />
    </t-card>
    <Dialog
      ref="tableDialogRef"
      :on-ok="okDialog"
      v-bind="attrs?.tableDialogAttrs || {}"
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
        layout="inline"
        v-bind="attrs?.dialogFormAttrs || {}"
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
          <template v-if="attrs?.dialogFormAttrs?.layout === 'horizontal'">
            <t-form-item
              :label="filed.title"
              :name="filed.colKey"
              v-bind="filed.dialogFormItemAttrs || {}"
              :style="{
                width: '90%',
                marginLeft: '10px',
              }"
            >
              <MapFieldTypeToElFormItem
                v-bind="filed"
                :form-model="tableDialogForm"
              />
            </t-form-item>
          </template>
          <template v-else>
            <t-col :span="filed.dialogFormItemAttrs?.span || 4">
              <t-form-item
                :label="filed.title"
                :name="filed.colKey"
                v-bind="filed.dialogFormItemAttrs || {}"
                :style="{
                  width: '90%',
                  marginLeft: '10px',
                }"
              >
                <MapFieldTypeToElFormItem
                  v-bind="filed"
                  :form-model="tableDialogForm"
                />
              </t-form-item>
            </t-col>
          </template>
        </template>

        <template v-if="$slots.extraDialogFormField">
          <slot
            name="extraDialogFormField"
            v-bind="{ tableDialogForm, currentDialogMode }"
          ></slot>
        </template>
      </t-form>
    </Dialog>
  </div>
</template>

<script setup lang="tsx">
import { computed, onMounted, reactive, ref, useAttrs, useSlots } from 'vue';
import type { DataSource, GetTableData, ProTableProps } from './ProTable.d.ts';
import FiltQuery from '@/assets/tprotable/filtQuery.svg?component';
import SetIcon from '@/assets/tprotable/setIcon.svg?component';
import tableConfig from './tableConfig';
import Dialog from './dialog.vue';
import { DialogPlugin, MessagePlugin, Pagination } from 'tdesign-vue-next';
import { request } from '@/utils/request/index.js';
import MapFieldTypeToElFormItem from './MapFieldTypeToElFormItem.vue';
import { useSettingStore } from '@/store/modules/setting';
import ColumnConfig from './columnConfig.vue';
import { dict2Map } from './utils';

const emit = defineEmits(['beforeSearch', 'beforeDialogConfirm', 'afterDialogConfirm', 'beforeShowDialog']);

const dialogMode = {
  editForm: '编辑',
  add: '新增',
};

type currentDialogMode = 'editForm' | 'add';

const currentDialogMode = ref<currentDialogMode>('add');

const attrs = useAttrs() as Record<string, any>;
const props = defineProps<ProTableProps>();

let tableSearchForm = reactive<any>({});

const settingStore = useSettingStore();

const color = computed(() => {
  return settingStore.displayMode === 'dark' ? '#fff' : '#072696';
});

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

// const staticColumn = ['applicant', 'status'];
// const displayColumns = ref(staticColumn.concat(['channel', 'detail.email', 'createTime']));

// const columnControllerConfig = computed(() => ({
//   // 列配置按钮位置
//   placement: 'top-right',
//   // 用于设置允许用户对哪些列进行显示或隐藏的控制，默认为全部字段
//   fields: ['blnoDataCheckType', 'blno', 'cname'],

//   // 弹框组件属性透传
//   dialogProps: { preventScrollThrough: true },
//   // 列配置按钮组件属性透传
//   // buttonProps: customText.value ? { content: '显示列控制', theme: 'primary', variant: 'base' } : undefined,

//   // 数据字段分组显示
// }));

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
    .filter(Boolean)
    .sort((a: any, b: any) => a.search - b.search);
}) as any;

// 列配置 fixed 固定
const fixedColumns = ref([]);
const slots = useSlots();
// console.log('searchFormFields', searchFormFields.value);
const tableColumns = computed(() => {
  console.log('props.rowOpreations', props.rowOpreations);
  if (
    (props?.rowOpreations?.editRow || props?.rowOpreations?.deleteRow) &&
    !props.columns.some((column: any) => column.colKey === 'action')
  ) {
    props.columns.push({
      title: '操作',
      colKey: 'action',
      width: props?.rowOpreations?.width || 200,
      cell: (h: any, { row }: { row: any }) => {
        return (
          <t-space size="small">
            {props?.rowOpreations?.editRow && (
              <t-button
                hover="color"
                theme="primary"
                size="small"
                onClick={() => handleEditRow(row)}
              >
                编辑
              </t-button>
            )}
            {props?.rowOpreations?.deleteRow && (
              <t-button
                hover="color"
                size="small"
                theme="danger"
                onClick={() => handleDeleteRow(row)}
              >
                删除
              </t-button>
            )}
            {slots.extraAction?.({ row })}
          </t-space>
        );
      },
    });
  }

  let columns = props.columns
    .filter((column: any) => !column.hideInColumn)
    .map((column: any) => {
      // 添加字段映射处理
      if (column.options && !column.cell) {
        column.cell = (h: any, { row }: { row: any }) => {
          return h('span', {}, dict2Map(column.options)[row[column.colKey]]);
        };
      }

      if (column.colKey === 'row-select' || column.colKey === 'action') {
        column.colKey === 'row-select' ? (column.fixed = 'left') : (column.fixed = 'right');
      } else {
        column.check = true;

        if (fixedColumns.value.includes(column.colKey)) {
          column.fixed = 'left';
        } else {
          column.fixed = false;
        }
      }

      return column;
    });
  const rowSelectColumn = columns.find((c: any) => c.colKey === 'row-select');
  const actionColumn = columns.find((c: any) => c.colKey === 'action');
  const normalColumns = columns.filter((c: any) => c.colKey !== 'row-select' && c.colKey !== 'action');

  // 对普通列按照columnsIndex排序
  let sortedNormalColumns = normalColumns;
  if (columnsIndex.value.length > 0) {
    sortedNormalColumns = columnsIndex.value.reduce((acc: any[], colKey: string) => {
      const col = normalColumns.find((c: any) => c.colKey === colKey);
      if (col) acc.push(col);
      return acc;
    }, []);
  }
  return [rowSelectColumn, ...sortedNormalColumns, actionColumn].filter(Boolean);
});

const displayColumns = computed(() => {
  console.log(
    'tableColumns.value',
    tableColumns.value.map((c: any) => c.colKey),
  );
  return tableColumns.value
    .filter((column: any) => !hiddenColumns.value.includes(column.colKey))
    .map((column: any) => column.colKey);
});

// 列配置 checkbox 隐藏
const hiddenColumns = ref([]);
// 列配置 drag 顺序
const columnsIndex = ref(props.defaultIndex || []);

const changeCloumnsDisplay = (columns: any) => {
  console.log('changeCloumnsDisplay', columns);
  hiddenColumns.value = columns;
};
const changeCloumnsFixed = (columns: any) => {
  fixedColumns.value = columns;
};

const changeCloumnsDrag = (columns: any) => {
  columnsIndex.value = columns;
};

const resetColumns = (columns: any) => {
  columnsIndex.value = props.defaultIndex || [];
  hiddenColumns.value = [];
  fixedColumns.value = [];
};

// console.log('displayColumns', displayColumns.value);
// console.log('dialogFormFields', dialogFormFields.value);
// row-select 选中行
const selectedRowKeys = ref<string[]>([]);
const rehandleSelectChange = (value: string[], ctx: any) => {
  selectedRowKeys.value = value;
  // console.log(value, ctx);
};

const formExpanded = ref<boolean>(true);

const getTableData = async ({ size, page, params }: GetTableData) => {
  console.log('getTableDatae', props.dataSource, typeof props.dataSource, props.dataSource instanceof Array);
  if (typeof props.dataSource === 'function') {
    tableData.value.loadingTable = true;
    try {
      const result = (await props.dataSource({ size, page, params })) as DataSource;
      console.log('**********', result);
      tableData.value.list = result.list;
      tableData.value.pagination.total = result.total;
      tableData.value.pagination.defaultCurrent = result.page;
      tableData.value.pagination.defaultPageSize = result.size;
    } catch (e) {
      console.log(e);
      // MessagePlugin.error(e.message);
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
  emit('beforeSearch', tableSearchForm);
  console.log('submitTableSearchForm', tableSearchForm);

  await refresh();
};

const resetTableSearchForm = () => {
  searchFormFields.value.forEach((field: any) => {
    delete tableSearchForm[field.colKey];
  });

  console.log('resetTableSearchForm', tableSearchForm);
  emit('beforeSearch', tableSearchForm);
  refresh();
};

// 导入
const handleImport = () => {
  console.log('handleImport', props.rowOpreations?.import);
  if (
    typeof props.rowOpreations?.import === 'object' &&
    typeof props.rowOpreations.import.handleImport === 'function'
  ) {
    props.rowOpreations.import.handleImport();
  }
};

const onPageChange = async ({ current, pageSize }: { current: number; pageSize: number }) => {
  // console.log('page-change', current, pageSize);
  await getTableData({ page: current, size: pageSize, params: tableSearchForm });
};

const handleAddRow = () => {
  emit('beforeShowDialog', 'add');
  tableDialogRef.value.show();
  currentDialogMode.value = 'add';
  Object.keys(tableDialogForm).map((key) => (tableDialogForm[key] = ''));
  // console.log('tableDialogForm', tableDialogForm);
};

const handleEditRow = (row: any) => {
  emit('beforeShowDialog', 'edit');
  tableDialogRef.value.show();
  currentDialogMode.value = 'editForm';

  tableDialogForm = Object.assign(tableDialogForm, { ...row });
  // console.log('tableDialogForm', tableDialogForm, { ...row });
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
    confirmLoading: false,
    onConfirm: async () => {
      try {
        confirmDia.setConfirmLoading(true);
        await request.post({
          url: deleteRow.url,
          data: deleteRow.params(row || selectedRowKeys.value),
        });
        MessagePlugin.success('操作成功');

        // tableData.value.pagination.defaultCurrent = 1;
        // tableData.value.pagination.defaultPageSize = 10;

        await refresh();
        confirmDia.hide();
      } catch (e) {
        console.log(e);
      } finally {
        typeof deleteRow.afterDelete === 'function' && deleteRow.afterDelete(row);
        selectedRowKeys.value = [];
        confirmDia.setConfirmLoading(false);
      }
    },
    onClose: () => {
      confirmDia.hide();
    },
  });
};

const okDialog = async () => {
  await tableDialogFormRef.value.validate();
  emit('beforeDialogConfirm', tableDialogForm);
  if (currentDialogMode.value === 'add') {
    const addRow = props.rowOpreations.addRow;
    const result = await request.post({
      url: addRow.url,
      data: addRow.params({ ...tableDialogForm }),
    });
    MessagePlugin.success('操作成功');
    await refresh();
    emit('afterDialogConfirm', result);
    return result;
  }
  if (currentDialogMode.value === 'editForm') {
    const editRow = props.rowOpreations.editRow;
    const result = await request.post({
      url: editRow.url,
      data: editRow.params(tableDialogForm),
    });
    MessagePlugin.success('操作成功');
    await refresh();
    emit('afterDialogConfirm', result);
    return result;
  }
};

defineExpose({
  refresh,
  tableSearchForm,
  tableData,
  selectedRowKeys,
  currentDialogMode,
  tableDialogForm,
});
</script>
