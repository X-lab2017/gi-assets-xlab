import { utils } from '@antv/gi-sdk';
import $i18n from '../i18n';
import request from 'umi-request';

export const XlabShortestPath = {
  name: '最短路径服务',
  service: async (params: { id1: string; id2: string; length: number }) => {
    // const { isDetail = true } = params as any;
    const { engineServerURL } = utils.getServerEngineContext();
    const { id1, id2, length } = params;
    // engineServerURL
    const url = length
      ? `${engineServerURL}/api/all_simple_path?id1=${id1}&id2=${id2}&max_hop=${length}&limit=10`
      : `${engineServerURL}/procedure/all_shortest_paths?id1=${id1}&id2=${id2}`;
    const response = await request(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'content-type': 'application/json',
      },
      timeout: 50000,
      dataType: 'json',
    });

    const data: any = {
      nodes: [],
      edges: [],
      paths: [],
    };
    if (!response) return data;
    response.forEach(group => {
      const path: any = {
        nodes: [],
        edges: [],
      };
      group.forEach(item => {
        const { identity, src, dst, label, ...rest } = item;
        if (src && dst) {
          const spo = `${src}-${label}-${dst}`;
          const edge = {
            id: spo,
            source: String(src),
            target: String(dst),
            label,
            edgeType: label,
            ...rest,
          };
          if (edge.properties?.created_at) {
            edge.properties.created_at *= 1000;
          }
          data.edges.push(edge);
          path.edges.push(edge.id);
        } else {
          const node = {
            id: String(identity),
            label,
            nodeType: label,
            name: rest.properties?.name,
            ...rest,
          };
          data.nodes.push(node);
          path.nodes.push(node.id);
        }
      });
      data.paths.push(path);
    });

    return data;
  },
};
