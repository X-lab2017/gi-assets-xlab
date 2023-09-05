import { isArray } from '@antv/util';
import request from 'umi-request';
import { formatContent } from '../components/util';

export const getStatement = (queryType, startId, limit) => {
  const formatLimit = limit === 'INFINITY' ? 1000 : limit;
  const idArr = isArray(startId) ? startId : [startId];
  const idArrStr = `[${idArr.join(',')}]`;
  switch (queryType) {
    case 'REPO_NEW_STAR':
      return `MATCH(n)<-[r:star]-(m:github_user) where id(n) =  ${startId} return m, r, r.created_at as created_at ORDER by created_at desc LIMIT ${formatLimit}`;
    case 'REPO_NEW_FORK':
      return `MATCH(n)<-[r:fork]-(m:github_user) where id(n) =  ${startId} return m, r, r.created_at as created_at ORDER by created_at desc LIMIT ${formatLimit}`;

    case 'REPO_NEW_ISSUE':
      return `MATCH(n)<-[r:has_issue]-(m:issue) where id(n) =  ${startId} return m, r, r.created_at as created_at ORDER by created_at desc LIMIT ${formatLimit}`;
    case 'REPO_IS_ORGANIZATION':
      // return `MATCH(n)<-[r:has_repo]-(m:github_organization) where id(n) = ${startId} RETURN m`;
      return `MATCH(n)<-[r:has_repo]-(m:github_organization) where id(n) =  ${startId} return m, r`;
    case 'REPO_LICENSE_TOPIC':
      // return `MATCH(n)-[r:has_topic|use_license]->(m) where id(n) = ${startId} RETURN m`;
      return `MATCH(n)-[r:has_topic|use_license]->(m) where id(n) =  ${startId} return m, r`;
    case 'REPOS_COMMON_STAR':
      if (idArr.length === 2) {
        return `MATCH(n:github_repo)<-[r1:star]-(m:github_user)-[r2:star]->(k:github_repo) where id(n) = ${
          idArr[0]
        } AND id(k) = ${idArr[1]} RETURN m, r1, r2, n, k LIMIT ${formatLimit * (idArr.length - 1)}`;
      }
      return `MATCH(n:github_repo)<-[r1:star]-(m:github_user)-[r2:star]->(k:github_repo) where id(n) in ${idArrStr} AND id(k) in ${idArrStr} RETURN m, r1, r2, n, k LIMIT ${
        formatLimit * (idArr.length - 1)
      }`;

    case 'ORGANIZATION_HAS_REPO':
      // return `MATCH(n)-[r:has_repo]->(m:github_repo) where id(n) = ${startId} RETURN m`;
      return `MATCH(n)-[r:has_repo]->(m:github_repo) where id(n) =  ${startId} return m, r`;

    case 'USER_NEW_STAR':
      // return `MATCH(n)-[r:star]->(m:github_repo) where id(n) = ${startId} with m, r.created_at as created_at ORDER by created_at desc LIMIT ${formatLimit} RETURN m`;
      return `MATCH(n)-[r:star]->(m:github_repo) where id(n) =  ${startId} return m, r, r.created_at as created_at ORDER by created_at desc LIMIT ${formatLimit}`;
    case 'USERS_COMMON_STAR':
      if (idArr.length === 2) {
        return `MATCH(n:github_user)-[r1:star]->(m:github_repo)<-[r2:star]-(k:github_user) where id(n) = ${idArr[0]} AND id(k) = ${idArr[1]} RETURN m, r1, r2, n, k LIMIT ${formatLimit}`;
      }
      return `MATCH(n:github_user)-[r1:star]->(m:github_repo)<-[r2:star]-(k:github_user) where id(n) in ${idArrStr} AND id(k) in ${idArrStr} RETURN m, r1, r2, n, k LIMIT ${formatLimit}`;
    case 'ONE_HOP':
    default:
      return `MATCH(n)-[r]-(m) where id(n) = ${startId} RETURN m, r LIMIT ${formatLimit}`;
  }
};

export const getEdgeStatement = (queryType, startId, targetId) => {
  switch (queryType) {
    case 'REPO_NEW_STAR':
      return `MATCH (n)<-[r:star]-(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;
    case 'REPO_NEW_FORK':
      return `MATCH (n)<-[r:fork]-(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;
    case 'REPO_NEW_ISSUE':
      return `MATCH (n)-[r:has_issue]->(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;
    case 'REPO_IS_ORGANIZATION':
      return `MATCH (n)<-[r:has_repo]-(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;
    case 'REPO_LICENSE_TOPIC':
      return `MATCH (n)-[r:has_topic|use_license]->(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;

    case 'ORGANIZATION_HAS_REPO':
      return `MATCH (n)-[r:has_repo]->(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;

    case 'REPOS_COMMON_STAR':
      return `MATCH (n)<-[r:star]-(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;
    case 'USER_NEW_STAR':
      return `MATCH (n)-[r:star]->(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;

    case 'ONE_HOP':
    default:
      return `MATCH (n)-[r]-(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;
  }
};

export function getNodeIds(params: any): Array<number> {
  let vidIndex: Array<number> = [];
  let nodeIds: Array<number> = [];
  let headers = params.header;
  let result = params.result;
  headers.forEach((item: any, index: number) => {
    if (item.type === 1) {
      vidIndex.push(index);
    }
  });
  result.forEach((item: any) => {
    vidIndex.forEach(c => {
      if (item && item[c]) {
        // let vid = item[c].replace(/(V\[)([0-9]*)(])/g, ($1: string, $2: string, $3: string) => {
        //     return $3
        // })
        let vid = JSON.parse(item[c]).identity;
        if (typeof vid === 'number') {
          nodeIds.push(vid);
        }
      }
    });
  });
  // 可以不用去重
  // nodeIds = [...new Set(nodeIds)]
  return nodeIds;
}

export function getNodeIdsByEids(params: any): {
  nodeIds: Array<number>;
  edgeIds: Array<string>;
  paths: { nodes: number[]; edges: string[] }[];
} {
  const nodeIds: Array<number> = [];
  const edgeIds: Array<string> = [];
  const result = params.result;
  const headers = params.header;
  const edgeIndexList: Array<number> = [];
  const pathIndexList: Array<number> = [];
  const shortestPathIndexList: Array<number> = [];

  headers.forEach((item: any, index: number) => {
    if (item.type === 4) {
      pathIndexList.push(index);
    } else if (item.type === 2) {
      edgeIndexList.push(index);
    } else if (item.type === 0 && item.name === 'relationshipIds') {
      shortestPathIndexList.push(index);
    }
  });
  const paths: { nodes: number[]; edges: string[] }[] = [];
  result.forEach(item => {
    pathIndexList.forEach(c => {
      if (item && item[c]) {
        const data = JSON.parse(item[c]);
        data.forEach((el: any, index: number) => {
          if (index % 2 === 1) {
            const eid = `${el.src}_${el.dst}_${el.label_id}_${el.temporal_id}_${el.identity}`;
            edgeIds.push(eid);
            nodeIds.push(parseInt(el.src), parseInt(el.dst));
          }
        });
      }
    });
    edgeIndexList.forEach(c => {
      if (item && item[c]) {
        let data = JSON.parse(item[c]);
        let eid = `${data.src}_${data.dst}_${data.label_id}_${data.temporal_id}_${data.identity}`;
        edgeIds.push(eid);
        nodeIds.push(parseInt(data.src), parseInt(data.dst));
      }
    });
    shortestPathIndexList.forEach(c => {
      if (item && item[c]) {
        const data = JSON.parse(item[c].replace('[', '["').replaceAll(',', '","').replace(']', '"]'));
        const pathEdgeIds: string[] = [];
        const pathNodeIds: number[] = [];
        data.forEach((eid: any) => {
          pathEdgeIds.push(eid);
          edgeIds.push(eid);
          const [source, target] = eid.split('_');
          pathNodeIds.push(parseInt(source), parseInt(target));
          nodeIds.push(parseInt(source), parseInt(target));
        });
        paths.push({
          nodes: [...new Set(pathNodeIds)],
          edges: [...new Set(pathEdgeIds)],
        });
      }
    });
  });

  return {
    nodeIds: [...new Set(nodeIds)],
    edgeIds: [...new Set(edgeIds)],
    paths,
  };
}

export async function cypherQuery(serverUrl, token, subgraph, statement) {
  const response = await request(`${serverUrl}/cypher`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'content-type': 'application/json',
      Authorization: token,
    },
    // @ts-ignore
    body: JSON.stringify({
      graph: subgraph,
      script: statement,
    }),
    timeout: 50000,
    dataType: 'json',
  });

  if (!response.result) {
    return response.data as any;
  }

  // 如果返回有Eid,就使用Eid组装nodeIds
  const { nodeIds: nodeIdsFromEdges, edgeIds, paths } = getNodeIdsByEids(response);
  const nodeIds = [...new Set([...nodeIdsFromEdges, ...getNodeIds(response)])];

  // 拿到节点 ID 后，查询子图

  if (nodeIds.length === 0) {
    return {
      nodes: [],
      edges: [],
    };
  }

  const subGraphResponse = await request(`${serverUrl}/cypher`, {
    headers: {
      Accept: 'application/json',
      'content-type': 'application/json',
      Authorization: token,
    },
    method: 'POST',
    // @ts-ignore
    body: JSON.stringify({
      graph: subgraph,
      script: `call db.subgraph([${nodeIds}])`,
    }),
    timeout: 50000,
    dataType: 'json',
  });

  const subgraphData = JSON.parse(subGraphResponse.result[0]);

  const subGraphEdges: any = [];
  subgraphData.relationships.forEach(item => {
    const id = `${item.src}_${item.dst}_${item.label_id}_${item.temporal_id}_${item.identity}`;
    if (!edgeIds.includes(id)) return;
    const edge = {
      id,
      ...item,
      source: String(item.src),
      target: String(item.dst),
      edgeType: item.label,
    };
    const { created_at } = item.properties || {};
    if (created_at !== undefined) edge.properties.created_at *= 1000;
    subGraphEdges.push(edge);
  });

  const graphData = {
    nodes: subgraphData.nodes.map(node => {
      const { identity, label, nodeType, ...others } = node;
      const newNode = {
        ...others.properties,
        ...others,
        label,
        nodeType: label,
        id: String(identity),
      };
      const { name } = others.properties;
      if (label === 'github_user') {
        newNode.avatar = `https://avatars.githubusercontent.com/${name}`;
      } else if (label === 'github_repo') {
        newNode.avatar = `https://avatars.githubusercontent.com/${identity}`;
      }
      return newNode;
    }),
    edges: subGraphEdges,
    paths,
  };
  return graphData;
}

export async function queryNodes(engineServerURL, ids) {
  const response = await request(`${engineServerURL}/cypher/get_vertexes?ids=[${ids}]`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'content-type': 'application/json',
    },
    timeout: 50000,
    dataType: 'json',
  });
  const res = response.map(res => {
    const { identity, label, ...others } = res[0];
    const { name } = others.properties;
    const node = {
      ...others,
      label,
      nodeType: label,
      id: String(identity),
      name,
    };
    if (label === 'github_user') {
      node.avatar = `https://avatars.githubusercontent.com/${name}`;
    } else if (label === 'github_repo') {
      node.avatar = `https://avatars.githubusercontent.com/${identity}`;
    }
    return node;
  });
  return res;
}

export async function getIDsByNames(serverUrl, names, isUser) {
  const response = await request(`${serverUrl}/api/get_vid`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      name: names,
      is_user: isUser,
    }),
    timeout: 50000,
    dataType: 'json',
  });

  return response || {};
}

export const refreshToken = async (engineServerURL, authorization) => {
  const result = await request(`${engineServerURL}/refresh`, {
    headers: {
      'content-type': 'application/json',
      Authorization: authorization,
    },
    method: 'POST',
    timeout: 50000,
    dataType: 'json',
  });

  if (!result.jwt) {
    return {
      success: false,
      data: result.jwt,
    };
  }
  return {
    data: result.jwt,
    success: true,
  };
};

export const queryEdgeSchema = async (engineServerURL, edgeType: string, graphName: string, authorization: string) => {
  const result = await request(`${engineServerURL}/cypher`, {
    headers: {
      'content-type': 'application/json',
      Authorization: authorization,
    },
    method: 'POST',
    body: JSON.stringify({
      graph: graphName,
      script: `CALL db.getEdgeSchema('${edgeType}')`,
    }),
    timeout: 50000,
    dataType: 'json',
  });

  if (!result?.result) {
    return;
  }

  const edgeSchema = result.result;
  const { constraints, label, properties } = JSON.parse(edgeSchema[0][0]);
  if (constraints.length === 0) {
    // 忽略这条信息
    return null;
  }
  const [source, target] = constraints[0];

  const propertiesObj = {} as any;
  for (const p of properties) {
    propertiesObj[p.name] = p.type === 'STRING' ? 'string' : 'number';
  }

  return {
    sourceNodeType: source,
    targetNodeType: target,
    edgeTypeKeyFromProperties: 'edgeType',
    edgeType: label,
    label,
    properties: propertiesObj,
  };
};
