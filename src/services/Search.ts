import { utils } from '@antv/gi-sdk';
import request from 'umi-request';
import $i18n from '../i18n';

const XlabSearch = {
  name: $i18n.get({ id: 'gi-assets-xlab.src.services.Search.FuzzySearch', dm: '模糊搜索' }),
  service: async params => {
    const { name, isUser } = params;

    const { engineServerURL, ENGINE_USER_TOKEN } = utils.getServerEngineContext();

    const response = await request(`${engineServerURL}/db/default/xlab/fuzzy_query`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'content-type': 'application/json',
        Authorization: ENGINE_USER_TOKEN,
      },
      body: `{"data": "{\\"name\\": \\"${name}\\", \\"is_user\\": ${isUser}}"}`,
      timeout: 50000,
      dataType: 'json',
    });

    if (response.result) {
      return {
        success: true,
        data: { nodes: JSON.parse(response.result) },
      };
    }

    return {
      success: false,
      data: {},
    };
  },
};

export { XlabSearch };
