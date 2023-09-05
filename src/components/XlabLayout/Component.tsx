import { Icon, useContext, utils } from '@antv/gi-sdk';
import React, { useState, useEffect } from 'react';
import useComponents from './useComponents';
import { isString } from '@antv/util';
import { Button, Spin, Tooltip, message } from 'antd';
import './index.less';

export interface XlabLayoutProps {
  topItems: any[];
  sideItems: any[];
  tabPosition: 'left' | 'right' | 'top' | 'bottom';
  height: number;
  padding: string;
  containers: any[];
  children: React.ReactNode[];
}

const XlabLayout: React.FunctionComponent<XlabLayoutProps> = props => {
  const { children } = props;
  const { config, assets, HAS_GRAPH, data: graphData, services } = useContext();

  const [currentLeftComponentId, setCurrentLeftComponentId] = useState('');
  const [hasData, setHasData] = useState(false);
  const [bottomVisible, setBottomVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    utils.setServerEngineContext({
      engineServerURL: 'http://osgraph.tugraph.com.cn',
    });
  }, []);

  useEffect(() => {
    const hasNode = !!graphData?.nodes?.length;
    setHasData(hasNode);
    const hasTimeEdge = graphData.edges?.find(
      edge => edge.created_at !== undefined || edge.properties?.created_at !== undefined,
    );
    setBottomVisible(!!hasTimeEdge);
  }, [graphData]);

  const { containers } = props;

  const ComponentCfgMap = config.components.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.id]: curr,
    };
  }, {});

  const [leftContainer, rightContainer, bottomContainer] = containers;
  const { GI_CONTAINER: leftItems = [], width: lw = 300, offset = [16, 16] } = leftContainer || {};
  const { GI_CONTAINER: rightItems = [], width: rw = 400, padding: rightPadding = 4 } = rightContainer || {};
  const { GI_CONTAINER: bottomItems = [], height: bh = 230, padding: bottomPadding = 4 } = bottomContainer || {};
  const rightWidth = isString(rw) ? Number(rw.replace('px', '')) : rw;
  let bottomHeight = isString(bh) ? Number(bh.replace('px', '')) : bh;
  if (!bottomVisible) bottomHeight = 0;
  const leftWidth = isString(lw) ? Number(lw.replace('px', '')) : lw;

  const LeftContent = useComponents(leftItems, ComponentCfgMap, assets.components);
  const leftChildren = LeftContent.map((item: any) => {
    return {
      icon: (
        <Icon
          type={item.icon}
          onClick={() => setCurrentLeftComponentId(currentLeftComponentId === item.id ? '' : item.id)}
        />
      ),
      key: item.id,
      item: HAS_GRAPH && item.children,
      props: item.props,
    };
  });

  const BottomContent = useComponents(bottomItems, ComponentCfgMap, assets.components);
  const bottomChildren = BottomContent.map((item: any) => {
    return {
      key: item.id,
      item: item.children,
    };
  });

  const rightContnt = useComponents(rightItems, ComponentCfgMap, assets.components);
  const rightChildren = rightContnt.map((item: any) => {
    return {
      key: item.id,
      item: item.children,
    };
  });

  const sortedComponents = leftChildren.sort((a, b) => a.props?.GI_CONTAINER_INDEX - b.props?.GI_CONTAINER_INDEX);
  const leftPositionStyles = utils.getPositionStyles('LT', offset);
  const toolbarTop = Number(leftPositionStyles.top.replace('px', ''));
  const mainWidth = hasData ? `calc(100% - ${rightWidth + rightPadding * 2}px)` : '100%';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }} data-tut="gi_xlab_node">
      {loading ? <Spin className="gi-xlabsearch-loading-first" size="large" /> : ''}
      <div
        className="gi-xlablayout-left-container"
        style={{ ...leftPositionStyles, visibility: hasData ? 'visible' : 'hidden' }}
        data-tut="gi_xlab_left_container"
      >
        <ul className="gi-xlablayout-left-children-wrapper">
          {sortedComponents.map(child => {
            if (!child?.item) {
              return null;
            }
            const { key: itemId, icon, props: componentProps } = child;
            const { title } = componentProps.GIAC_CONTENT || {};
            return (
              <span>
                <Tooltip title={title} placement="bottom">
                  <Button
                    type="text"
                    className="gi-xlablayout-left-icon"
                    key={itemId}
                    style={{
                      color: currentLeftComponentId === itemId ? 'var(--primary-color)' : 'unset',
                    }}
                  >
                    {icon}
                  </Button>
                </Tooltip>
              </span>
            );
          })}
        </ul>
      </div>
      {leftChildren.map(child => (
        <div
          className="gi-xlablayout-left-component"
          style={{
            ...leftPositionStyles,
            top: `${toolbarTop + 50}px`,
            width: leftWidth,
            display: currentLeftComponentId === child.key ? 'block' : 'none',
          }}
        >
          {child.item}
        </div>
      ))}
      <div style={{ width: mainWidth }}>
        <div
          data-tut="gi_xlab_context_menu"
          className="gi-xlablayout-main-canvas-container"
          style={{ height: `calc(100% - ${bottomHeight + bottomPadding}px)` }}
        >
          {children}
          {/* {virtualDOM} */}
        </div>
        <div
          className="gi-xlablayout-bottom-container"
          style={{
            height: `${bottomHeight}px`,
            width: mainWidth,
            visibility: bottomVisible ? 'visible' : 'hidden',
          }}
        >
          {bottomChildren.map(child => child.item)}
        </div>
      </div>
      <div
        className="gi-xlablayout-right-container"
        style={{
          width: `${rightWidth}px`,
          marginLeft: `${rightPadding}px`,
          background: 'var(--background-color-transparent)',
          borderRadius: '8px',
          overflow: 'auto',
          visibility: hasData ? 'visible' : 'hidden',
          position: hasData ? 'unset' : 'absolute',
        }}
        data-tut="gi_xlab_right_container"
      >
        {rightChildren.map(child => child.item)}
      </div>
    </div>
  );
};

export default XlabLayout;
