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
    fork: useRef<HTMLDivElement>(null),
    issue: useRef<HTMLDivElement>(null),
    pr: useRef<HTMLDivElement>(null),
    star: useRef<HTMLDivElement>(null),
  };
  const overviewRefs = {
    nodeType: useRef<HTMLDivElement>(null),
    edgeType: useRef<HTMLDivElement>(null),
  };

  const DETAIL_SCHEMA_TYPES = ['github_repo', 'user'];
  const DETAIL_FIELDS = ['Fork', 'Issue', 'PR', 'Star'];

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
        fork: [],
        issue: [],
        pr: [],
        star: [],
      };
      const dotColorMap = {};
      const orderTypes: string[] = [];

      const promises: Promise<any>[] = repoUserModels.map(async (model, i) => {
        const { id, name, schemaType } = model;
        dotColorMap[id] = COLORS[i % COLORS.length];
        orderTypes.push(`${name}(${id})`);
        const val = await service({ id, dataType: schemaType === 'github_repo' ? 'repo' : 'user' });
        if (val.data.result) {
          const value = (Object.values(JSON.parse(val.data.result)) as any)[0];
          const totalMap = {};
          DETAIL_FIELDS.forEach(field => {
            const key = field.toLowerCase();
            const { monthly, total = 0 } = value[key];
            totalMap[key] = total;
            if (monthly) {
              chartDatas[key] = chartDatas[key].concat(
                Object.keys(monthly).map(date => ({
                  date,
                  count: monthly[date],
                  type: `${name}(${id})`,
                  name,
                  id,
                })),
              );
            }
          });
          setTotals(repoUserModels.length === 1 ? totalMap : undefined);
        }
        return val;
      });

      await Promise.all(promises);

      DETAIL_FIELDS.forEach(field => {
        const key = field.toLowerCase();
        chartDatas[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        chartDatas[key].sort((a, b) => orderTypes.indexOf(a.type) - orderTypes.indexOf(b.type));
        destroyChart(key, containerRefs[key]);
        const chart = new Chart({
          container: containerRefs[key].current!,
          theme: 'classic',
          autoFit: true,
          paddingLeft: 42,
          paddingRight: 24,
          paddingTop: 10,
        });
        if (key === 'star') {
          chart
            .interval()
            .data(chartDatas[key])
            .encode('x', 'date')
            .encode('y', 'count')
            .transform({ type: 'dodgeX' })
            .encode('color', d => COLORS[orderTypes.indexOf(d.type) % COLORS.length])
            .scale('color', { type: 'identity' })
            .axis('x', {
              labelAutoHide: true,
            });
        } else {
          const instance = chart
            .line()
            .data(chartDatas[key])
            .legend(false)
            .encode('x', d => new Date(d.date))
            .encode('y', 'count')
            .axis('x', {
              labelAutoHide: true,
            })
            .tooltip({
              title: d => d.date,
            })
            .state('active', { lineWidth: 4 });
          if (repoUserModels.length > 1) {
            instance
              .encode('color', d => COLORS[orderTypes.indexOf(d.type) % COLORS.length])
              .scale('color', { type: 'identity' });
          } else {
            instance.encode('color', 'count').scale('color', { palette: 'turbo' }).style('gradient', 'y');
          }
        }
        chart.interaction('elementHighlight', true);
        chart.render();
        charts[key] = chart;
      });

      setColorMap(dotColorMap);
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
      const typeMap = overviewData[itemType];
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
          Object.keys(typeMap).map(type => ({
            type,
            count: typeMap[type].length,
          })),
        )
        .encode('y', 'count')
        .encode('color', d => typeColorMap[d.type])
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
          text: 'type',
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

  const handleHighlightChart = model => {
    if (models.length < 2) return;
    const { name, id } = model;
    DETAIL_FIELDS.forEach(field => {
      charts[field.toLowerCase()]?.emit('element:unhighlight', {});
      charts[field.toLowerCase()]?.emit('element:highlight', {
        data: { data: { type: `${name}(${id})` } },
      });
    });
  };
  const handleUnhighlightChart = () => {
    DETAIL_FIELDS.forEach(field => {
      charts[field.toLowerCase()]?.emit('element:unhighlight', {});
    });
  };

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
                className="gi-xlab-panel-detail-one"
                onMouseEnter={() => handleHighlightChart(model)}
                onMouseLeave={handleUnhighlightChart}
              >
                <Tooltip title={model.name || model.id}>
                  <h3 className="gi-xlab-panel-detail-item" onClick={() => handleCopyText(model.name || model.id)}>
                    {colorMap[model.id] ? (
                      <span className="gi-xlab-panel-detail-color-dot" style={{ background: colorMap[model.id] }} />
                    ) : (
                      ''
                    )}

                    {model.name || model.id}
                  </h3>
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
              <div className="gi-xlab-panel-chart-container">
                <h4 className="gi-xlab-panel-chart-title">{`Star History${totals ? `(${totals.star})` : ''}`}</h4>
                <div className="gi-xlab-panel-star-chart gi-xlab-panel-chart" ref={containerRefs.star}></div>
              </div>
              <div className="gi-xlab-panel-chart-container">
                <h4 className="gi-xlab-panel-chart-title">{`Fork History${totals ? `(${totals.fork})` : ''}`}</h4>
                <div className="gi-xlab-panel-fork-chart gi-xlab-panel-chart" ref={containerRefs.fork} />
              </div>
              <div className="gi-xlab-panel-chart-container">
                <h4 className="gi-xlab-panel-chart-title">{`Issue History${totals ? `(${totals.issue})` : ''}`}</h4>
                <div className="gi-xlab-panel-issue-chart gi-xlab-panel-chart" ref={containerRefs.issue}></div>
              </div>
              <div className="gi-xlab-panel-chart-container">
                <h4 className="gi-xlab-panel-chart-title">{`PR History${totals ? `(${totals.pr})` : ''}`}</h4>
                <div className="gi-xlab-panel-pr-chart gi-xlab-panel-chart" ref={containerRefs.pr}></div>
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
