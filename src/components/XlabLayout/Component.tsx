import { useContext } from '@antv/gi-sdk';
import React from 'react';
import './index.less';
import useComponents from './useComponents';
const XlabLayout = props => {
  const { containers, children } = props;
  const context = useContext();
  const { config, assets, HAS_GRAPH } = context;

  const Containers = useComponents(context, containers);
  console.log('containers', containers, Containers, HAS_GRAPH);
  const [header, panel] = Containers;

  return (
    <div className="gi-xlab">
      <div className="xlab-header">
        {header.children.map(item => {
          return item.component;
        })}
      </div>
      <div className="xlab-canvas">{children}</div>
      <div className="xlab-properties">
        {panel.children.map(item => {
          return item.component;
        })}
      </div>
    </div>
  );
};

export default XlabLayout;
