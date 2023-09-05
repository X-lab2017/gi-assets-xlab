import { utils } from '@antv/gi-sdk';
import request from 'umi-request';
import $i18n from '../i18n';
import { queryEdgeSchema } from './util';

const XlabSchema = {
  name: '图模型',
  service: async params => {
    const { engineServerURL } = utils.getServerEngineContext();

    const result = await request(`${engineServerURL}/api/graph_schema`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'content-type': 'application/json',
      },
      timeout: 50000,
      dataType: 'json',
    });

    if (!result?.schema) {
      return;
    }

    const graphSchema: any = {
      nodes: [],
      edges: [],
    };

    result.schema.forEach((item: any) => {
      const { type } = item;
      if (type === 'VERTEX') {
        graphSchema.nodes.push({
          id: item.label,
          nodeType: item.label,
          nodeTypeKeyFromProperties: 'nodeType',
          ...item,
        });
      } else {
        const [source, target] = item.constraints?.[0] || [];
        if (!source || !target) return;
        graphSchema.edges.push({
          id: item.label,
          edgeType: item.label,
          source,
          target,
          edgeTypeKeyFromProperties: 'edgeType',
          ...item,
        });
      }
    });

    return graphSchema;
  },
};

export { XlabSchema };
