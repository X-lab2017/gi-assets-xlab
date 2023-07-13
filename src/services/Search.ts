import { utils } from '@antv/gi-sdk';
import request from 'umi-request';
import $i18n from '../i18n';

const XlabSearch = {
  name: $i18n.get({ id: 'gi-assets-xlab.src.services.Search.FuzzySearch', dm: '模糊搜索' }),
  service: async params => {
    const { name, isUser } = params;
    const { HTTP_SERVICE_URL, engineServerURL, ENGINE_USER_TOKEN } = utils.getServerEngineContext();

    const response = await request(`${HTTP_SERVICE_URL}/api/xlab/fuzzy`, {
      method: 'post',
      data: {
        name,
        isUser,
        engineServerURL,
        Authorization: ENGINE_USER_TOKEN,
      },
    });

    return response;
  },
};

export { XlabSearch };
