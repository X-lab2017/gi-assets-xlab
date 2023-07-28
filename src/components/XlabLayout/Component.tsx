import { Icon, useContext, utils } from '@antv/gi-sdk';
import React, { useState } from 'react';
import useComponents from './useComponents';
import { isString } from '@antv/util';
import { Button, Tooltip, message } from 'antd';
import { useEffect } from 'react';
import './index.less';

export interface XlabLayoutProps {
  topItems: any[];
  sideItems: any[];
  tabPosition: 'left' | 'right' | 'top' | 'bottom';
  height: number;
  padding: string;
  containers: any[];
  children: React.ReactNode[];
  serviceId?: string;
}

const XlabLayout: React.FunctionComponent<XlabLayoutProps> = props => {
  const { children, serviceId } = props;
  const { config, assets, HAS_GRAPH, graph, data: graphData, services } = useContext();

  const [currentLeftComponent, setCurrentLeftComponent] = useState('');
  const [hasData, setHasData] = useState(false);
  const [bottomVisible, setBottomVisible] = useState(false);

  const loginService = utils.getService(services, serviceId);

  // 登陆
  useEffect(() => {
    (async () => {
      if (!loginService) {
        message.error('未配置登陆服务');
        return;
      }
      const result = await loginService();
      if (!result.data) {
        message.error('登陆失败，请确认正确连接内网');
        return;
      }
      console.log('result', result);
      const token = `Bearer ${result.data}`;
      utils.setServerEngineContext({
        ENGINE_USER_TOKEN: token,
      });
    })();
  }, []);

  useEffect(() => {
    if (!graph || graph.destroyed) return;
    graph.on('canvas:click', handleCanvasClick);
    return () => {
      graph.off('canvas:click', handleCanvasClick);
    };
  }, [graph]);

  useEffect(() => {
    setHasData(!!graphData?.nodes?.length);
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
      icon: <Icon type={item.icon} onClick={() => handleLeftToolbarClick(item.id)} />,
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

  const handleLeftToolbarClick = id => {
    if (!id) setCurrentLeftComponent('');
    const child = leftChildren.find(item => item.key === id);
    if (!child || !child.item) return;
    const { item } = child;
    item.props.visible = true;
    setCurrentLeftComponent(item);
  };

  const handleCanvasClick = () => setCurrentLeftComponent('');

  const sortedComponents = leftChildren.sort((a, b) => a.props?.GI_CONTAINER_INDEX - b.props?.GI_CONTAINER_INDEX);
  const leftPositionStyles = utils.getPositionStyles('LT', offset);
  const toolbarTop = Number(leftPositionStyles.top.replace('px', ''));
  const mainWidth = hasData ? `calc(100% - ${rightWidth + rightPadding * 2}px)` : '100%';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <div
        className="gi-xlablayout-left-container"
        style={{ ...leftPositionStyles, visibility: hasData ? 'visible' : 'hidden' }}
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
                  <Button type="text" className="gi-xlablayout-left-icon" key={itemId}>
                    {icon}
                  </Button>
                </Tooltip>
              </span>
            );
          })}
        </ul>
      </div>
      {currentLeftComponent ? (
        <div
          className="gi-xlablayout-left-component"
          style={{ ...leftPositionStyles, top: `${toolbarTop + 50}px`, width: leftWidth }}
        >
          {currentLeftComponent}
        </div>
      ) : (
        ''
      )}
      <div style={{ width: mainWidth }}>
        <div
          className="gi-xlablayout-main-canvas-container"
          style={{ height: `calc(100% - ${bottomHeight + bottomPadding}px)` }}
        >
          {children}
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
      >
        {rightChildren.map(child => child.item)}
      </div>
    </div>
  );
};

export default XlabLayout;
