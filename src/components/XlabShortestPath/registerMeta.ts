import { extra, utils } from '@antv/gi-sdk';
import info from './info';
import $i18n from '../../i18n';
const { deepClone, GIAC_CONTENT_METAS } = extra;
const metas = deepClone(GIAC_CONTENT_METAS);
metas.GIAC_CONTENT.properties.GIAC_CONTENT.properties.title.default = info.name;
metas.GIAC_CONTENT.properties.GIAC_CONTENT.properties.icon.default = info.icon;
metas.GIAC_CONTENT.properties.GIAC_CONTENT.properties.containerWidth.default = '400px';

const registerMeta = context => {
  const { services, engineId, schemaData } = context;
  const { options: serviceOptions, defaultValue } = utils.getServiceOptionsByEngineId(
    services,
    info.services[0],
    engineId,
  );
  const { options: shortestPathOptions, defaultValue: shortestPathDefaultValue } = utils.getServiceOptionsByEngineId(
    services,
    info.services[1],
    engineId,
  );
  const { options: queryNodesOptions, defaultValue: queryNodesDefaultValue } = utils.getServiceOptionsByEngineId(
    services,
    info.services[2],
    engineId,
  );

  const nodeProperties = schemaData.nodes.reduce((acc, cur) => {
    return {
      ...acc,
      ...cur.properties,
    };
  }, {});
  const options = Object.keys(nodeProperties)
    .filter(key => nodeProperties[key] === 'string')
    .map(e => ({ value: e, label: e }));

  return {
    searchServiceId: {
      title: $i18n.get({ id: 'gi-assets-xlab.components.Search.registerMeta.SearchService', dm: '搜索服务' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        options: serviceOptions,
      },
      default: defaultValue,
    },
    shortestPathServiceId: {
      title: '最短路径查询服务',
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        options: shortestPathOptions,
      },
      default: shortestPathDefaultValue,
    },
    queryNodesServiceId: {
      title: '节点查询服务',
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        options: queryNodesOptions,
      },
      default: queryNodesDefaultValue,
    },
    pathNodeLabel: {
      title: $i18n.get({ id: 'basic.components.PathAnalysis.registerMeta.TagMapping', dm: '标签映射' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      enum: options,
      default: 'id',
    },
    ...metas,
  };
};

export default registerMeta;
