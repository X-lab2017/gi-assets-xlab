import { utils } from '@antv/gi-sdk';
import info from './info';
import $i18n from '../../i18n';

interface Service {
  id: string;
  service: Promise<any>;
}
export default context => {
  const { services, engineId } = context;
  const { options, defaultValue } = utils.getServiceOptionsByEngineId(services, info.services[0], engineId);

  return {
    serviceId: {
      title: $i18n.get({ id: 'basic.components.NeighborsQuery.registerMeta.DataService', dm: '数据服务' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      default: defaultValue,
      'x-component-props': {
        options: options,
      },
    },
    isFocus: {
      title: $i18n.get({
        id: 'basic.components.NeighborsQuery.registerMeta.WhetherToFocusOnThe',
        dm: '是否聚焦到扩散点',
      }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
      default: true,
    },
    limit: {
      title: $i18n.get({ id: 'basic.components.NeighborsQuery.registerMeta.LimitedQuantity', dm: '限制数量' }),
      type: 'number',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      default: 100,
    },
  };
};
