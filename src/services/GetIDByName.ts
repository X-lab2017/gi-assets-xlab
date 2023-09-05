import { utils } from '@antv/gi-sdk';
import request from 'umi-request';
import $i18n from '../i18n';
import { formatContent } from '../components/util';
import { getIDsByNames } from './util';

const XlabGetID = {
  name: $i18n.get({ id: 'gi-assets-xlab.src.services.Search.FuzzySearch', dm: '查询 ID' }),
  service: async params => {
    const { names, isUser } = params;
    const { engineServerURL } = utils.getServerEngineContext();

    const idsMap = await getIDsByNames(engineServerURL, names, isUser);

    return {
      success: true,
      data: { idsMap },
    };
  },
};

export { XlabGetID };
