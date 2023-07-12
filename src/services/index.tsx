import * as ElementProperties from './ElementProperties';
import * as Search from './Search';
import Server from './Server';
import $i18n from '../i18n';
export default {
  id: 'XlabServer',
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
