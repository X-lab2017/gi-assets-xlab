import { utils } from '@antv/gi-sdk';
import request from 'umi-request';
import $i18n from '../i18n';
import { queryNodes } from './util';

const XlabQueryNodes = {
  name: $i18n.get({ id: 'gi-assets-xlab.src.services.Search.FuzzySearch', dm: '批量查询节点' }),
  service: async params => {
    const { ids } = params;
    if (!ids?.length) return [];

    const { engineServerURL, ENGINE_USER_TOKEN } = utils.getServerEngineContext();

    const response = await queryNodes(engineServerURL, ids);
    return response;
  },
};

export { XlabQueryNodes };
