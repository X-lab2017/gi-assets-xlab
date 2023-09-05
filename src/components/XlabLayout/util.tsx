import { Chart, ChartEvent } from '@antv/g2';
import React from 'react';

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

export const tourConfig = [
  {
    selector: '[data-tut="gi_xlab_search"]',
    content: `欢迎来到 GraphInsight 🎉。\n 首先，在这里搜索仓库或用户，记得在左侧进行类型的切换哦。`,
  },
  {
    selector: '[data-tut="gi_xlab_right_container"]',
    content: `在未选中节点的情况下，这里显示的是数据的概览。`,
  },
  {
    selector: '[data-tut="gi_xlab_ranking"]',
    content: () => (
      <div>
        <p>仓库或用户节点的排名。同时，排名将体现在节点大小上。</p>
        <p>可切换排名的依据：Star 数、OpenRank 排名、Activity 活跃度、Commit 提交数。</p>
      </div>
    ),
  },
  {
    selector: '[data-tut="gi_xlab_distribution"]',
    content: '节点和边类型的分布情况，可以切换画布数据、数据库所有数据。',
  },
  {
    selector: '[data-tut="gi_xlab_schema"]',
    content: '图的 Schema 模型，您可以看到各节点类型之间是如果连接的。',
  },
  {
    selector: '[data-tut="gi_xlab_node"]',
    content: () => (
      <div>
        <p>选中画布上的单个节点，右侧面板将显示该节点的一些指标历史趋势。</p>
        <p>例如活跃度、Star 数、PR 数、Issue 数等。</p>
        <p>选中多个节点可以进行对比哦。</p>
      </div>
    ),
  },
  {
    selector: '[data-tut="gi_xlab_context_menu"]',
    content: () => (
      <div>
        <p>右击节点，您将看到弹出的右键菜单。</p>
        <p>可进行条件扩散、（多选节点的）共同邻居查询、标记或标注节点、查询相关子图、删除节点等。</p>
      </div>
    ),
  },
  {
    selector: '[data-tut="gi_xlab_left_container"]',
    content: '这里有一些分析功能，例如：最短路径（画布内/数据库内搜索）、节点重要性、节点聚类等。',
  },
  {
    selector: '[data-tut="gi_xlab_timeline"]',
    content: '若画布上有边数据，这里将会出现时间轴。您可以通过时间轴控制当前画布上的时间范围、播放、暂停等。',
  },
  {
    selector: '[data-tut="gi_xlab_toolbar"]',
    content: '一些视图的操作，包括放大、缩小、布局切换等。还有 3D 概览哦！',
  },
];
