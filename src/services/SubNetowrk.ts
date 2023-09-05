import { utils } from '@antv/gi-sdk';
import { isArray } from '@antv/util';
import { getIDsByNames, queryNodes } from './util';

export const XlabSubNetwork = {
  name: 'Xlab 子图查询',
  service: async params => {
    const { engineServerURL } = utils.getServerEngineContext();
    const { names, ids: propIds, networkName } = params;
    const beginNameArr = isArray(names) ? names : [names];
    const beginIDArr = isArray(propIds) ? propIds : [propIds];

    const data = {
      nodes: [] as any,
      edges: [] as any,
    };

    const nameWeightMap = {};
    let fectedEdges = [];
    const fechedNodes = {};
    const urls = beginNameArr.map((name, i) => ({
      name,
      id: String(beginIDArr[i]),
      url: `https://oss.x-lab.info/open_digger/github/${name}/${networkName}.json`,
    }));
    await Promise.all(
      urls.map(async ({ id: beginId, url }) => {
        fechedNodes[beginId] = [];
        let fetched;
        try {
          const resp = await fetch(url);
          fetched = await resp.json();
        } catch (e) {
          return fetched;
        }
        if (fetched.ok === false) return;
        fetched.nodes.forEach(([name, weight]) => {
          nameWeightMap[name] = weight;
          fechedNodes[beginId].push(name);
        });
        fectedEdges = fectedEdges.concat(fetched.edges);
        return fetched;
      }),
    );
    if (!Object.keys(nameWeightMap).length) return { nodes: [], edges: [] };
    const isUser = networkName === 'developer_network';
    const idsMap = await getIDsByNames(engineServerURL, Object.keys(nameWeightMap), isUser);
    const ids = Object.values(idsMap);
    const nodesResult = (await queryNodes(engineServerURL, ids)) || [];
    data.nodes = data.nodes.concat(nodesResult);
    if (isUser) {
      data.edges = Object.keys(fechedNodes)
        .map(beginId => {
          return fechedNodes[beginId].map(name => {
            return {
              source: String(idsMap[name]),
              target: String(beginId),
              name: networkName,
              label: networkName,
              edgeType: networkName,
              properties: {},
            };
          });
        })
        .flat();
    } else {
      data.edges = fectedEdges
        .map(edge => {
          // @ts-ignore
          const [sourceName, targetName, weight] = edge;
          const source = idsMap[sourceName];
          const target = idsMap[targetName];
          if (!source || !target) return;
          return {
            source: String(source),
            target: String(target),
            name: networkName,
            label: networkName,
            edgeType: networkName,
            properties: { weight },
          };
        })
        .filter(Boolean);
    }
    return data;
  },
};
