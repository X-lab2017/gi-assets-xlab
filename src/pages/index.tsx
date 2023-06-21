import * as GI_ASSETS_BASIC from '@antv/gi-assets-basic';
import { services as GI_ASSETS_BASIC_SERVER } from '@antv/gi-assets-basic';
import GISDK, { utils } from '@antv/gi-sdk';
import ThemeSwitch from '@antv/gi-theme-antd';
import 'antd/dist/antd.css';
import React from 'react';
import { GI_PROJECT_CONFIG, SERVER_ENGINE_CONTEXT, THEME_VALUE } from './GI_EXPORT_FILES';
import ServerView from './ServerView';
import update from './update';

/** 资产可按需引入 **/
const {
  ZoomIn,
  ZoomOut,

  ActivateRelations,
  CanvasSetting,
  FilterPanel,
  ContextMenu,
  ToggleClusterWithMenu,
  Copyright,
  PinNodeWithMenu,
  Initializer,
  LayoutSwitch,
  SideTabs,
  Toolbar,
  Placeholder,
  NeighborsQuery,
} = GI_ASSETS_BASIC.components;
const { SimpleNode, SimpleEdge } = GI_ASSETS_BASIC.elements;
const { GraphinForce, Concentric, Dagre, FundForce } = GI_ASSETS_BASIC.layouts;

const ASSETS = {
  components: {
    ZoomIn,
    ZoomOut,

    ActivateRelations,
    CanvasSetting,
    FilterPanel,
    ContextMenu,
    ToggleClusterWithMenu,
    Copyright,
    PinNodeWithMenu,
    Initializer,
    LayoutSwitch,
    SideTabs,
    Toolbar,
    Placeholder,
    NeighborsQuery,
  },
  elements: { SimpleNode, SimpleEdge },
  layouts: { GraphinForce, Concentric, Dagre, FundForce },
};
//@ts-ignore
const { config, assets, engine } = update(ASSETS, GI_PROJECT_CONFIG, [GI_ASSETS_BASIC_SERVER]);
const { getCombineServices } = utils;
//@ts-ignores
const services = getCombineServices(engine);
/** 设置服务引擎 Context **/
utils.setServerEngineContext(SERVER_ENGINE_CONTEXT);
/** 设置主题 **/
window.localStorage.setItem('@theme', THEME_VALUE);

const MyGraphApp = () => {
  return (
    <>
      <ThemeSwitch style={{ visibility: 'hidden', position: 'absolute' }} />
      <ServerView />
      {/** @ts-ignore */}
      <GISDK config={config} assets={assets} services={services} />
    </>
  );
};

export default MyGraphApp;
