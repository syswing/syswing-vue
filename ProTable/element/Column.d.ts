export type Column = {
  // 列标题
  title:string,
  // 列数据字段
  dataIndex:string,
  // 列数据类型
  dataType:string,
  // 对齐方式 left center
  alian?:'left'|'center',
  // 字段是否用于编辑
  edit?:boolean, 
  // 字段是否用于查询
  query?:boolean,
  // 字段是否用于新增
  add?:boolean,
  // 字段列是否隐藏
  hideInColumn?:boolean,
  // 字段字典映射
  dic?:Array<any>,
}
