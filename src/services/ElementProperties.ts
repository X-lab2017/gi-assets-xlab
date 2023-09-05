import { utils } from '@antv/gi-sdk';
import request from 'umi-request';
import $i18n from '../i18n';

const XlabProperties = {
  name: $i18n.get({ id: 'gi-assets-xlab.src.services.ElementProperties.QueryElementAttributes', dm: '查询元素属性' }),
  service: async params => {
    const { id, schemaType = 'repo' } = params;
    const { engineServerURL, ENGINE_USER_TOKEN } = utils.getServerEngineContext();

    const interfaceName = schemaType === 'repo' ? 'repo_detail' : 'user_detail';
    const response = await request(`${engineServerURL}/api/${interfaceName}?id=${id}`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 50000,
      dataType: 'json',
    });

    if (!response) {
      return {
        success: false,
        code: response.status,
        data: {},
      };
    }

    if (response.created_at !== undefined) {
      response.created_at = response.created_at * 1000;
    }
    if (response.properties?.created_at !== undefined) {
      response.properties.created_at = response.properties.created_at * 1000;
    }

    return {
      data: response,
      code: 200,
      success: true,
    };
  },
};

export { XlabProperties };
