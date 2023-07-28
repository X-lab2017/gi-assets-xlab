import { utils } from '@antv/gi-sdk';
import $i18n from '../i18n';
import { cypherQuery } from './util';

export const XlabCypherQuery = {
  name: $i18n.get({ id: 'neo4j.src.services.CypherQuery.NeoJCypherQuery', dm: 'Neo4j Cypher 查询' }),
  service: async (params = {}) => {
    const { value } = params as any;
    const { CURRENT_SUBGRAPH, ENGINE_USER_TOKEN, engineServerURL } = utils.getServerEngineContext();

    const graphData = await cypherQuery(engineServerURL, ENGINE_USER_TOKEN, CURRENT_SUBGRAPH, value);
    return graphData;
  },
};
