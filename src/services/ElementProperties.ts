import { utils } from '@antv/gi-sdk';
import request from 'umi-request';
import $i18n from '../i18n';

const XlabPropertiesPanel = {
  name: $i18n.get({ id: 'gi-assets-xlab.src.services.ElementProperties.QueryElementAttributes', dm: '查询元素属性' }),
  service: async params => {
    const { id, schemaType = 'repo' } = params;
    const { engineServerURL, ENGINE_USER_TOKEN } = utils.getServerEngineContext();

    const interfaceName = schemaType === 'repo' ? 'repo_detail' : 'user_detail';
    const response = await request(`${engineServerURL}/db/default/xlab/${interfaceName}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: ENGINE_USER_TOKEN,
      },
      body: `{"data": "{\\"id\\": [${id}]}"}`,
      timeout: 50000,
      dataType: 'json',
    });

    if (!response.result) {
      return {
        success: false,
        code: response.status,
        data: {},
      };
    }
    const data = JSON.parse(response.result);
    const detail = Object.values(data)[0] as any;
    if (!data || !detail) {
      return {
        success: false,
        code: response.status,
        data: {},
      };
    }

    if (detail.created_at !== undefined) {
      detail.created_at = data.created_at * 1000;
    }
    if (detail.properties?.created_at !== undefined) {
      detail.properties.created_at = detail.properties.created_at * 1000;
    }

    return {
      data: detail,
      code: 200,
      success: true,
    };
  },
};

export { XlabPropertiesPanel };
