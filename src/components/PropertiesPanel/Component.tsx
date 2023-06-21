import { useContext } from '@antv/gi-sdk';
import { Input } from 'antd';
import React from 'react';
import './index.less';
const { Search } = Input;
const PropertiesPanel = props => {
  const [state, setState] = React.useState({
    data: {},
  });
  const { graph } = useContext();
  console.log('graph', state);
  React.useEffect(() => {
    const handleNodeClick = e => {
      console.log('e', e);
      const { data } = e.item.getModel();
      setState({
        data,
      });
    };
    const handleCanvasClick = () => {
      setState({
        data: {
          value: '这里要做全画布的画像信息',
        },
      });
    };
    graph.on('node:click', handleNodeClick);
    graph.on('canvas:click', handleCanvasClick);
    return () => {
      graph.off('node:click', handleNodeClick);
      graph.off('canvas:click', handleCanvasClick);
    };
  }, [graph]);
  return (
    <div>
      <pre>{JSON.stringify(state.data, null, 2)}</pre>
    </div>
  );
};

export default PropertiesPanel;
