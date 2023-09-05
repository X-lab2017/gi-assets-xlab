import { Chart, ChartEvent } from '@antv/g2';
import $i18n from '../../i18n';

export const DETAIL_SCHEMA_TYPES = ['github_repo', 'github_user'];

export const COLORS = [
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

export const createChart = (fieldName, data, container, orderTypes, isInterval = false) => {
  const chart = new Chart({
    container: container!,
    theme: 'classic',
    autoFit: true,
    paddingLeft: 42,
    paddingRight: 24,
    paddingTop: 10,
  });
  if (fieldName === 'Star') {
    chart
      .interval()
      .data(data)
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
    if (isInterval) {
      instance = chart
        .interval()
        .transform({ type: 'stackY' })
        .encode('color', 'subType')
        .scale('color', { palette: 'accent' })
        .tooltip(data => ({
          name: data.subType,
          value: data.count,
          title: `${data.date}`,
        }));
    } else {
      instance = chart
        .line()
        .encode('color', d => COLORS[orderTypes.indexOf(d.modelKey) % COLORS.length])
        .scale('color', { type: 'identity' })
        .tooltip(data => ({
          name: data.name,
          value: data.count,
          title: `${data.date}`,
        }));
    }
    instance
      .data(data)
      .legend(false)
      .encode('x', 'date')
      .encode('y', 'count')
      .axis('x', {
        labelAutoHide: true,
      })
      .state('active', { lineWidth: 4 });
  }
  chart.interaction('elementHighlight', true);
  chart.render();
  return chart;
};

export const createTransposeIntervalChart = (data, container, graph) => {
  if (!container) return;
  const chart = new Chart({
    container: container!,
    theme: 'classic',
    autoFit: true,
    paddingLeft: 140,
  });
  chart.coordinate({ transform: [{ type: 'transpose' }] });
  chart
    .interval()
    .data(data)
    .transform({ type: 'sortX', by: 'y', reverse: true })
    .encode('x', 'name')
    .encode('y', 'ranking')
    .axis('x', {
      transform: [{ type: 'hide' }],
      labelAutoEllipsis: true,
    })
    .axis('y', { title: '' })
    .state('active', { lineWidth: 4 })
    .animate(false);

  chart.render();
  chart.interaction('elementHighlight', true);
  chart.on(`interval:${ChartEvent.POINTER_OVER}`, evt => {
    const { dataId } = evt.data?.data || {};
    const node = graph.findById(dataId);
    if (dataId && node) graph.setItemState(dataId, 'active', true);
  });
  chart.on(`interval:${ChartEvent.POINTER_OUT}`, evt => {
    const { dataId } = evt.data?.data || {};
    const node = graph.findById(dataId);
    if (dataId && node) graph.setItemState(dataId, 'active', false);
  });
  return chart;
};

export const getTypeNodes = (graph, schameTypes) => {
  return graph.getNodes().filter(node => schameTypes.includes(node.getModel().nodeType as string));
};

export const getTypeNodeModels = (models, schemaTypes) => {
  return models.filter(model => schemaTypes.includes(model.nodeType));
};

export const renderSchemaDistributionChart = (chartData, itemType, overviewRefs, config, ellipse = true) => {
  if (!overviewRefs[`${itemType}Type`].current) return;
  const typeColorMap = {};
  config[`${itemType}s`].forEach(nodeConfig => {
    const { expressions, props = {} } = nodeConfig;
    const dataType = expressions?.find(ex => ex.name === `${itemType}Type`)?.value;
    if (!dataType) return;
    typeColorMap[dataType] = props.color || '#ddd';
  });
  const chart = new Chart({
    container: overviewRefs[`${itemType}Type`].current!,
    theme: 'classic',
    height: 220,
    width: 400,
    paddingTop: 4,
    paddingBottom: 4,
  });
  chart.coordinate({ type: 'theta', innerRadius: 0.25, outerRadius: 0.8 });
  chart
    .interval()
    .transform({ type: 'stackY' })
    .data(chartData)
    .encode('y', 'count')
    .encode('color', d => typeColorMap[d.modelKey])
    .scale('color', { type: 'identity' })
    .style('stroke', 'white')
    .style('inset', 1)
    .style('radius', 8)
    .label({
      text: d => {
        if (d.count < 1000000) return '';
        if (ellipse && d.count > 10000) {
          return `${Math.round(d.count / 1000) / 10}w`;
        }
        return d.count;
      },
      fontWeight: 'bold',
      pointerEvents: 'none',
      offset: 12,
      transform: [{ type: 'overlapDodgeY' }, { type: 'overlapHide' }],
    })
    .label({
      text: d => {
        return d.modelKey;
      },
      position: 'outside',
      transform: [{ type: 'overlapDodgeY' }, { type: 'overlapHide' }],
      connector: false,
      fontWeight: 'bold',
      pointerEvents: 'none',
      fill: '#999',
    })
    .tooltip(d => ({
      name: d.modelKey,
      value: ellipse && d.count > 10000 ? `${Math.round(d.count / 1000) / 10}w` : d.count,
    }))
    .animate(false)
    // .animate('enter', { type: 'waveIn' })
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
  return chart;
};

export const getMappedSize = (data, valueField, idField = 'id', NODE_VISUAL_RANGE = [8, 96]) => {
  // Map the value to the node size
  let min = Infinity;
  let max = -Infinity;
  const nodeVisualRange = NODE_VISUAL_RANGE[1] - NODE_VISUAL_RANGE[0];
  data.forEach(item => {
    if (item[valueField] < min) min = item[valueField];
    if (item[valueField] > max) max = item[valueField];
  });
  const nodeValueRange = max - min;
  const map = {};
  if (max !== Infinity && nodeValueRange) {
    data.forEach(item => {
      let size;
      if (item[valueField] !== undefined) {
        size = ((item[valueField] - min) / nodeValueRange) * nodeVisualRange + NODE_VISUAL_RANGE[0];
      }
      map[item[idField]] = size;
    });
  }
  return map;
};
