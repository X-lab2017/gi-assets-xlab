import { utils } from '@antv/gi-sdk';
import info from './info';
import $i18n from '../../i18n';

const registerMeta = context => {
  const { services, engineId, GIAC_CONTENT_ITEMS } = context;
  const { options, defaultValue } = utils.getServiceOptionsByEngineId(services, info.services[0], engineId);
  return {
    serviceId: {
      title: $i18n.get({ id: 'basic.components.NeighborsQuery.registerMeta.DataService', dm: '登陆服务' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      default: defaultValue,
      'x-component-props': {
        options: options,
      },
    },
    containers: [
      {
        id: 'GI_CONTAINER_LEFT',
        name: $i18n.get({ id: 'basic.components.SegmentedLayout.registerMeta.SideContainer', dm: '左容器' }),
        required: true,
        GI_CONTAINER: {
          title: $i18n.get({
            id: 'basic.components.SegmentedLayout.registerMeta.IntegratedComponents',
            dm: '集成组件',
          }),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-component-props': {
            mode: 'multiple',
          },
          enum: GIAC_CONTENT_ITEMS,
          default: [],
        },
        width: {
          type: 'number',
          title: $i18n.get({ id: 'basic.components.SegmentedLayout.registerMeta.ContainerWidth', dm: '容器宽度' }),
          'x-component': 'NumberPicker',
          'x-decorator': 'FormItem',
          default: 340,
        },
        offset: {
          title: $i18n.get({ id: 'basic.components.Toolbar.registerMeta.Offset', dm: '偏移量' }),
          type: 'array',
          'x-decorator': 'FormItem',
          'x-component': 'Offset',
          'x-component-props': {
            min: 0,
            max: 400,
          },
          default: [24, 64],
        },
      },
      {
        id: 'GI_CONTAINER_RIGHT',
        name: $i18n.get({ id: 'basic.components.SegmentedLayout.registerMeta.SideContainer', dm: '右容器' }),
        required: true,
        GI_CONTAINER: {
          title: $i18n.get({
            id: 'basic.components.SegmentedLayout.registerMeta.IntegratedComponents',
            dm: '集成组件',
          }),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-component-props': {
            mode: 'multiple',
          },
          enum: GIAC_CONTENT_ITEMS,
          default: [],
        },
        width: {
          type: 'number',
          title: $i18n.get({ id: 'basic.components.SegmentedLayout.registerMeta.ContainerWidth', dm: '容器宽度' }),
          'x-component': 'NumberPicker',
          'x-decorator': 'FormItem',
          default: 400,
        },
        padding: {
          type: 'number',
          title: 'Padding',
          'x-component': 'NumberPicker',
          'x-decorator': 'FormItem',
          default: 12,
        },
      },
      {
        id: 'GI_CONTAINER_BOTTOM',
        name: $i18n.get({ id: 'basic.components.SegmentedLayout.registerMeta.SideContainer', dm: '底部容器' }),
        required: true,
        GI_CONTAINER: {
          title: $i18n.get({
            id: 'basic.components.SegmentedLayout.registerMeta.IntegratedComponents',
            dm: '集成组件',
          }),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-component-props': {
            mode: 'multiple',
          },
          enum: GIAC_CONTENT_ITEMS,
          default: [],
        },
        height: {
          type: 'number',
          title: $i18n.get({ id: 'basic.components.SegmentedLayout.registerMeta.ContainerWidth', dm: '容器高度' }),
          'x-component': 'NumberPicker',
          'x-decorator': 'FormItem',
          default: 230,
        },
        padding: {
          type: 'number',
          title: 'Padding',
          'x-component': 'NumberPicker',
          'x-decorator': 'FormItem',
          default: 12,
        },
      },
    ],
  };
};
export default registerMeta;
