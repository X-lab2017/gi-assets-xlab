import { extra, utils } from '@antv/gi-sdk';
import info from './info';
import $i18n from '../../i18n';

const PLACEMENT_OPTIONS = [
  {
    value: 'LT',
    label: $i18n.get({ id: 'gi-assets-xlab.components.Search.registerMeta.UpperLeft', dm: '左上' }),
  },
  {
    value: 'RT',
    label: $i18n.get({ id: 'gi-assets-xlab.components.Search.registerMeta.UpperRight', dm: '右上' }),
  },
  {
    value: 'LB',
    label: $i18n.get({ id: 'gi-assets-xlab.components.Search.registerMeta.LowerLeft', dm: '左下' }),
  },
  {
    value: 'RB',
    label: $i18n.get({ id: 'gi-assets-xlab.components.Search.registerMeta.LowerRight', dm: '右下' }),
  },
];

// const { deepClone, GIAC_CONTENT_METAS } = extra;
// const metas = deepClone(GIAC_CONTENT_METAS);

// metas.GIAC_CONTENT.properties.GIAC_CONTENT.properties.title.default = info.name;
// metas.GIAC_CONTENT.properties.GIAC_CONTENT.properties.icon.default = info.icon;

const registerMeta = context => {
  const { services, engineId } = context;
  const { options, defaultValue } = utils.getServiceOptionsByEngineId(services, info.services[0], engineId);
  const { options: queryNodesOptions, defaultValue: queryNodesDefaultValue } = utils.getServiceOptionsByEngineId(
    services,
    info.services[1],
    engineId,
  );
  const { options: commonNeighborOptions, defaultValue: commonNeighborDefaultValue } =
    utils.getServiceOptionsByEngineId(services, info.services[2], engineId);
  const { options: neighborOptions, defaultValue: neighborDefaultValue } = utils.getServiceOptionsByEngineId(
    services,
    info.services[3],
    engineId,
  );
  const { options: getIdOptions, defaultValue: getIdDefaultValue } = utils.getServiceOptionsByEngineId(
    services,
    info.services[4],
    engineId,
  );
  const { options: getSubGraphOptions, defaultValue: GetSubGraphDefaultValue } = utils.getServiceOptionsByEngineId(
    services,
    info.services[5],
    engineId,
  );
  return {
    searchServiceId: {
      title: $i18n.get({ id: 'gi-assets-xlab.components.Search.registerMeta.SearchService', dm: '搜索服务' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        options: options,
      },
      default: defaultValue,
    },
    queryNodesServiceId: {
      title: '批量查询节点服务',
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        options: queryNodesOptions,
      },
      default: queryNodesDefaultValue,
    },
    commonNeighborsServiceId: {
      title: $i18n.get({ id: 'basic.components.NeighborsQuery.registerMeta.DataService', dm: '共同邻居数据服务' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      default: commonNeighborDefaultValue,
      'x-component-props': {
        options: commonNeighborOptions,
      },
    },
    neighborsServiceId: {
      title: $i18n.get({ id: 'basic.components.NeighborsQuery.registerMeta.DataService', dm: '查询邻居服务' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      default: neighborDefaultValue,
      'x-component-props': {
        options: neighborOptions,
      },
    },
    getIdByNameServiceId: {
      title: $i18n.get({ id: 'basic.components.NeighborsQuery.registerMeta.DataService', dm: '查询 ID 服务' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      default: getIdDefaultValue,
      'x-component-props': {
        options: getIdOptions,
      },
    },
    getSubGraphServiceId: {
      title: $i18n.get({ id: 'basic.components.NeighborsQuery.registerMeta.DataService', dm: '查询子图服务' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      default: GetSubGraphDefaultValue,
      'x-component-props': {
        options: getSubGraphOptions,
      },
    },
    placement: {
      title: $i18n.get({ id: 'gi-assets-xlab.components.Search.registerMeta.ComponentLocation', dm: '组件位置' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      enum: PLACEMENT_OPTIONS,
      default: 'RT',
    },
    offset: {
      title: $i18n.get({ id: 'gi-assets-xlab.components.Search.registerMeta.Offset', dm: '偏移量' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Offset',
      'x-component-props': {
        min: 0,
        max: 400,
      },
      default: [16, 18],
    },
    width: {
      title: $i18n.get({ id: 'gi-assets-xlab.components.Search.registerMeta.Width', dm: '宽度' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      default: 'calc(100% - 300px)',
    },
    size: {
      title: $i18n.get({ id: 'gi-assets-xlab.components.Search.registerMeta.Height', dm: '高度' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        options: [
          {
            value: 'small',
            label: $i18n.get({ id: 'gi-assets-xlab.components.Search.registerMeta.Small', dm: '小' }),
          },
          {
            value: 'middle',
            label: $i18n.get({ id: 'gi-assets-xlab.components.Search.registerMeta.Medium', dm: '中' }),
          },
          {
            value: 'large',
            label: $i18n.get({ id: 'gi-assets-xlab.components.Search.registerMeta.Large', dm: '大' }),
          },
        ],
      },
      default: 'large',
    },
  };
};

export default registerMeta;
