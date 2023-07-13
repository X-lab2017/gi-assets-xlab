import { extra, utils } from '@antv/gi-sdk';
import info from './info';
// import $i18n from '../../i18n';

// const { deepClone, GIAC_CONTENT_METAS } = extra;
// const metas = deepClone(GIAC_CONTENT_METAS);
import $i18n from '../../i18n';
const registerMeta = context => {
  const { services, engineId } = context;
  const { options, defaultValue } = utils.getServiceOptionsByEngineId(services, info.services[0], engineId);
  return {
    serviceId: {
      // title: $i18n.get({ id: 'basic.components.PropertiesPanel.registerMeta.DataService', dm: '数据服务' }),
      title: $i18n.get({
        id: 'gi-assets-xlab.components.XlabPropertiesPanel.registerMeta.DataService',
        dm: '数据服务',
      }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        options: options,
      },
      default: defaultValue,
    },
    width: {
      title: $i18n.get({ id: 'gi-assets-xlab.components.XlabPropertiesPanel.registerMeta.Width', dm: '宽度' }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      default: '400px',
    },
    // ...metas,
  };
};

export default registerMeta;
