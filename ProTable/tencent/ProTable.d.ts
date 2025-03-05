import { Column } from './Column';

export interface ProTableProps {
  columns?: Column[] | undefined | any;
  dataSource?: any[] | ((params: GetTableData) => Promise<DataSource>);
  rowOpreations?: {
    width?: number;
    deleteRow?: {
      url?: string;
      params?: Function;
      afterDelete?: Function;
    };
    editRow?: {
      url?: string;
      params?: Function;
    };
    addRow?: {
      url?: string;
      params?: Function;
    };
    export?: boolean | string;
    import?:
      | {
          handleImport: () => void;
        }
      | boolean
      | string;
  };
  dialogRules?: any;
  dialogWidth?: number;
  pagination?: any;
  hideOperation?: boolean;
  hidePagination?: boolean;
  noDialogPadding?: boolean;
  curdFormClass?: string; // curd 弹窗的class
  onEditRow?: Function;
  rowKey?: string;
  firstInit?: boolean;
  defaultIndex?: string[];
}

interface GetTableData {
  size: number;
  page: number;
  params?: any;
}
interface DataSource {
  list: Array<any>;
  total: number;
  page: number;
  size: number;
}
