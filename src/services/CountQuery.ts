import { utils } from '@antv/gi-sdk';
import $i18n from '../i18n';
import request from 'umi-request';

export const XlabCountQuery = {
  name: $i18n.get({ id: 'neo4j.src.services.CypherQuery.NeoJCypherQuery', dm: 'Neo4j Cypher 查询' }),
  service: async (params = {}) => {
    // const { isDetail = true } = params as any;
    const { engineServerURL } = utils.getServerEngineContext();
    // engineServerURL
    const response = await request(`http://osgraph.tugraph.com.cn/procedure/count_detail`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'content-type': 'application/json',
      },
      timeout: 50000,
      dataType: 'json',
    });

    const schemaCounts: any = {
      node: [],
      edge: [],
      nodeTotal: 0,
      edgeTotal: 0,
    };
    if (!response?.length) return schemaCounts;
    response.forEach(([isNode, schemaType, count]) => {
      schemaCounts[isNode ? 'node' : 'edge'].push({ type: schemaType, count });
      schemaCounts[isNode ? 'nodeTotal' : 'edgeTotal'] += count;
    });
    return schemaCounts;
  },
};
