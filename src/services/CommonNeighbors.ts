import { utils } from '@antv/gi-sdk';
import $i18n from '../i18n';
import request from 'umi-request';
import { isArray } from '@antv/util';

const EdgeTypeMap = {
  REPOS_COMMON_STAR: 'star',
  USERS_COMMON_STAR: 'star',
  REPOS_COMMON_ORG: 'has_repo',
  REPOS_COMMON_LICENSE: 'use_license',
  REPOS_COMMON_LANGUAGE: 'use_lang',
  REPOS_COMMON_TOPIC: 'has_topic',
  USERS_COMMON_PR: 'comment_pr',
  USERS_COMMON_ISSUE: 'comment_issue',
};

export const XlabCommonNeighbors = {
  name: $i18n.get({ id: 'tugraph.src.services.NeighborsQuery.NeighborQuery', dm: 'Xlab 共同邻居' }),
  service: async params => {
    const { engineServerURL } = utils.getServerEngineContext();
    const { ids, top, type } = params;
    const idArr = isArray(ids) ? ids : [ids];
    const typeArr = isArray(type) ? type : [type];

    const cacheMap = {};
    const data = {
      nodes: [] as any,
      edges: [] as any,
    };

    const response = await request(`${engineServerURL}/api/common_neighbor`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'content-type': 'application/json',
      },
      // @ts-ignore
      body: JSON.stringify({
        ids: idArr.map(id => Number(id)),
        edge_type: typeArr.map(type => EdgeTypeMap[type]),
        limit: Number(top),
      }),
      timeout: 50000,
      dataType: 'json',
    });

    if (!response?.length) return data;
    response.forEach(group => {
      group.forEach(item => {
        const { identity, label, dst, src, ...rest } = item;
        if (dst && src) {
          const spo = `${src}-${label}-${dst}`;
          if (cacheMap[spo]) return;
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
          cacheMap[spo] = true;
        } else {
          const nodeId = String(identity);
          if (cacheMap[nodeId]) return;
          const node = {
            id: nodeId,
            label,
            nodeType: label,
            name: rest.properties?.name,
            ...rest,
          };
          if (label === 'github_user') {
            node.avatar = `https://avatars.githubusercontent.com/${name}`;
          } else if (label === 'github_repo') {
            node.avatar = `https://avatars.githubusercontent.com/${identity}`;
          }
          data.nodes.push(node);
          cacheMap[nodeId] = true;
        }
      });
    });

    return data;
  },
};
