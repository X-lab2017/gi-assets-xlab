import React, { useEffect, useState } from 'react';
import { useContext, utils } from '@antv/gi-sdk';
import { debounce } from '@antv/util';
import { Empty, Divider, Radio, Select, Tabs, Form, Segmented } from 'antd';
import { useMemoizedFn } from 'ahooks';
import $i18n from '../../i18n';
import {
  getMappedSize,
  DETAIL_SCHEMA_TYPES,
  createTransposeIntervalChart,
  renderSchemaDistributionChart,
  getTypeNodeModels,
  getTypeNodes,
} from './util';
import Graphin, { Behaviors, Components } from '@antv/graphin';

const { ClickSelect } = Behaviors;
const { Tooltip: GraphinTooltip } = Components;
const { getSchemaGraph } = utils;

let cachedSchemaCount: any = undefined;

const Overview = props => {
  const { graph, services, data, config } = useContext();
  const {
    models,
    charts,
    chartsReady,
    cachedStateicData,
    overviewRefs,
    containerRefs,
    schemaService,
    countService,
    propertiesService,
    setLoading,
    setChartsReady,
    destroyChart,
  } = props;

  const hasData = data?.nodes?.length;
  const hasRepoNode = getTypeNodeModels(data.nodes, ['github_repo']).length;
  const hasUserNode = getTypeNodeModels(data.nodes, ['github_user']).length;
  const hasRepoUserNode = hasRepoNode || hasUserNode;

  const [rankingType, setRankingType] = useState(hasRepoNode ? 'github_repo' : 'github_user');
  const [distributionType, setDistributionType] = useState('database');
  const [rankingDimension, setRankingDimension] = useState('OpenRank');
  const [schemaData, setSchemaData] = useState<any>();
  const [overviewData, setOverviewData] = useState({ node: {}, edge: {} });
  const [form] = Form.useForm();

  const renderRankingChart = useMemoizedFn(
    debounce(async (timeRange = 'latest') => {
      const startDate = new Date(timeRange[0]);
      const endDate = new Date(timeRange[1]);
      // TODO: 最新时间不确定更新时间

      setLoading(true);
      setRankingDimension(rankingDimension);
      const nodes = getTypeNodes(graph, ['github_repo', 'github_user']).map(node => node.getModel());
      const rankingData: any = {
        github_repo: [],
        github_user: [],
      };
      if (rankingDimension === 'Star' || rankingDimension === 'Commits') {
        const startDateTime = new Date(`${startDate.getFullYear()}-${startDate.getMonth() + 1}`).getTime();
        const endDateTime = new Date(`${endDate.getFullYear()}-${endDate.getMonth() + 2}`).getTime();
        const promises = nodes.map(async node => {
          const { id, name, nodeType } = node;
          const nodeKey = `${name}(${id})`;
          let monthly = {};
          let promise;
          if (cachedStateicData[nodeKey]?.hasOwnProperty(rankingDimension)) {
            if (!cachedStateicData[nodeKey][rankingDimension]) return;
            monthly = cachedStateicData[nodeKey][rankingDimension];
          } else {
            promise = await propertiesService({ id, schemaType: nodeType === 'github_repo' ? 'repo' : 'user' });
            monthly = promise.success ? promise.data[rankingDimension.toLocaleLowerCase()]?.monthly || {} : {};
          }
          cachedStateicData[nodeKey] = cachedStateicData[nodeKey] || {};
          cachedStateicData[nodeKey][rankingDimension] = monthly;
          let ranking = 0;
          Object.keys(monthly).forEach(date => {
            const dateTime = new Date(date).getTime();
            if (timeRange === 'latest') {
              ranking += monthly[date];
              return;
            }
            if (startDateTime <= dateTime && dateTime <= endDateTime) {
              ranking += monthly[date];
            }
          });
          rankingData[nodeType].push({
            key: nodeKey,
            dataId: id,
            name,
            ranking,
          });
          return promise;
        });
        await Promise.all(promises);
      } else {
        const endMonthStr = String(endDate.getMonth());
        const dateKey =
          // @ts-ignore
          timeRange === 'latest' || !isFinite(timeRange[0])
            ? '2023-08'
            : `${endDate.getFullYear()}-${endMonthStr.length < 2 ? 0 : ''}${endMonthStr}`;
        const urls: any = [];
        nodes.forEach(({ id, name, nodeType }) => {
          const nodeKey = `${name}(${id})`;
          if (cachedStateicData[nodeKey]?.hasOwnProperty(rankingDimension)) {
            if (!cachedStateicData[nodeKey][rankingDimension]) return;
            rankingData[nodeType].push({
              key: nodeKey,
              dataId: id,
              name,
              ranking: cachedStateicData[nodeKey][rankingDimension][dateKey],
            });
            return;
          }
          urls.push({
            id,
            name,
            nodeType,
            url: `https://oss.x-lab.info/open_digger/github/${name}/${rankingDimension.toLowerCase()}.json`,
          });
        });
        await Promise.all(
          urls.map(async ({ id, name, nodeType, url }) => {
            const nodeKey = `${name}(${id})`;
            cachedStateicData[nodeKey] = cachedStateicData[nodeKey] || {};
            let rankData;
            try {
              const resp = await fetch(url);
              rankData = await resp.json();
            } catch (e) {
              cachedStateicData[nodeKey][rankingDimension] = {};
              return rankData;
            }
            if (rankData.ok === false) return rankData;
            cachedStateicData[nodeKey][rankingDimension] = rankData;
            if (!rankData) {
              rankingData[nodeType].push({
                key: nodeKey,
                dataId: id,
                name,
                ranking: 0,
              });
            }
            if (rankData[dateKey] !== undefined) {
              rankingData[nodeType].push({
                key: nodeKey,
                dataId: id,
                name,
                ranking: rankData[dateKey],
              });
            }
            return rankData;
          }),
        );
      }

      // map nodes' size
      DETAIL_SCHEMA_TYPES.forEach(nodeType => {
        const sizes = getMappedSize(rankingData[nodeType], 'ranking', 'dataId');
        Object.keys(sizes).forEach(dataId => {
          const node = graph.findById(dataId);
          if (!node) return;
          const { style } = node.getModel();
          const { size: modelSize, oriSize } = node.getModel();
          const size = (sizes[dataId] || oriSize || modelSize) as number;
          if (style?.keyshape.size === size) return;
          graph.updateItem(dataId, {
            size,
            oriSize: oriSize || modelSize || style?.keyshape.size || 30,
            // 兼容 graphin-circle
            style: {
              keyshape: {
                size,
              },
              icon: {
                size: size / 2,
              },
            },
          });
        });
      });

      const chartName = rankingType === 'github_repo' ? 'RepoRanking' : 'UserRanking';
      destroyChart(chartName, containerRefs[chartName]);
      charts[chartName] = createTransposeIntervalChart(
        rankingData[rankingType],
        containerRefs[chartName].current,
        graph,
      );
      setChartsReady(old => {
        return {
          ...old,
          [chartName]: true,
        };
      });
      setLoading(false);
    }, 300),
  );

  const getSchemaDistribution = async callback => {
    if (!countService) return;
    if (cachedSchemaCount) {
      callback(cachedSchemaCount);
      return;
    }
    cachedSchemaCount = await countService();
    callback(cachedSchemaCount);
  };

  const handleTimeChange = ({ timeRange }) => {
    // @ts-ignore
    renderRankingChart(timeRange);
  };

  useEffect(() => {
    if (models?.length || !graph || graph.destroyed) return;
    // @ts-ignore
    renderRankingChart('latest');
  }, [overviewData, models, rankingType, rankingDimension, graph]);

  useEffect(() => {
    if (models?.length) return;
    if (distributionType === 'database') {
      getSchemaDistribution(resultData => {
        ['node', 'edge'].forEach(itemType => {
          destroyChart(`${itemType}Type`, overviewRefs[`${itemType}Type`]);
          const chartData = resultData[itemType].map(({ type, count }) => ({ modelKey: type, count }));
          const chart = renderSchemaDistributionChart(chartData, itemType, overviewRefs, config);
          if (chart) charts[`${itemType}Type`] = chart;
        });
      });
    } else {
      ['node', 'edge'].forEach(itemType => {
        destroyChart(`${itemType}Type`, overviewRefs[`${itemType}Type`]);
        if (!data?.[`${itemType}s`]?.length) return;
        const modelKeyMap = overviewData[itemType];
        const chartData = Object.keys(modelKeyMap).map(modelKey => ({
          modelKey,
          count: modelKeyMap[modelKey].length,
        }));
        const chart = renderSchemaDistributionChart(chartData, itemType, overviewRefs, config);
        if (chart) charts[`${itemType}Type`] = chart;
      });
    }
  }, [distributionType, overviewData, models]);

  // 绘制 schama 概览图
  useEffect(() => {
    if (!schemaService || schemaData) return;
    (async () => {
      const val = await schemaService({});
      if (!val) return;
      const formattedSchema = getSchemaGraph(val, config);
      getSchemaDistribution(counts => {
        const schema = {
          nodes: formattedSchema.nodes.map(node => ({
            ...node,
            style: {
              ...node.style,
              keyshape: {
                ...node.style.keyshape,
                lineWidth: 0,
              },
            },
          })),
          edges: formattedSchema.edges,
        };
        const sizes = getMappedSize(counts.node, 'count', 'type', [12, 48]);
        schema.nodes.forEach(node => {
          node.count = counts.node.find(count => count.type === node.id)?.count || 0;
          const osize = node.style?.keyshape?.size || 20;
          node.size = sizes[node.id] || osize;
          if (node.style?.keyshape) node.style.keyshape.size = node.size;
        });
        schema.edges.forEach(edge => {
          edge.count = counts.edge.find(count => count.type === edge.style?.label?.value)?.count || 0;
        });
        setSchemaData(schema);
      });
    })();
  }, [data]);

  useEffect(() => {
    if (!graph || graph.destroyed) return;
    if (data.nodes.length === 1) {
      setRankingType(data.nodes[0].nodeType === 'github_user' ? 'github_user' : 'github_repo');
    }
    // 更换概览图表
    const nodeTypeMap: any = {};
    const edgeTypeMap: any = {};
    graph.getNodes().forEach((node: any) => {
      const { id, nodeType, name } = node.getModel();
      if (!nodeType) return;
      nodeTypeMap[nodeType] = nodeTypeMap[nodeType] || [];
      nodeTypeMap[nodeType].push({ id, name });
    });
    graph.getEdges().forEach((edge: any) => {
      const { label, id } = edge.getModel();
      if (!label) return;
      edgeTypeMap[label] = edgeTypeMap[label] || [];
      edgeTypeMap[label].push({
        id,
        name: label,
      });
    });

    setOverviewData({
      node: nodeTypeMap,
      edge: edgeTypeMap,
    });
  }, [data, graph]);

  useEffect(() => {
    if (!graph || graph.destroyed) return;
    graph.on('timechange', handleTimeChange);
    return () => {
      graph.off('timechange', handleTimeChange);
    };
  }, [graph]);

  const schemaDOM = (
    <div className="gi-xlab-panel-schema-graph" data-tut="gi_xlab_schema">
      <h4>图模型</h4>
      {/* @ts-ignore */}
      <Graphin
        data={schemaData || { nodes: [], edges: [] }}
        layout={{
          type: 'force2',
        }}
        animate={false}
        fitView={true}
      >
        <ClickSelect disabled />

        <GraphinTooltip bindType="node" placement="top">
          {renderProps => {
            const { model } = renderProps;
            return (
              <div className="gi-xlab-schema-graph-tooltip">
                <p>{`${model.id}`}</p>
                <p>{`数量：${model.count}`}</p>
              </div>
            );
          }}
        </GraphinTooltip>
        <GraphinTooltip bindType="edge" placement="top">
          {renderProps => {
            const { model } = renderProps;
            return (
              <div className="gi-xlab-schema-graph-tooltip">
                <p>{`${model?.style?.label.value || 'edge'}`}</p>
                <p>{`数量: ${model.count}`}</p>
              </div>
            );
          }}
        </GraphinTooltip>
      </Graphin>
    </div>
  );
  return (
    <Form form={form} className="gi-xlab-panel-overview-wrapper">
      {hasData ? (
        <>
          <h3>
            {$i18n.get({
              id: 'gi-assets-xlab.components.XlabPropertiesPanel.Component.CanvasOverview',
              dm: '画布概览',
            })}
          </h3>
          <Divider className="gi-xlab-panel-overview-divider" type="horizontal" />

          <div
            className="gi-xlab-panel-ranking-wrapper"
            style={chartsReady['UserRanking'] || chartsReady['RepoRanking'] ? {} : { visibility: 'hidden', height: 0 }}
            data-tut="gi_xlab_ranking"
          >
            <Form.Item name="rankingDimension" initialValue={'OpenRank'} style={{ marginBottom: '0px' }} label="排序">
              <Select
                size="small"
                onChange={setRankingDimension}
                options={['Star', 'OpenRank', 'Activity', 'Commits'].map(value => ({ label: value, value }))}
              />
            </Form.Item>
            <Form.Item
              className="gi-xlab-panel-ranking-dimension"
              name="rankingType"
              initialValue={hasRepoNode ? 'github_repo' : 'github_user'}
            >
              <Segmented
                size="small"
                block
                // @ts-ignore
                onChange={setRankingType}
                options={[
                  {
                    label: 'Repo',
                    value: 'github_repo',
                    disabled: !hasRepoNode,
                  },
                  {
                    label: 'User',
                    value: 'github_user',
                    disabled: !hasUserNode,
                  },
                ]}
              />
              {/* <Tabs
                size="small"
                onChange={setRankingType}
                centered
                items={[
                  {
                    label: 'Repo',
                    key: 'github_repo',
                    disabled: !hasRepoNode,
                  },
                  {
                    label: 'User',
                    key: 'github_user',
                    disabled: !hasUserNode,
                  },
                ]}
              /> */}
            </Form.Item>
            <div
              className="gi-xlab-panel-overview-chart"
              ref={containerRefs.RepoRanking}
              style={rankingType === 'github_repo' ? {} : { visibility: 'hidden', height: 0 }}
            />
            <div
              className="gi-xlab-panel-overview-chart"
              ref={containerRefs.UserRanking}
              style={rankingType === 'github_user' ? {} : { visibility: 'hidden', height: 0 }}
            />
          </div>
          <Divider className="gi-xlab-panel-overview-divider" type="horizontal" />
          <div data-tut="gi_xlab_distribution">
            <div className="gi-xlab-panel-ranking-distribution-header">
              <Form.Item
                className="gi-xlab-panel-ranking-dimension"
                name="distributionType"
                initialValue="database"
                label="分布"
              >
                <Select
                  size="small"
                  onChange={ele => {
                    setDistributionType(ele.target?.value || 'canvas');
                  }}
                  options={[
                    {
                      label: '画布内',
                      value: 'canvas',
                    },
                    {
                      label: '数据库',
                      value: 'database',
                    },
                  ]}
                />
              </Form.Item>
              <div className="gi-xlab-panel-total-count">
                <div>
                  节点总数：
                  {(distributionType === 'canvas' ? data.nodes?.length : cachedSchemaCount?.nodeTotal) || 0}
                </div>
                <Divider className="gi-xlab-panel-overview-divider" type="vertical" />
                <div>
                  边总数：{(distributionType === 'canvas' ? data.edges?.length : cachedSchemaCount?.edgeTotal) || 0}
                </div>
              </div>
            </div>
            <div
              style={distributionType === 'canvas' && !data.nodes.length ? { visibility: 'hidden', height: 0 } : {}}
              className="gi-xlab-panel-overview-chart"
              ref={overviewRefs.nodeType}
            />
            <div
              style={distributionType === 'canvas' && !data.edges.length ? { visibility: 'hidden', height: 0 } : {}}
              className="gi-xlab-panel-overview-chart"
              ref={overviewRefs.edgeType}
            />
          </div>
          <Divider className="gi-xlab-panel-overview-divider" type="horizontal" />
          {schemaDOM}
        </>
      ) : (
        <>
          {schemaDOM}
          <Empty
            className="gi-xlab-panel-empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={$i18n.get({
              id: 'gi-assets-xlab.components.XlabPropertiesPanel.Component.PleaseRequestDataFirstAnd',
              dm: '请先请求数据，然后单选或按住 shift 框选 Repo、User 节点可查看详情',
            })}
          />
        </>
      )}
    </Form>
  );
};

export default Overview;
