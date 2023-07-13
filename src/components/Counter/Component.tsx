import { useContext } from '@antv/gi-sdk';
import React from 'react';
import $i18n from '../../i18n';
const Counter = props => {
  const { graph, data } = useContext();

  const nodes = data.nodes.length;
  const edges = data.edges.length;
  return (
    <div
      style={{
        position: 'absolute',
        top: '50px',
        left: '20px',
        background: 'red',
        padding: '20px',
      }}
    >
      {$i18n.get({
        id: 'gi-assets-xlab.components.Counter.Component.CustomAnalysisAssetsCounters',
        dm: '自定义分析资产：计数器',
      })}
      <br />
      Nodes Count: {nodes} <br />
      Edges Count: {edges}
    </div>
  );
};

export default Counter;
