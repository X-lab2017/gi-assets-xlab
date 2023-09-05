import { utils } from '@antv/gi-sdk';
import info from './info';
import $i18n from '../../i18n';

const registerMeta = context => {
  const { services, engineId } = context;
  const { options, defaultValue } = utils.getServiceOptionsByEngineId(services, info.services[0], engineId);
  const { options: schemaOptions, defaultValue: schemaDefaultValue } = utils.getServiceOptionsByEngineId(
    services,
    info.services[1],
    engineId,
  );
  const { options: cypherOptions, defaultValue: cypherDefaultValue } = utils.getServiceOptionsByEngineId(
    services,
    info.services[2],
    engineId,
  );
  return {
    serviceId: {
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
    schemaServiceId: {
      title: $i18n.get({
        id: 'gi-assets-xlab.components.XlabPropertiesPanel.registerMeta.DataService',
        dm: 'Schema 数据服务',
      }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        options: schemaOptions,
      },
      default: schemaDefaultValue,
    },
    countServiceId: {
      title: $i18n.get({
        id: 'gi-assets-xlab.components.XlabPropertiesPanel.registerMeta.DataService',
        dm: '总数查询服务',
      }),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        options: cypherOptions,
      },
      default: cypherDefaultValue,
    },
  };
};

export default registerMeta;
