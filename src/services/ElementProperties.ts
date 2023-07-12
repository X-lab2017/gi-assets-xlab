import { utils } from '@antv/gi-sdk';
import request from 'umi-request';
import $i18n from '../i18n';

const XlabPropertiesPanel = {
  name: $i18n.get({ id: 'gi-assets-xlab.src.services.ElementProperties.QueryElementAttributes', dm: '查询元素属性' }),
  service: async params => {
    const { id, schemaType = 'repo' } = params;
    const { HTTP_SERVICE_URL, engineServerURL, ENGINE_USER_TOKEN } = utils.getServerEngineContext();

    const response = await request(`${HTTP_SERVICE_URL}/api/xlab/properties`, {
      method: 'post',
      data: {
        id: [id],
        schemaType,
        engineServerURL,
        Authorization: ENGINE_USER_TOKEN,
      },
    });

    return response;
  },
};

export { XlabPropertiesPanel };
