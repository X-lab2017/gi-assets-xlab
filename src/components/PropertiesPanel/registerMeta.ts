import { extra } from '@antv/gi-sdk';
const { deepClone, GIAC_CONTENT_METAS } = extra;
const metas = deepClone(GIAC_CONTENT_METAS);

const registerMeta = context => {
  return {
    ...metas,
  };
};

export default registerMeta;
