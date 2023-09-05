import { CaretRightOutlined, DeleteOutlined, FormOutlined } from '@ant-design/icons';
import { useContext, extra, IGIAC } from '@antv/gi-sdk';
import { Button, Col, Collapse, Empty, Form, Row, Radio, Space, Switch, Timeline, message, Select } from 'antd';
import React, { useState, useRef, ReactNode } from 'react';
import Tour from 'reactour';
import './index.less';
import { useEffect } from 'react';
import { useMemo } from 'react';

const { GIAComponent } = extra;

export interface IXlabGuideProps {
  GIAC: IGIAC;
}
let tourOpened = false;

const XlabGuide: React.FC<IXlabGuideProps> = props => {
  const { graph, data: graphData } = useContext();
  const { GIAC } = props;

  const [tourOpen, setTourOpen] = useState(false);
  const [virtualDOM, setVirtualDOM] = useState<JSX.Element | ''>('');
  const [canvasBottom, setCanvasBottom] = useState('24px');

  const virtualTimeline = useMemo(
    () => (
      <div
        className="gi-xlab-layout-virtual gi-xlab-layout-virtual-timeline"
        data-tut="gi_xlab_timeline"
        style={{ bottom: `-${canvasBottom}` }}
      />
    ),
    [canvasBottom],
  );
  const virtualToolbar = useMemo(
    () => (
      <div
        className="gi-xlab-layout-virtual gi-xlab-layout-virtual-toolbar"
        data-tut="gi_xlab_toolbar"
        // style={{ bottom: canvasBottom }}
      />
    ),
    [canvasBottom],
  );

  const handleTourStepChange = step => {
    if (step === 6) {
      const node = graph.getNodes()[0];
      const model = node.getModel();
      graph.emit('node:contextmenu', {
        item: node,
        preventDefault: () => {},
        stopPropagation: () => {},
        canvasX: model.x,
        canvasY: model.y,
      });
    } else if (step === 8) {
      if (virtualDOM === virtualTimeline) return;
      setVirtualDOM(virtualTimeline);
    } else if (step === 9) {
      if (virtualDOM === virtualToolbar) return;
      setVirtualDOM(virtualToolbar);
    } else if (virtualDOM) {
      setVirtualDOM('');
    }
  };

  useEffect(() => {
    const hasTimeEdge = graphData.edges?.find(
      edge => edge.created_at !== undefined || edge.properties?.created_at !== undefined,
    );
    setCanvasBottom(hasTimeEdge ? '240px' : '24px');

    const tourHasShown = localStorage.getItem('GI_XLAB_TOUR_SHOWN') == 'true';
    if (graphData?.nodes?.length && !tourOpened && !tourHasShown) {
      tourOpened = true;
      setTourOpen(true);
      localStorage.setItem('GI_XLAB_TOUR_SHOWN', 'true');
    }
  }, [graphData]);

  return (
    <div className="gi-xlab-guide">
      <GIAComponent GIAC={GIAC} onClick={() => setTourOpen(true)} />
      <Tour
        scrollSmooth
        onRequestClose={() => {
          setTourOpen(false);
          setVirtualDOM('');
        }}
        steps={tourConfig}
        isOpen={tourOpen}
        maskClassName="mask"
        className="helper"
        rounded={5}
        accentColor={'#3056e3'}
        getCurrentStep={handleTourStepChange}
      />
      {virtualDOM}
    </div>
  );
};

export default XlabGuide;

const tourConfig = [
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
