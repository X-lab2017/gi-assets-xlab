import $i18n from '../i18n';
import * as ElementProperties from './ElementProperties';
import * as Search from './Search';
import Server from './Server';
export default {
  id: 'GI',
  type: 'api',
  name: $i18n.get({ id: 'gi-assets-xlab.src.services.XlabService', dm: 'Xlab 服务' }),
  desc: 'Services of xlab x TuGraph',
  cover: 'https://gw.alipayobjects.com/mdn/rms_0d75e8/afts/img/A*3YEZS6qSRgAAAAAAAAAAAAAAARQnAQ',
  component: Server,
  services: {
    ...ElementProperties,
    ...Search,
  },
};
