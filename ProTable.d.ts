import { Column } from "./Column";

export interface ProTableProps {
  columns: Column[];
  dataSource: any[];
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
}

