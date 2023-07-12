import { GIGraphData, utils } from '@antv/gi-sdk';
import $i18n from '../i18n';
const { getServerEngineContext, generatorSchemaByGraphData } = utils;

const GI_SERVICE_INTIAL_GRAPH = {
  name: $i18n.get({ id: 'gi-assets-xlab.src.services.Initializer.InitializeAQuery', dm: '初始化查询' }),
  method: 'GET',
  req: ``,
  res: ``,
  service: async (): Promise<GIGraphData> => {
    const context = getServerEngineContext();
    console.log('context', context);
    const { initialQuery } = context;
    if (initialQuery === '') {
      return {
        nodes: [],
        edges: [],
      };
    }
    return fetch(initialQuery)
      .then(res => {
        return res.json();
      })
      .catch(() => {
        return {
          nodes: [],
          edges: [],
        };
      });
  },
};

const GI_SERVICE_SCHEMA = {
  name: $i18n.get({ id: 'gi-assets-xlab.src.services.Initializer.QueryGraphModel', dm: '查询图模型' }),
  method: 'GET',
  req: ``,
  res: `
`,
  service: async (): Promise<any> => {
    const context = getServerEngineContext();
    const { schemaQuery, initialQuery } = context;
    if (schemaQuery === '') {
      return fetch(initialQuery)
        .then(res => {
          return res.json();
        })
        .then(res => {
          return generatorSchemaByGraphData(res);
        })
        .catch(() => {
          return {
            nodes: [],
            edges: [],
          };
        });
    }
    return fetch(schemaQuery)
      .then(res => {
        return res.json();
      })
      .catch(() => {
        return {
          nodes: [],
          edges: [],
        };
      });
  },
};

export { GI_SERVICE_INTIAL_GRAPH, GI_SERVICE_SCHEMA };
