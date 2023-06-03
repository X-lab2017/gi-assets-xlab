import React from 'react';
import ThemeSwitch from '@antv/gi-theme-antd'
import {  GI_PROJECT_CONFIG, SERVER_ENGINE_CONTEXT,GI_ASSETS_PACKAGE } from "./GI_EXPORT_FILES";

    

//@ts-ignore
const {  getCombineServices,loaderCombinedAssets } = window.GISDK.utils;
const { GI_SITE_PROJECT_ID } = SERVER_ENGINE_CONTEXT;
// 设置引擎上下文
window.localStorage.setItem( 'SERVER_ENGINE_CONTEXT', JSON.stringify(SERVER_ENGINE_CONTEXT));

const MyGraphApp= (props) => {
  const [state,setState]= React.useState({
    isReady:false,
    assets:null,
    config:{},
    services:[]
  });
  React.useEffect(()=>{
    loaderCombinedAssets(GI_ASSETS_PACKAGE).then(res=>{
      /** 生成服务 */
      const services = getCombineServices(res.services)
      setState(preState=>{
        return {
          ...preState,
          isReady:true,
          assets:res,
          services,
          config:GI_PROJECT_CONFIG,
        }
      })
    })
  },[]);
  const {assets,isReady,config,services} =state;
  if(!isReady){
    return <div>loading...</div>
  }
  return (
    <div>
      <div style={{ height: "100vh" }}>
        <ThemeSwitch style={{display: 'none'}} />
        {/** @ts-ignore */}
        <window.GISDK.default
          config={config}
          assets={assets}
          services={services}
        />
      </div>
    </div>
  );
};

 export default MyGraphApp;