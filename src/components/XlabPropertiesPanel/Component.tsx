import { useContext, utils } from '@antv/gi-sdk';
import { useMemoizedFn } from 'ahooks';
import { Chart } from '@antv/g2';
import { LoadingOutlined } from '@ant-design/icons';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Empty, Divider, Tooltip, message, Radio, Select, Form } from 'antd';
import $i18n from '../../i18n';
import './index.less';
import { COLORS, createChart, createTransposeIntervalChart, getTypeNodeModels, getTypeNodes } from './util';

const charts: { [key: string]: Chart | undefined } = {
  fork: undefined,
  issue: undefined,
  pr: undefined,
  star: undefined,
  nodeType: undefined,
  edgeType: undefined,
};

const cachedStateicData = {};

const XlabPropertiesPanel = props => {
  const { serviceId } = props;
  const { graph, services, data, config, HAS_GRAPH } = useContext();
  const service = utils.getService(services, serviceId);
  if (!service) return null;
  const [form] = Form.useForm();

  const [models, setModels] = useState([] as any);
  const [totals, setTotals] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);
  const [colorMap, setColorMap] = useState({});
  const [overviewData, setOverviewData] = useState({ node: {}, edge: {} });
  const [rankingType, setRankingType] = useState('github_repo');
  const [rankingDimension, setRankingDimension] = useState('Star');

  const containerRefs = {
    Fork: useRef<HTMLDivElement>(null),
    Issue: useRef<HTMLDivElement>(null),
    PR: useRef<HTMLDivElement>(null),
    Star: useRef<HTMLDivElement>(null),
    Code: useRef<HTMLDivElement>(null),
    Comments: useRef<HTMLDivElement>(null),
    Commits: useRef<HTMLDivElement>(null),
    OpenRank: useRef<HTMLDivElement>(null),
    Activity: useRef<HTMLDivElement>(null),
    Ranking: useRef<HTMLDivElement>(null),
  };
  const overviewRefs = {
    nodeType: useRef<HTMLDivElement>(null),
    edgeType: useRef<HTMLDivElement>(null),
    OpenRank: useRef<HTMLDivElement>(null),
    Activity: useRef<HTMLDivElement>(null),
  };

  const DETAIL_SCHEMA_TYPES = ['github_repo', 'github_user'];
  const DETAIL_FIELDS = {
    Fork: ['fork'],
    Issue: ['closed_issue', 'opened_issue'],
    PR: ['merged_pr', 'opened_pr'],
    Star: ['star'],
    Code: ['code_additions', 'code_changed_files', 'code_deletions'],
    Comments: ['comments'],
    Commits: ['commits'],
  };

  const STATIC_FIELD = {
    OpenRank: 'openrank',
    Activity: 'activity',
  };

  useEffect(() => {
    if (!graph || graph.destroyed) return;
    graph.on('canvas:click', handleCanvasClick);
    graph.on('nodeselectchange', handleNodeSelect);
    return () => {
      graph.off('canvas:click', handleCanvasClick);
      graph.off('canvas:click', handleCanvasClick);
    };
  }, [graph]);

  useEffect(() => {
    const repoUserModels = getTypeNodeModels(models, DETAIL_SCHEMA_TYPES);
    if (!repoUserModels.length) return;

    (async () => {
      setLoading(true);
      const chartDatas = {
        Fork: [],
        Issue: [],
        PR: [],
        Star: [],
        Code: [],
        Commits: [],
        Comments: [],
      };
      const dotColorMap = {};
      const orderTypes: string[] = [];
      const singleNode = repoUserModels.length === 1;

      const promises: Promise<any>[] = repoUserModels.map(async (model, i) => {
        const { id, name, nodeType } = model;
        dotColorMap[id] = COLORS[i % COLORS.length];
        orderTypes.push(`${name}(${id})`);
        const val = await service({ id, nodeType: nodeType === 'github_repo' ? 'repo' : 'user' });
        if (val.success) {
          const value = val.data;
          const totalMap = {};
          Object.keys(DETAIL_FIELDS).forEach(fieldName => {
            const fields = DETAIL_FIELDS[fieldName];
            totalMap[fieldName] = totalMap[fieldName] || 0;
            fields.forEach(key => {
              if (!value[key]) return;
              const { monthly, total = 0 } = value[key];
              totalMap[fieldName] += total;
              if (monthly) {
                chartDatas[fieldName] = chartDatas[fieldName].concat(
                  Object.keys(monthly).map(date => ({
                    date,
                    count: monthly[date],
                    modelKey: `${name}(${id})`,
                    subType: key,
                    name,
                    id,
                  })),
                );
              }
            });
          });
          setTotals(singleNode ? totalMap : undefined);
        }
        return val;
      });

      await Promise.all(promises);

      Object.keys(DETAIL_FIELDS).forEach(fieldName => {
        if (!chartDatas[fieldName]?.length) return;
        chartDatas[fieldName].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        chartDatas[fieldName].sort((a, b) => orderTypes.indexOf(a.modelKey) - orderTypes.indexOf(b.modelKey));
        destroyChart(fieldName, containerRefs[fieldName]);
        charts[fieldName] = createChart(
          fieldName,
          chartDatas[fieldName],
          containerRefs[fieldName].current,
          orderTypes,
          singleNode,
        );
      });

      const staticPromises = repoUserModels
        .map(async model => {
          const { id, name } = model;
          return Object.keys(STATIC_FIELD).map(fieldName => {
            const key = STATIC_FIELD[fieldName];
            const url = `https://oss.x-lab.info/open_digger/github/${name}/${key}.json`;
            return fetch(url)
              .then(response => response.json())
              .then(data => {
                const modelKey = `${name}(${id})`;
                cachedStateicData[modelKey] = cachedStateicData[modelKey] || {};
                cachedStateicData[modelKey][key] = data;
                const openrankData = Object.keys(data).map(date => ({
                  date,
                  count: data[date],
                  modelKey,
                  subType: key,
                  name,
                  id,
<<<<<<< Updated upstream
                }));
                openrankData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                openrankData.sort((a, b) => orderTypes.indexOf(a.modelKey) - orderTypes.indexOf(b.modelKey));
                destroyChart(fieldName, containerRefs[fieldName]);
                charts[fieldName] = createChart(
                  fieldName,
                  openrankData,
                  containerRefs[fieldName].current,
                  orderTypes,
                  false,
                );
              });
=======
                })),
              );
              return;
            }
            try {
              const response = await fetch(`https://oss.x-lab.info/open_digger/github/${name}/${key}.json`);
              const fetchedData = await response.json();
              cachedStateicData[modelKey] = cachedStateicData[modelKey] || {};
              cachedStateicData[modelKey][key] = fetchedData;
              chartDatas[fieldName] = chartDatas[fieldName].concat(
                Object.keys(fetchedData).map(date => ({
                  date,
                  count: fetchedData[date],
                  modelKey,
                  subType: key,
                  name,
                  id,
                })),
              );
              return fetchedData;
            } catch (error) {
              console.warn(`${name} 的 ${key} 文件获取失败`);
            }
>>>>>>> Stashed changes
          });
        })
        .flat();
      await Promise.all(staticPromises);

      if (!singleNode) setColorMap(dotColorMap);
      setLoading(false);
    })();
  }, [models]);

  useEffect(() => {
    if (!graph || graph.destroyed) return;
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
    if (models?.length) return;
    ['node', 'edge'].forEach(itemType => {
      if (!data?.[`${itemType}s`]?.length) return;
      const modelKeyMap = overviewData[itemType];
      destroyChart(`${itemType}Type`, overviewRefs[`${itemType}Type`]);
      const typeColorMap = {};
      config[`${itemType}s`].forEach(nodeConfig => {
        const { expressions, props } = nodeConfig;
        const dataType = expressions?.find(ex => ex.name === `${itemType}Type`)?.value;
        if (!dataType) return;
        typeColorMap[dataType] = props.color || '#ddd';
      });
      const chart = new Chart({
        container: overviewRefs[`${itemType}Type`].current!,
        theme: 'classic',
        autoFit: true,
        paddingTop: 0,
        paddingBottom: 0,
      });
      chart.coordinate({ type: 'theta', innerRadius: 0.25, outerRadius: 0.8 });
      chart
        .interval()
        .transform({ type: 'stackY' })
        .data(
          Object.keys(modelKeyMap).map(modelKey => ({
            modelKey,
            count: modelKeyMap[modelKey].length,
          })),
        )
        .encode('y', 'count')
        .encode('color', d => typeColorMap[d.modelKey])
        .scale('color', { type: 'identity' })
        .style('stroke', 'white')
        .style('inset', 1)
        .style('radius', 10)
        .label({
          text: 'count',
          style: {
            fontWeight: 'bold',
            offset: 14,
          },
        })
        .label({
          text: 'modelKey',
          position: 'spider',
          connectorDistance: 0,
          transoform: [{ type: 'overlapDodgeY' }],
          style: {
            fontWeight: 'bold',
            textBaseline: 'bottom',
            textAlign: d => (['c', 'sass'].includes(d.id) ? 'end' : 'start'),
            dy: -4,
          },
        })
        .animate('enter', { type: 'waveIn' })
        .legend(false);

      chart.text().style({
        text:
          itemType === 'node'
            ? $i18n.get({ id: 'gi-assets-xlab.components.XlabPropertiesPanel.Component.NodeType', dm: '节点类型' })
            : $i18n.get({ id: 'gi-assets-xlab.components.XlabPropertiesPanel.Component.EdgeType', dm: '边类型' }),
        x: '50%',
        y: '50%',
        textAlign: 'center',
        fontWeight: 'bold',
        lineWidth: 2,
        stroke: '#fff',
      });
      chart.render();
      charts[`${itemType}Type`] = chart;
    });
  }, [overviewData, models]);

  useEffect(() => {
    if (models?.length || !graph || graph.destroyed) return;
    renderRankingChart();
  }, [overviewData, models, rankingType, rankingDimension, graph]);

  const handleNodeSelect = e => {
    const { selectedItems, select } = e;
    if (!select || !selectedItems?.nodes?.length) return;
    destroyChart('nodeType', overviewRefs.nodeType);
    destroyChart('edgeType', overviewRefs.edgeType);
    const showModels = selectedItems.nodes
      .map(item => {
        const { id, properties, nodeType, name } = item.getModel();
        const showProperties = {
          name,
          nodeType,
          ...properties,
          id,
        };
        Object.keys(showProperties).forEach(field => {
          if (showProperties[field] === null) delete showProperties[field];
        });
        return showProperties;
      })
      .sort((a, b) => {
        const aHasDetail = DETAIL_SCHEMA_TYPES.includes(a.nodeType) ? 1 : -1;
        const bHasDetail = DETAIL_SCHEMA_TYPES.includes(b.nodeType) ? 1 : -1;
        return bHasDetail - aHasDetail;
      });

    setModels(showModels);
  };

  const handleCanvasClick = useMemoizedFn(() => {
    if (models.length) {
      setModels([]);
      setColorMap({});
    }
  });

  const handleCopyText = text => {
    const copyipt = document.createElement('input');
    copyipt.setAttribute('value', text);
    document.body.appendChild(copyipt);
    copyipt.select();
    document.execCommand('copy');
    document.body.removeChild(copyipt);
    message.success(
      $i18n.get({
        id: 'gi-assets-xlab.components.XlabPropertiesPanel.Component.TheTextHasBeenCopied',
        dm: '文本已复制到剪贴板',
      }),
    );
  };

  const renderRankingChart = async () => {
    setLoading(true);
    setRankingDimension(rankingDimension);
    const nodes = getTypeNodes(graph, [rankingType]).map(node => node.getModel());
    let rankingData: any = [];
    if (rankingDimension === 'Star' || rankingDimension === 'Commits') {
      rankingData = nodes.map(node => {
        const { id, name, star, commits } = node;
        return {
          key: `${name}(${id})`,
          dataId: id,
          ranking: rankingDimension === 'Star' ? star : commits,
        };
      });
    } else {
      const promises = nodes
        .map(async node => {
          const { id, name } = node;
          // date supports switching ?
          const currentDate = new Date();
          const monthStr = String(currentDate.getMonth());
          const dateKey = `${currentDate.getFullYear()}-${monthStr.length < 2 ? 0 : ''}${monthStr}`;

          const nodeKey = `${name}(${id})`;
<<<<<<< Updated upstream
          if (cachedStateicData[nodeKey]?.[rankingDimension]) {
            data.push({
=======
          if (cachedStateicData[nodeKey]?.hasOwnProperty(rankingDimension)) {
            if (!cachedStateicData[nodeKey][rankingDimension]) return;
            rankingData.push({
>>>>>>> Stashed changes
              key: nodeKey,
              dataId: id,
              ranking: cachedStateicData[nodeKey][rankingDimension][dateKey],
            });
            return;
          }
          try {
            const res = await fetch(
              `https://oss.x-lab.info/open_digger/github/${name}/${rankingDimension.toLowerCase()}.json`,
            )
              .then(response => {
                if (!response.ok) return;
                return response.json();
              })
              .then(rankData => {
                cachedStateicData[nodeKey] = cachedStateicData[nodeKey] || {};
                cachedStateicData[nodeKey][rankingDimension] = rankData;
                if (!rankData) {
                  rankingData.push({
                    key: nodeKey,
                    dataId: id,
                    ranking: 0,
                  });
                  return;
                }
                if (rankData[dateKey] !== undefined) {
                  rankingData.push({
                    key: nodeKey,
                    dataId: id,
                    ranking: rankData[dateKey],
                  });
                }
              });
            return res;
          } catch (error) {
            console.warn(`${name} 的 ${rankingDimension} 文件获取失败`);
          }
        })
        .filter(Boolean);
      await Promise.all(promises);
    }

    // Map the value to the node size
    let min = Infinity;
    let max = -Infinity;
    const NODE_VISUAL_RANGE = [16, 64];
    const nodeVisualRange = NODE_VISUAL_RANGE[1] - NODE_VISUAL_RANGE[0];
    rankingData.forEach(item => {
      if (item.ranking < min) min = item.ranking;
      if (item.ranking > max) max = item.ranking;
    });
    const nodeValueRange = max - min;
    if (max !== Infinity && nodeValueRange) {
      rankingData.forEach(item => {
        const { ranking, dataId } = item;
        const size = ((ranking - min) / nodeValueRange) * nodeVisualRange + NODE_VISUAL_RANGE[0];
        const node = graph.findById(dataId);
        if (!node) return;
        const { size: modelSize, style } = node.getModel();
        graph.updateItem(dataId, {
          size,
          oriSize: modelSize || style?.keyshape.size || 30,
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
    }

    destroyChart('Ranking', containerRefs.Ranking);
    if (rankingData?.length) {
      charts.Ranking = createTransposeIntervalChart(rankingData, containerRefs.Ranking.current, graph);
    }
    setChartsReady(old => {
      return {
        ...old,
        Ranking: !!rankingData?.length,
      };
    });
    setLoading(false);
  };

  const overview = useMemo(() => {
    const hasData = data?.nodes?.length;
    const hasRepoUserNode = getTypeNodeModels(data.nodes, DETAIL_SCHEMA_TYPES).length;
    const hasRepoNode = getTypeNodeModels(data.nodes, ['github_repo']).length;
    const hasUserNode = getTypeNodeModels(data.nodes, ['github_user']).length;
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
              style={chartsReady['Ranking'] ? {} : { visibility: 'hidden', height: 0 }}
            >
              <div className="gi-xlab-panel-ranking-dimension">
                <Radio.Group
                  size="middle"
                  options={[
                    { label: 'Repo', value: 'github_repo', disabled: !hasRepoNode },
                    { label: 'User', value: 'github_user', disabled: !hasUserNode },
                  ]}
                  onChange={ele => {
                    const val = ele.target?.value || 'github_repo';
                    setRankingType(val);
                    if (val === 'github_user' && (rankingDimension === 'Star' || rankingDimension === 'Commits')) {
                      form.setFieldValue('rankingDimension', 'OpenRank');
                      setRankingDimension('OpenRank');
                    }
                  }}
                  optionType="button"
                  defaultValue={hasRepoNode ? 'github_repo' : 'github_user'}
                  disabled={!hasRepoUserNode}
                />
                <Form.Item
                  name="rankingDimension"
                  initialValue={rankingType === 'github_repo' ? 'Star' : 'OpenRank'}
                  style={{ display: 'inline-flex', marginLeft: '8px' }}
                >
                  <Select
                    style={{ width: '150px' }}
                    onChange={setRankingDimension}
                    options={(rankingType === 'github_repo'
                      ? ['Star', 'OpenRank', 'Activity', 'Commits']
                      : ['OpenRank', 'Activity']
                    ).map(value => ({ label: value, value }))}
                  />
                </Form.Item>
              </div>
              <div className="gi-xlab-panel-overview-chart" ref={containerRefs.Ranking}></div>
              <Divider className="gi-xlab-panel-overview-divider" type="horizontal" />
            </div>

            <div
              style={!data.nodes.length ? { visibility: 'hidden', height: 0 } : {}}
              className="gi-xlab-panel-overview-chart"
              ref={overviewRefs.nodeType}
            />
            <div
              style={!data.edges.length ? { visibility: 'hidden', height: 0 } : {}}
              className="gi-xlab-panel-overview-chart"
              ref={overviewRefs.edgeType}
            />
          </>
        ) : (
          <Empty
            className="gi-xlab-panel-empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={$i18n.get({
              id: 'gi-assets-xlab.components.XlabPropertiesPanel.Component.PleaseRequestDataFirstAnd',
              dm: '请先请求数据，然后单选或按住 shift 框选 Repo、User 节点可查看详情',
            })}
          />
        )}
      </Form>
    );
  }, [models, data, rankingType, chartsReady]);

  const destroyChart = (key, ref) => {
    if (!charts[key]) return;
    charts[key]?.clear();
    if (ref?.current) {
      ref.current.childNodes.forEach(child => ref.current.removeChild(child));
      ref.current.innerHTML = '';
    }
  };

  const handleHighlightChart = (evt, model) => {
    evt.stopPropagation();
    if (models.length < 2) return;
    const { name, id } = model;
    Object.keys(DETAIL_FIELDS)
      .concat(Object.keys(STATIC_FIELD))
      .forEach(fieldName => {
        charts[fieldName]?.emit('element:unhighlight', {});
        charts[fieldName]?.emit('element:highlight', {
          data: { data: { modelKey: `${name}(${id})` } },
        });
      });
  };
  const handleUnhighlightChart = () => {
    Object.keys(DETAIL_FIELDS)
      .concat(Object.keys(STATIC_FIELD))
      .forEach(fieldName => {
        charts[fieldName]?.emit('element:unhighlight', {});
      });
  };

  const hasNoCharts = useMemo(() => totals && !Object.values(totals).find(num => num !== 0), [totals]);

  return (
    <div className="gi-xlab-panel">
      {models.length ? (
        <>
          <div className="gi-xlab-panel-detail-wrapper">
            {models.map(model => (
              <div
                className={
                  models?.length === 1
                    ? 'gi-xlab-panel-detail-one'
                    : 'gi-xlab-panel-detail-one gi-xlab-panel-detail-multi'
                }
                onMouseEnter={evt => handleHighlightChart(evt, model)}
                onMouseLeave={handleUnhighlightChart}
              >
                <Tooltip title={model.name || model.id}>
                  <p className={`gi-xlab-panel-detail-item`}>
                    {colorMap[model.id] ? (
                      <span className="gi-xlab-panel-detail-color-dot" style={{ background: colorMap[model.id] }} />
                    ) : (
                      ''
                    )}
                    <a
                      href={`https://github.com/${model.name}`}
                      target="_blank"
                      className={`gi-xlab-panel-detail-title ${
                        !model.name ? 'gi-xlab-panel-detail-title-disabled' : ''
                      }`}
                    >
                      {model.name || model.id}
                    </a>
                  </p>
                </Tooltip>
                <div className="gi-xlab-panel-detail-properties-wrapper">
                  {Object.keys(model).map(field => (
                    <Tooltip title={`${field}: ${model[field]}`}>
                      <p className="gi-xlab-panel-detail-item" onClick={() => handleCopyText(model[field])}>
                        {field}: {model[field]}
                      </p>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="gi-xlab-panel-chart-wrapper">
              <LoadingOutlined />
            </div>
          ) : (
            ''
          )}

          {getTypeNodeModels(models, DETAIL_SCHEMA_TYPES).length ? (
            <div className="gi-xlab-panel-chart-wrapper" style={{ visibility: loading ? 'hidden' : 'visible' }}>
              {hasNoCharts ? (
                <Empty
                  className="gi-xlab-panel-empty"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={$i18n.get({
                    id: 'gi-assets-xlab.components.XlabPropertiesPanel.Component.NoCharts',
                    dm: '该节点暂无指标',
                  })}
                />
              ) : (
                ''
              )}
              {Object.keys(STATIC_FIELD).map(key => (
                <div
                  className="gi-xlab-panel-chart-container"
                  style={!getTypeNodeModels(models, ['github_repo']).length ? { visibility: 'hidden', height: 0 } : {}}
                >
                  <h4 className="gi-xlab-panel-chart-title">{`${key} History`}</h4>
                  <div
                    className={`gi-xlab-panel-${key.toLowerCase()}-chart gi-xlab-panel-chart`}
                    ref={containerRefs[key]}
                  ></div>
                </div>
              ))}
              {Object.keys(DETAIL_FIELDS).map(key => (
                <div
                  className="gi-xlab-panel-chart-container"
                  style={totals?.[key] === 0 ? { visibility: 'hidden', height: 0 } : {}}
                >
                  <h4 className="gi-xlab-panel-chart-title">{`${key} History${totals ? `(${totals[key]})` : ''}`}</h4>
                  <div
                    className={`gi-xlab-panel-${key.toLowerCase()}-chart gi-xlab-panel-chart`}
                    ref={containerRefs[key]}
                  ></div>
                </div>
              ))}
            </div>
          ) : (
            ''
          )}
        </>
      ) : (
        overview
      )}
    </div>
  );
};

export default XlabPropertiesPanel;
