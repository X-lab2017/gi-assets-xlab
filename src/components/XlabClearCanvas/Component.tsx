import { useContext, utils, extra, IGIAC } from '@antv/gi-sdk';
import React, { useEffect, useRef, ReactNode } from 'react';
import './index.less';

const { GIAComponent } = extra;

export interface IClearCanvasProps {
  GIAC: IGIAC;
}

const ANNOTATION_CACHE = 'GI_XLAB_ANNOTATION_CACHE';
const BADGE_CLASSNAME = 'gi-graph-annotation';

const XlabClearCanvas: React.FC<IClearCanvasProps> = props => {
  const { GIAC } = props;
  const { data: graphData, graph, updateData } = useContext();

  useEffect(() => {
    const cache = JSON.parse(window.localStorage.getItem(ANNOTATION_CACHE) || '[]');
    const annotationPlugin = graph
      .get('plugins')
      .filter(plugin => plugin.get('pluginType') === 'gi-graph-annoation-component')[0];
    if (cache?.length && annotationPlugin) {
      const existCaches: any = [];
      cache.forEach(anno => {
        const { id, badges } = anno;
        const nodeItem = graph.findById(id);
        if (nodeItem && !nodeItem.destroyed) {
          existCaches.push(anno);
          if (badges?.length) {
            graph.updateItem(nodeItem, {
              style: { badges },
            });
          }
        }
      });
      if (existCaches.length) annotationPlugin.readData(existCaches);
    }
  }, [graphData]);

  const handleClear = () => {
    cacheAnnotations();
    updateData({
      nodes: [],
      edges: [],
    });
  };

  const cacheAnnotations = () => {
    if (!graph || graph.get('destroyed')) return;
    const annotationPlugin = graph
      .get('plugins')
      .filter(plugin => plugin.get('pluginType') === 'gi-graph-annoation-component')[0];
    if (!annotationPlugin) return;
    const annotationData = annotationPlugin.saveData(true);
    if (!annotationData?.length) return;
    const previousCache = JSON.parse(window.localStorage.getItem(ANNOTATION_CACHE) || '[]');
    const updatedMap = {};
    const currentCache = annotationData.map(anno => {
      const { id } = anno;
      const node = graph.findById(id);
      if (node && !node.destroyed) {
        const { badges: styleBadges = [] } = node.getModel().style || {};
        const annotationBadges = styleBadges.filter(badge => badge.classname === BADGE_CLASSNAME);
        anno.badges = annotationBadges;
      }
      const prev = previousCache.find(item => item.id === anno.id) || {};
      updatedMap[anno.id] = true;
      return {
        ...prev,
        ...anno,
      };
    });
    const totalCache = [...previousCache.filter(prev => !updatedMap[prev.id]), ...annotationData];
    window.localStorage.setItem(ANNOTATION_CACHE, JSON.stringify(totalCache));
  };

  return <GIAComponent GIAC={GIAC} onClick={handleClear} />;
};

export default XlabClearCanvas;
