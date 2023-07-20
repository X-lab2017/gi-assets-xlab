import { useContext, utils } from '@antv/gi-sdk';
import { useMemoizedFn } from 'ahooks';
import { Chart } from '@antv/g2';
import { LoadingOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Empty, Divider, Tooltip, message } from 'antd';
import $i18n from '../../i18n';
import './index.less';

const charts: { [key: string]: Chart | undefined } = {
  fork: undefined,
  issue: undefined,
  pr: undefined,
  star: undefined,
  nodeType: undefined,
  edgeType: undefined,
};

const COLORS = [
  'rgb(96,145,246)',
  'rgb(97,214,167)',
  'rgb(94,112,145)',
  'rgb(244,189,52)',
  'rgb(113,100,245)',
  'rgb(115,200,234)',
  'rgb(147,98,183)',
  'rgb(252,153,79)',
  'rgb(42,147,146)',
];

const XlabPropertiesPanel = props => {
  const { serviceId, width = '400px' } = props;
  const { graph, services, data, config } = useContext();
  const service = utils.getService(services, serviceId);
  if (!service) {
    return null;
  }

  const [models, setModels] = useState([] as any);
  const [totals, setTotals] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);
  const [colorMap, setColorMap] = useState({});
  const [overviewData, setOverviewData] = useState({ node: {}, edge: {} });

  const containerRefs = {
    Fork: useRef<HTMLDivElement>(null),
    Issue: useRef<HTMLDivElement>(null),
    PR: useRef<HTMLDivElement>(null),
    Star: useRef<HTMLDivElement>(null),
    Code: useRef<HTMLDivElement>(null),
    Comments: useRef<HTMLDivElement>(null),
    Commits: useRef<HTMLDivElement>(null),
  };
  const overviewRefs = {
    nodeType: useRef<HTMLDivElement>(null),
    edgeType: useRef<HTMLDivElement>(null),
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

  useEffect(() => {
    graph.on('canvas:click', handleCanvasClick);
    graph.on('nodeselectchange', handleNodeSelect);
    return () => {
      graph.off('canvas:click', handleCanvasClick);
      graph.off('canvas:click', handleCanvasClick);
    };
  }, [graph]);

  useEffect(() => {
    const repoUserModels = models.filter(model => DETAIL_SCHEMA_TYPES.includes(model.schemaType));
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
        const { id, name, schemaType } = model;
        dotColorMap[id] = COLORS[i % COLORS.length];
        orderTypes.push(`${name}(${id})`);
        const val = await service({ id, schemaType: schemaType === 'github_repo' ? 'repo' : 'user' });
        if (val.data.result) {
          const value = (Object.values(JSON.parse(val.data.result)) as any)[0];
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
        const chart = new Chart({
          container: containerRefs[fieldName].current!,
          theme: 'classic',
          autoFit: true,
          paddingLeft: 42,
          paddingRight: 24,
          paddingTop: 10,
        });
        if (fieldName === 'Star') {
          chart
            .interval()
            .data(chartDatas[fieldName])
            .encode('x', 'date')
            .encode('y', 'count')
            .transform({ type: 'dodgeX' })
            .encode('color', d => COLORS[orderTypes.indexOf(d.modelKey) % COLORS.length])
            .scale('color', { type: 'identity' })
            .axis('x', {
              labelAutoHide: true,
            });
        } else {
          let instance;
          if (singleNode) {
            instance = chart
              .interval()
              .transform({ type: 'stackY' })
              .encode('color', 'subType')
              .scale('color', { palette: 'accent' });
          } else {
            instance = chart
              .line()
              .encode('color', d => COLORS[orderTypes.indexOf(d.modelKey) % COLORS.length])
              .scale('color', { type: 'identity' });
          }
          instance
            .data(chartDatas[fieldName])
            .legend(false)
            .encode('x', 'date') // d => new Date(d.date)
            .encode('y', 'count')
            .axis('x', {
              labelAutoHide: true,
            })
            .tooltip(data => ({
              name: data.name,
              value: data.count,
              title: `${data.date}`,
            }))
            .state('active', { lineWidth: 4 });
        }
        chart.interaction('elementHighlight', true);
        chart.render();
        charts[fieldName] = chart;
      });

      if (!singleNode) setColorMap(dotColorMap);
      setLoading(false);
    })();
  }, [models]);

  useEffect(() => {
    // 更换概览图表
    const nodeTypeMap: any = {};
    const edgeTypeMap: any = {};
    graph.getNodes().forEach((node: any) => {
      const { properties, nodeType, name } = node.getModel();
      if (!nodeType) return;
      nodeTypeMap[nodeType] = nodeTypeMap[nodeType] || [];
      nodeTypeMap[nodeType].push({
        id: properties.id,
        name,
      });
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
  }, [data]);

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
        padding: 'auto',
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

  const handleNodeSelect = e => {
    const { selectedItems, select } = e;
    if (!select || !selectedItems?.nodes?.length) return;
    destroyChart('nodeType', overviewRefs.nodeType);
    destroyChart('edgeType', overviewRefs.edgeType);
    const showModels = selectedItems.nodes
      .map(item => {
        const { properties, nodeType: schemaType, name } = item.getModel();
        return {
          id: properties.id,
          name,
          schemaType,
          ...properties,
        };
      })
      .sort((a, b) => {
        const aHasDetail = DETAIL_SCHEMA_TYPES.includes(a.schemaType) ? 1 : -1;
        const bHasDetail = DETAIL_SCHEMA_TYPES.includes(b.schemaType) ? 1 : -1;
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

  const overview = useMemo(() => {
    const hasData = data?.nodes?.length;
    return (
      <div className="gi-xlab-panel-overview-wrapper">
        {hasData ? (
          <>
            <h3>
              {$i18n.get({
                id: 'gi-assets-xlab.components.XlabPropertiesPanel.Component.CanvasOverview',
                dm: '画布概览',
              })}
            </h3>
            <Divider className="gi-xlab-panel-overview-divider" type="horizontal" />
            <div className="gi-xlab-panel-overview-chart" ref={overviewRefs.nodeType} />
            <div className="gi-xlab-panel-overview-chart" ref={overviewRefs.edgeType} />
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
      </div>
    );
  }, [models, data]);

  const destroyChart = (key, ref) => {
    if (!charts[key]) return;
    charts[key]?.clear();
    ref?.current?.childNodes.forEach(child => child.remove());
  };

  const handleHighlightChart = (evt, model) => {
    evt.stopPropagation();
    if (models.length < 2) return;
    const { name, id } = model;
    Object.keys(DETAIL_FIELDS).forEach(fieldName => {
      charts[fieldName]?.emit('element:unhighlight', {});
      charts[fieldName]?.emit('element:highlight', {
        data: { data: { modelKey: `${name}(${id})` } },
      });
    });
  };
  const handleUnhighlightChart = () => {
    Object.keys(DETAIL_FIELDS).forEach(fieldName => {
      charts[fieldName]?.emit('element:unhighlight', {});
    });
  };

  const hasNoCharts = useMemo(() => totals && !Object.values(totals).find(num => num !== 0), [totals]);

  return (
    <div
      className="gi-xlab-panel"
      style={{ position: 'absolute', bottom: '0px', right: '0px', height: 'calc(100% - 38px)', width }}
    >
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
                {Object.keys(model).map(field => (
                  <Tooltip title={`${field}: ${model[field]}`}>
                    <p className="gi-xlab-panel-detail-item" onClick={() => handleCopyText(model[field])}>
                      {field}: {model[field]}
                    </p>
                  </Tooltip>
                ))}
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

          {models.filter(model => DETAIL_SCHEMA_TYPES.includes(model.schemaType)).length ? (
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
              <div
                className="gi-xlab-panel-chart-container"
                style={totals?.Star === 0 ? { visibility: 'hidden', height: 0 } : {}}
              >
                <h4 className="gi-xlab-panel-chart-title">{`Star History${totals ? `(${totals.Star})` : ''}`}</h4>
                <div className="gi-xlab-panel-star-chart gi-xlab-panel-chart" ref={containerRefs.Star}></div>
              </div>
              <div
                className="gi-xlab-panel-chart-container"
                style={totals?.Fork === 0 ? { visibility: 'hidden', height: 0 } : {}}
              >
                <h4 className="gi-xlab-panel-chart-title">{`Fork History${totals ? `(${totals.Fork})` : ''}`}</h4>
                <div className="gi-xlab-panel-fork-chart gi-xlab-panel-chart" ref={containerRefs.Fork} />
              </div>
              <div
                className="gi-xlab-panel-chart-container"
                style={totals?.Issue === 0 ? { visibility: 'hidden', height: 0 } : {}}
              >
                <h4 className="gi-xlab-panel-chart-title">{`Issue History${totals ? `(${totals.Issue})` : ''}`}</h4>
                <div className="gi-xlab-panel-issue-chart gi-xlab-panel-chart" ref={containerRefs.Issue}></div>
              </div>
              <div
                className="gi-xlab-panel-chart-container"
                style={totals?.PR === 0 ? { visibility: 'hidden', height: 0 } : {}}
              >
                <h4 className="gi-xlab-panel-chart-title">{`PR History${totals ? `(${totals.PR})` : ''}`}</h4>
                <div className="gi-xlab-panel-pr-chart gi-xlab-panel-chart" ref={containerRefs.PR}></div>
              </div>
              <div
                className="gi-xlab-panel-chart-container"
                style={totals?.Code === 0 ? { visibility: 'hidden', height: 0 } : {}}
              >
                <h4 className="gi-xlab-panel-chart-title">{`Code History${totals ? `(${totals.Code})` : ''}`}</h4>
                <div className="gi-xlab-panel-pr-chart gi-xlab-panel-chart" ref={containerRefs.Code}></div>
              </div>
              <div
                className="gi-xlab-panel-chart-container"
                style={totals?.Commits === 0 ? { visibility: 'hidden', height: 0 } : {}}
              >
                <h4 className="gi-xlab-panel-chart-title">{`Commits History${totals ? `(${totals.Commits})` : ''}`}</h4>
                <div className="gi-xlab-panel-pr-chart gi-xlab-panel-chart" ref={containerRefs.Commits}></div>
              </div>
              <div
                className="gi-xlab-panel-chart-container"
                style={totals?.Comments === 0 ? { visibility: 'hidden', height: 0 } : {}}
              >
                <h4 className="gi-xlab-panel-chart-title">{`Comments History${
                  totals ? `(${totals.Comments})` : ''
                }`}</h4>
                <div className="gi-xlab-panel-pr-chart gi-xlab-panel-chart" ref={containerRefs.Comments}></div>
              </div>
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
