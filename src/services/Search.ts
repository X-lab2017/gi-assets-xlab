import { utils } from '@antv/gi-sdk';
import request from 'umi-request';
import $i18n from '../i18n';

const XlabSearch = {
  name: $i18n.get({ id: 'gi-assets-xlab.src.services.Search.FuzzySearch', dm: '模糊搜索' }),
  service: async params => {
    const { name, isUser } = params;

    const { engineServerURL, ENGINE_USER_TOKEN } = utils.getServerEngineContext();

    const response = await request(`${engineServerURL}/api/${isUser ? 'search_user' : 'search_repo'}?keyword=${name}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'content-type': 'application/json',
      },
      timeout: 50000,
      dataType: 'json',
    });

    if (response) {
      return {
        success: true,
        data: { nodes: response },
      };
    }

    return {
      success: false,
      data: {},
    };
  },
};

export { XlabSearch };
