import { useContext, utils } from '@antv/gi-sdk';
import { Chart } from '@antv/g2';
import { LoadingOutlined } from '@ant-design/icons';
import React, { useEffect, useRef } from 'react';
import './index.less';
import { Col, Divider, Row, Tooltip, message } from 'antd';
import $i18n from '../../i18n';

const charts = {
  fork: undefined,
  issue: undefined,
  pr: undefined,
  star: undefined,
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
  const { graph, services } = useContext();
  const service = utils.getService(services, serviceId);
  if (!service) {
    return null;
  }

  const [models, setModels] = React.useState([] as any);
  const [totals, setTotals] = React.useState<any>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [colorMap, setColorMap] = React.useState({});

  const containerRefs = {
    fork: useRef<HTMLDivElement>(null),
    issue: useRef<HTMLDivElement>(null),
    pr: useRef<HTMLDivElement>(null),
    star: useRef<HTMLDivElement>(null),
  };

  React.useEffect(() => {
    graph.on('canvas:click', handleCanvasClick);
    graph.on('nodeselectchange', handleNodeSelect);
    return () => {
      graph.off('canvas:click', handleCanvasClick);
      graph.off('canvas:click', handleCanvasClick);
    };
  }, [graph]);

  useEffect(() => {
    if (!models.length) return;
    (async () => {
      setLoading(true);
      const fields = ['Fork', 'Issue', 'PR', 'Star'];
      const chartDatas = {
        fork: [],
        issue: [],
        pr: [],
        star: [],
      };
      const dotColorMap = {};
      const orderTypes: string[] = [];

      const promises: Promise<any>[] = models.map(async (model, i) => {
        const { id, name, schemaType } = model;
        dotColorMap[id] = COLORS[i % models.length];
        orderTypes.push(`${name}(${id})`);
        const val = await service({ id, dataType: schemaType === 'github_repo' ? 'repo' : 'user' });
        if (val.data.result) {
          const value = (Object.values(JSON.parse(val.data.result)) as any)[0];
          const totalMap = {};
          fields.forEach(field => {
            const key = field.toLowerCase();
            const { monthly, total = 0 } = value[key];
            totalMap[key] = total;
            if (monthly) {
              chartDatas[key] = chartDatas[key].concat(
                Object.keys(monthly).map(date => ({
                  date,
                  count: monthly[date],
                  type: `${name}(${id})`,
                })),
              );
            }
          });
          setTotals(models.length === 1 ? totalMap : undefined);
        }
        return val;
      });

      await Promise.all(promises);

      fields.forEach(field => {
        const key = field.toLowerCase();
        chartDatas[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        chartDatas[key].sort((a, b) => orderTypes.indexOf(a.type) - orderTypes.indexOf(b.type));
        if (charts[key]) {
          charts[key].clear();
          containerRefs[key].current.childNodes.forEach(child => child.remove());
        }
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
            .axis('x', {
              labelAutoHide: true,
            });
        } else {
          const intance = chart
            .line()
            .data(chartDatas[key])
            .legend(false)
            .encode('x', d => new Date(d.date))
            .encode('y', 'count')
            .axis('x', {
              labelAutoHide: true,
            });
          if (models.length > 1) {
            intance.encode('color', 'type');
          } else {
            intance.encode('color', 'count').scale('color', { palette: 'turbo' }).style('gradient', 'y');
          }
        }
        chart.render();
        charts[key] = chart;
      });

      setColorMap(dotColorMap);
      setLoading(false);
    })();
  }, [models]);

  const handleNodeSelect = e => {
    const { selectedItems, select } = e;
    if (!select || !selectedItems?.nodes?.length) return;
    const showModels = selectedItems.nodes.map(item => {
      const { properties, nodeType: schemaType, name } = item.getModel();
      return {
        id: properties.id,
        name,
        schemaType,
        ...properties,
      };
    });
    setModels(showModels);
  };
  const handleCanvasClick = () => {
    setModels([]);
    setColorMap({});
  };

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

  return (
    <div
      className="gi-xlab-panel"
      style={{ position: 'absolute', bottom: '0px', right: '0px', height: 'calc(100% - 38px)', width }}
    >
      {models.length ? (
        <>
          <div className="gi-xlab-panel-detail-wrapper">
            {models.map(model => (
              <div className="gi-xlab-panel-detail-one">
                <Tooltip title={model.name}>
                  <h3 className="gi-xlab-panel-detail-item" onClick={() => handleCopyText(model.name)}>
                    {colorMap[model.id] ? (
                      <span className="gi-xlab-panel-detail-color-dot" style={{ background: colorMap[model.id] }} />
                    ) : (
                      ''
                    )}

                    {model.name}
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
        </>
      ) : (
        ''
      )}
    </div>
  );
};

export default XlabPropertiesPanel;
