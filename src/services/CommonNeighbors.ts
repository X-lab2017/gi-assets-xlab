import { utils } from '@antv/gi-sdk';
import $i18n from '../i18n';
import { isArray } from '@antv/util';
import { cypherQuery, getStatement } from './util';

export const XlabCommonNeighbors = {
  name: $i18n.get({ id: 'tugraph.src.services.NeighborsQuery.NeighborQuery', dm: 'Xlab 共同邻居' }),
  service: async params => {
    const { ENGINE_USER_TOKEN, CURRENT_SUBGRAPH, engineServerURL } = utils.getServerEngineContext();
    const { ids, top, type } = params;
    const idArr = isArray(ids) ? ids : [ids];

    const cacheMap = {};
    const data = {
      nodes: [] as any,
      edges: [] as any,
    };

    const stm = getStatement(type, idArr, top);
    const graphData = await cypherQuery(engineServerURL, ENGINE_USER_TOKEN, CURRENT_SUBGRAPH, stm);
    const { nodes = [], edges = [] } = graphData;

    nodes.forEach(pathNode => {
      if (!cacheMap[pathNode.id]) {
        const { created_at } = pathNode.properties;
        if (created_at !== undefined) {
          data.nodes.push({
            ...pathNode,
            dapropertiesta: {
              ...pathNode.properties,
              created_at: created_at * 1000,
            },
            created_at: created_at * 1000,
          });
        } else {
          data.nodes.push(pathNode);
        }
        cacheMap[pathNode.id] = true;
      }
    });
    edges.forEach(pathEdge => {
      if (!cacheMap[pathEdge.id]) {
        const { created_at } = pathEdge.properties;
        if (created_at !== undefined) {
          data.edges.push({
            ...pathEdge,
            properties: {
              ...pathEdge.properties,
              created_at: created_at * 1000,
            },
            created_at: created_at * 1000,
          });
        } else {
          data.edges.push(pathEdge);
        }
        cacheMap[pathEdge.id] = true;
      }
    });

    return data;
  },
};
