export const isBlob = (val: any): val is Blob => {
  return Object.prototype.toString.call(val) === '[object Blob]';
};

export const dict2Map = (dict: any) => {
  return dict.reduce((acc: any, curr: any) => {
    acc[curr.value] = curr.label;
    return acc;
  }, {});
};
