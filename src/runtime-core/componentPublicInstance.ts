interface mapType {
  [key: string]: (instance: any) => any;
}

const map: mapType = {
  $el: (i: any) => i.vnode.el,
  $slots: (i: any) => i.slots,
};

export const PublicInstanceProxyHandle = {
  get({ _: instance }: any, key: any) {
    const mapObject = map[key];
    if (mapObject) {
      return mapObject(instance);
    }
    //这块不能用 || ,因为考虑到有0的情况,所以要使用空值运算符 ??，特殊的情况做特殊处理
    return instance.setupState?.[key] ?? instance.props?.[key];
  },
};
