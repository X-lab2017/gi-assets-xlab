import { utils } from '@antv/gi-sdk';
import request from 'umi-request';
import $i18n from '../i18n';
import { isArray } from '@antv/util';
import { getEdgeStatement, getStatement } from './util';

export const XlabNeighborsQuery = {
  name: $i18n.get({ id: 'tugraph.src.services.NeighborsQuery.NeighborQuery', dm: 'Xlab 邻居查询' }),
  service: async params => {
    const { ENGINE_USER_TOKEN, HTTP_SERVICE_URL, CURRENT_SUBGRAPH } = utils.getServerEngineContext();
    const { ids, top, type } = params;
    const idArr = isArray(ids) ? ids : [ids];

    const cacheMap = {};
    const data = {
      nodes: [] as any,
      edges: [] as any,
    };
    const promises: Promise<any>[] = idArr.map(async id => {
      const stm = getStatement(type, id, top);
      const res = await request(`${HTTP_SERVICE_URL}/api/tugraph/languagequery`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          Authorization: ENGINE_USER_TOKEN,
        },
        data: {
          value: stm,
          graphName: CURRENT_SUBGRAPH,
        },
      });

      // find the edge between each node in nodes and node with id
      const { nodes = [], edges = [] } = res.data;
      if (edges.length) {
        nodes.forEach(pathNode => {
          if (!cacheMap[pathNode.id]) {
            data.nodes.push(pathNode);
            cacheMap[pathNode.id] = pathNode;
          }
        });
        edges.forEach(pathEdge => {
          if (!cacheMap[pathEdge.id]) {
            data.edges.push(pathEdge);
            cacheMap[pathEdge.id] = pathEdge;
          }
        });
      } else {
        const pathPromises: Promise<any>[] = nodes?.map(async node => {
          const edgeStm = getEdgeStatement(type, id, node.id);
          const pathRes = await request(`${HTTP_SERVICE_URL}/api/tugraph/languagequery`, {
            method: 'post',
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
              Authorization: ENGINE_USER_TOKEN,
            },
            data: {
              value: edgeStm,
              graphName: CURRENT_SUBGRAPH,
            },
          });
          const { nodes: pathNodes = [], edges: pathEdges = [] } = pathRes.data;
          pathNodes.forEach(pathNode => {
            if (!cacheMap[pathNode.id]) {
              const { created_at } = pathNode.properties || {};
              if (created_at !== undefined) {
                data.nodes.push({
                  ...pathNode,
                  properties: {
                    ...pathNode.properties,
                    created_at: created_at * 1000,
                  },
                  created_at: created_at * 1000,
                });
              } else {
                data.nodes.push(pathNode);
              }
              cacheMap[pathNode.id] = pathNode;
            }
          });
          pathEdges.forEach(pathEdge => {
            if (!cacheMap[pathEdge.id]) {
              const { created_at } = pathEdge.properties || {};
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
              cacheMap[pathEdge.id] = pathEdge;
            }
          });
          return pathRes;
        });

        await Promise.all(pathPromises);
      }
      return res;
    });

    await Promise.all(promises);
    return data;
  },
};