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
export interface SubNetworkProps {
  serviceId: string;
  contextmenu: any;
  controlledValues?: ControlledValues;
}

/**
 * https://doc.linkurio.us/user-manual/latest/visualization-inspect/
 */
const XlabSubNetwork: React.FunctionComponent<SubNetworkProps> = props => {
  const { contextmenu, serviceId } = props;
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

  const handleClick = async (models, networkName) => {
    const value = contextmenu.item.getModel();
    graph.setItemState(value.id, 'selected', true);

    const names = models.map(model => model.name);
    const ids = models.map(model => model.id);
    const expandStartId = value.id;

    updateContext(draft => {
      draft.isLoading = true;
    });

    contextmenu.onClose();

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
        names,
        ids,
        networkName,
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

  const menuItems = useMemo(() => {
    const selectedNodes = graph.findAllByState('node', 'selected');
    if (targetNode && !selectedNodes.find(node => node.getID() === targetNode.getID())) selectedNodes.push(targetNode);
    const repoNodeModels = selectedNodes.map(node => node.getModel()).filter(model => model.label === 'github_repo');
    if (!repoNodeModels?.length) return [];
    return [
      // @ts-ignore
      <Menu.Item key="REPO_NETWORK" eventKey="REPO_NETWORK" onClick={e => handleClick(repoNodeModels, 'repo_network')}>
        关联仓库子图
      </Menu.Item>,
      // @ts-ignore
      <Menu.Item
        key="DEVELOPER_NETWORK"
        eventKey="DEVELOPER_NETWORK"
        onClick={e => handleClick(repoNodeModels, 'developer_network')}
      >
        开发者子图
      </Menu.Item>,
    ];
  }, [graph.findAllByState('node', 'selected'), targetNode]);

  return menuItems?.length ? (
    <SubMenu
      key="xlab-sub-network"
      // @ts-ignore
      eventKey="xlab-sub-network"
      title="关联子图"
    >
      {menuItems}
    </SubMenu>
  ) : (
    <Tooltip title="请选择仓库类型节点进行子图查询">
      <SubMenu
        key="xlab-sub-network"
        // @ts-ignore
        eventKey="xlab-sub-network"
        title="关联子图"
        disabled
      />
    </Tooltip>
  );
};

export default XlabSubNetwork;
