import $i18n from '../i18n';
import * as ElementProperties from './ElementProperties';
import * as NeighborsQuery from './NeighborsQuery';
import * as CommonNeighbors from './CommonNeighbors';
import * as Search from './Search';
import * as CypherQuery from './CypherQuery';
import * as Login from './Login';
import * as getIDByName from './GetIDByName';
import * as SubNetwork from './SubNetowrk';
import * as QuerySchema from './Schema';
import * as CountQuery from './CountQuery';
import * as QueryNodes from './QueryNodes';
import * as ShortestPath from './shortestPath';
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
    ...NeighborsQuery,
    ...CommonNeighbors,
    ...Search,
    ...CypherQuery,
    ...Login,
    ...getIDByName,
    ...SubNetwork,
    ...QuerySchema,
    ...CountQuery,
    ...QueryNodes,
    ...ShortestPath,
  },
};
