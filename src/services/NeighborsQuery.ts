import { utils } from '@antv/gi-sdk';
import request from 'umi-request';
import $i18n from '../i18n';
import { isArray } from '@antv/util';
import { cypherQuery, getEdgeStatement, getStatement, queryNodes } from './util';

export const XlabNeighborsQuery = {
  name: $i18n.get({ id: 'tugraph.src.services.NeighborsQuery.NeighborQuery', dm: 'Xlab 邻居查询' }),
  service: async params => {
    const { engineServerURL } = utils.getServerEngineContext();
    const { ids, top, type } = params;
    const idArr = isArray(ids) ? ids : [ids];
    const apiName = getAPI(type);

    const cacheMap = {};
    const data = {
      nodes: [] as any,
      edges: [] as any,
    };
    const nodeIds = new Set();
    const edgeInfos: any = [];
    const promises: Promise<any>[] = idArr.map(async id => {
      const response = await request(`${engineServerURL}/cypher/${apiName}?id=${id}&limit=${top}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'content-type': 'application/json',
        },
        timeout: 50000,
        dataType: 'json',
      });

      if (response) {
        response.forEach(([node, edge]) => {
          nodeIds.add(String(node.identity));
          edgeInfos.push(edge);
        });
      }
      return response;
    });
    await Promise.all(promises);

    if (!nodeIds.size) return;

    data.nodes = await queryNodes(engineServerURL, Array.from(nodeIds));
    if (!data.nodes?.length) return data;

    const edgePromises = edgeInfos.map(async (edge: any) => {
      const { dst, identity, src, ...rest } = edge;
      const subgraph = await request(`${engineServerURL}/procedure/sub_graph?ids=[${src}, ${dst}]`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'content-type': 'application/json',
        },
        timeout: 50000,
        dataType: 'json',
      });
      if (subgraph[0]?.[0]) {
        const { relationships } = subgraph[0][0];
        const { properties = {}, label } = relationships[0];
        const edge = {
          id: `${src}-${label}-${dst}`,
          source: String(src),
          target: String(dst),
          label,
          edgeType: label,
          properties,
        };
        if (properties.created_at) edge.properties.created_at *= 1000;
        data.edges.push(edge);
      }
      return subgraph;
    });
    await Promise.all(edgePromises);

    return data;
  },
};

const getAPI = type => {
  switch (type) {
    case 'REPO_NEW_STAR':
      return 'repo_latest_star';
    case 'REPO_NEW_FORK':
      return 'repo_latest_fork';

    case 'REPO_NEW_ISSUE':
      return 'repo_latest_issue';
    case 'REPO_IS_ORGANIZATION':
      return 'repo_organization';
    case 'REPO_LICENSE_TOPIC':
      return 'repo_license_topic';

    case 'ORGANIZATION_HAS_REPO':
      return 'organization_repo';

    case 'USER_NEW_STAR':
      return 'user_latest_star';
    case 'ONE_HOP':
    default:
      return 'one_hop';
  }
};
