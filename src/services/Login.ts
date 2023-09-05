import { utils } from '@antv/gi-sdk';
import request from 'umi-request';
import $i18n from '../i18n';

const XlabLogin = {
  name: $i18n.get({ id: 'gi-assets-xlab.src.services.Search.Login', dm: '登陆' }),
  service: async params => {
    const { username, password, engineServerURL } = utils.getServerEngineContext();

    const response = await request(`${engineServerURL}/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        user: username,
        password,
      }),
      timeout: 50000,
      dataType: 'json',
    });

    if (response.jwt) {
      return {
        success: true,
        data: response.jwt,
      };
    }

    return {
      success: false,
      data: '',
    };
  },
};

export { XlabLogin };
