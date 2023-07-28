import { useContext, utils } from '@antv/gi-sdk';

import { Menu, message, Tooltip } from 'antd';
import React, { useEffect, useRef } from 'react';
import $i18n from '../../i18n';
import { useMemo } from 'react';

const { SubMenu } = Menu;
type ControlledValues = {
  startIds: string[];
  expandStartId: string;
  sep: number;
};
export interface QueryNeighborsProps {
  serviceId: '';
  contextmenu: any;
  degree: number;
  isFocus: boolean;
  limit: number;
  controlledValues?: ControlledValues;
}

/**
 * https://doc.linkurio.us/user-manual/latest/visualization-inspect/
 */
const XlabCommonNeighbors: React.FunctionComponent<QueryNeighborsProps> = props => {
  const { contextmenu, serviceId, isFocus, limit, controlledValues } = props;
  const currentRef = useRef({
    expandIds: [],
    expandStartId: '',
  });

  const { data, updateContext, updateHistory, transform, graph, config, services } = useContext();

  const service = utils.getService(services, serviceId);
  const { item: targetNode } = contextmenu;
  if (!service || targetNode?.destroyed || targetNode?.getType?.() !== 'node') {
    return null;
  }

  const handleClick = async (e, models) => {
    const { key } = e;
    const [type, top] = key.split('-');

    const value = contextmenu.item.getModel();
    graph.setItemState(value.id, 'selected', true);

    const ids = models.map(model => model.id);
    const expandStartId = value.id;

    updateContext(draft => {
      draft.isLoading = true;
    });

    contextmenu.onClose();
    await expandNodes(type, top, ids, expandStartId, models);
  };

  const expandNodes = async (type, top, ids, expandStartId, propNodes: any = undefined) => {
    let nodes = propNodes;

    // TODO: 历史沉淀
    // const historyProps = {
    //   startIds: ids,
    //   expandStartId,
    //   type,
    //   top,
    // };
    // if (!propNodes) {
    //   nodes = ids.map(id => graph.findById(id)?.getModel()).filter(Boolean);
    //   if (!nodes?.length)
    //     handleUpateHistory(
    //       historyProps,
    //       false,
    //       $i18n.get({
    //         id: 'basic.components.NeighborsQuery.Component.TheSpecifiedDiffusionStartNode',
    //         dm: '当前画布中未找到指定的扩散起始节点',
    //       }),
    //     );
    // }
    try {
      const result = await service({
        ids,
        nodes,
        type,
        top,
      });

      const newData = utils.handleExpand(data, result);
      const expandIds = result.nodes?.map(n => n.id) || [];
      currentRef.current.expandIds = expandIds;
      currentRef.current.expandStartId = expandStartId;
      if (!expandIds.length) message.info('未找到符合条件的邻居节点');

      updateContext(draft => {
        const res = transform(newData);
        draft.data = res;
        draft.source = res;
        draft.isLoading = false;
        if (draft.layout.type === 'preset') {
          //兼容从save模式
          const { props: layoutProps } = draft.config.layout || { props: { type: 'graphin-force' } };
          draft.layout = layoutProps;
        }
      });

      // TODO: 历史沉淀
      // handleUpateHistory(historyProps);
    } catch (error) {
      // TODO: 历史沉淀
      // handleUpateHistory(historyProps, false, String(error));
    }
  };

  /**
   * 更新到历史记录
   * @param success 是否成功
   * @param errorMsg 若失败，填写失败信息
   * @param value 查询语句
   */
  const handleUpateHistory = (params: ControlledValues, success: boolean = true, errorMsg?: string) => {
    updateHistory({
      componentId: 'NeighborsQuery',
      type: 'analyse',
      subType: $i18n.get({ id: 'basic.components.NeighborsQuery.Component.NeighborQuery', dm: '邻居查询' }),
      statement1: `查询 ${params.startIds.join(', ')} 的邻居`,
      statement: $i18n.get(
        {
          id: 'basic.components.NeighborsQuery.Component.NeighborQueryOfStarts',
          dm: `查询 ${params.startIds.join(', ')} 的邻居`,
        },
        { startIds: params.startIds.join(', ') },
      ),
      success,
      errorMsg,
      params,
    });
  };

  // TODO: 历史沉淀
  // /**
  //  * 受控参数变化，自动进行分析
  //  * e.g. ChatGPT，历史记录模版等
  //  */
  // useEffect(() => {
  //   if (controlledValues) {
  //     const { startIds, expandStartId, sep } = controlledValues;
  //     expandNodes(startIds, expandStartId, sep);
  //   }
  // }, [controlledValues]);

  useEffect(() => {
    //@ts-ignore
    const handleCallback = () => {
      const { expandIds, expandStartId } = currentRef.current;
      if (expandIds.length === 0) {
        return;
      }
      expandIds.forEach(id => {
        const item = graph.findById(id);
        if (item && !item.destroyed) {
          graph.setItemState(id, 'query_normal', true);
        }
      });
      const startItem = graph.findById(expandStartId);
      if (!startItem || startItem.destroyed) return;
      graph.setItemState(expandStartId, 'query_start', true);
      isFocus && graph.focusItem(expandStartId);
    };
    //@ts-ignore
    graph.on('graphin:datachange', handleCallback);
    return () => {
      graph.off('graphin:datachange', handleCallback);
    };
  }, [isFocus]);

  const menuItems = useMemo(() => {
    const selectedNodes = graph.findAllByState('node', 'selected');
    if (targetNode && !selectedNodes.find(node => node.getID() === targetNode.getID())) selectedNodes.push(targetNode);
    const repoNodeModels = selectedNodes.map(node => node.getModel()).filter(model => model.label === 'github_repo');
    const userNodeModels = selectedNodes.map(node => node.getModel()).filter(model => model.label === 'github_user');
    const items: any[] = [];
    if (repoNodeModels.length > 1) {
      items.push(
        <Menu.Item
          key="REPOS_COMMON_STAR-100"
          eventKey="REPOS_COMMON_STAR-100"
          onClick={e => handleClick(e, repoNodeModels)}
        >
          仓库共同关注者
        </Menu.Item>,
      );
    }
    if (userNodeModels.length > 1) {
      items.push(
        <Menu.Item
          key="USERS_COMMON_STAR-100"
          eventKey="USERS_COMMON_STAR-100"
          onClick={e => handleClick(e, userNodeModels)}
        >
          用户共同关注的仓库
        </Menu.Item>,
      );
    }
    return items;
  }, [graph.findAllByState('node', 'selected'), targetNode]);

  return menuItems?.length ? (
    <SubMenu
      key="xlab-common-neighbors"
      // @ts-ignore
      eventKey="xlab-common-neighbors"
      title={$i18n.get({ id: 'basic.components.NeighborsQuery.Component.ExtendedQuery', dm: '共同邻居' })}
    >
      {menuItems}
    </SubMenu>
  ) : (
    <Tooltip title="请选择两个及以上节点 github_repo 或 github_user 节点">
      <SubMenu
        key="xlab-common-neighbors"
        // @ts-ignore
        eventKey="xlab-common-neighbors"
        title={$i18n.get({ id: 'basic.components.NeighborsQuery.Component.ExtendedQuery', dm: '共同邻居' })}
        disabled
      />
    </Tooltip>
  );
};

export default XlabCommonNeighbors;
