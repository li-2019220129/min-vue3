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
    return instance.setupState?.[key] ?? instance.props?.[key];
  },
};
