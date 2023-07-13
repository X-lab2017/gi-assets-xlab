import registerMeta from './registerMeta';
import registerShape from './registerShape';
import registerTransform from './registerTransform';
import $i18n from '../../i18n';

/**   index.md 中解析得到默认值，也可用户手动修改 */
const info = {
  id: 'ClusterNode',
  name: $i18n.get({ id: 'gi-assets-xlab.elements.ClusterNode.ClusterNode', dm: '集群节点' }),
  category: 'node',
  desc: $i18n.get({
    id: 'gi-assets-xlab.elements.ClusterNode.DonutComponentForDataDistribution',
    dm: '甜甜圈组件，用于数据有分布的情况',
  }),
  cover: 'http://xxxx.jpg',
};

export default {
  info,
  registerShape,
  registerMeta,
  registerTransform,
};
