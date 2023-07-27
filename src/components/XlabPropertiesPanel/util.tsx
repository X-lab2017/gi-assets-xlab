import { Chart, ChartEvent } from '@antv/g2';

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
    .encode('x', 'key')
    .encode('y', 'ranking')
    .axis('x', {
      transform: [{ type: 'hide' }],
      labelAutoEllipsis: true,
    })
    .state('active', { lineWidth: 4 });

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
