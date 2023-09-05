import { useContext, utils } from '@antv/gi-sdk';
import { Input, AutoComplete, Select, Tag, Row, Col, Spin, message, Button, Tooltip } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { debounce } from '@antv/util';
import { formatContent, getCirclePositionsMap, uniqueGraphData } from '../util';
import { GraphData } from '@antv/g6';
import $i18n from '../../i18n';
import { useMemoizedFn } from 'ahooks';
import TemplateCard from './TemplateCard';
import { templates } from './constant';
import './index.less';

const { getPositionStyles } = utils;
const { Option } = Select;
const LOCAL_STORAGE_HISTORY_KEY = 'GI-XLABSEARCH-HISTORY';

const XlabSearch = props => {
  const {
    searchServiceId,
    queryNodesServiceId,
    commonNeighborsServiceId,
    neighborsServiceId,
    getIdByNameServiceId,
    getSubGraphServiceId,
    placement,
    offset,
    width = '100%',
    size: propSize = 'large',
  } = props;
  const { data, graph, services, updateData, updateContext } = useContext();
  const searchService = utils.getService(services, searchServiceId);
  const queryNodesService = utils.getService(services, queryNodesServiceId);
  const commoneNeighborsService = utils.getService(services, commonNeighborsServiceId);
  const neighborsService = utils.getService(services, neighborsServiceId);
  const getIdService = utils.getService(services, getIdByNameServiceId);
  const subGraphService = utils.getService(services, getSubGraphServiceId);
  if (!searchService || !queryNodesService) {
    return null;
  }

  const [type, setType] = useState('repo');
  const [loading, setLoading] = useState(false);
  const [searchOptions, setSearchOptions] = useState<{}[]>([]);
  const [currentContent, setCurrentContent] = useState('');
  const [firstSearch, setFirstSearch] = useState(true);
  const [newNodeId, setNewNodeId] = useState('');

  const handleChange = debounce(async content => {
    setLoading(true);
    if (content) {
      const val = await searchService({ name: formatContent(content), isUser: type === 'user' });
      if (val.success) {
        const { nodes } = val.data;
        if (nodes) {
          setSearchOptions(
            nodes.map(node => {
              const { name, id } = node;
              return {
                value: name,
                id,
                label: `${name}(${id})`,
              };
            }),
          );
        }
      }
    }
    setLoading(false);
    setCurrentContent(content);
  }, 500);

  const handleSelect = debounce(async (val, option) => {
    if (!option?.value) return;
    handleClear();
    const { id } = option;
    // find the same node on the graph first
    const graphNodes = graph.getNodes().filter(node => (node.getModel() as any).properties.id?.toString() === id);
    if (graphNodes.length) {
      graphNodes.forEach(node => {
        graph.setItemState(node, 'query_start', true);
      });
      graph.focusItems(graphNodes);
    } else {
      // add node to the origin data
      setLoading(true);
      const resultData = await queryNodesService({ ids: [id] });
      if (resultData?.length) {
        const graphData = graph.save() as GraphData;
        const newNode = resultData[0];
        setNewNodeId(newNode.id);
        updateData({
          ...graphData,
          nodes: [...(graphData.nodes || []), newNode],
        });
        let historyNames = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY) || '[]');
        if (!historyNames.find(item => item.id === newNode.id)) {
          if (historyNames.length >= 5) historyNames = historyNames.slice(0, 4);
          historyNames.unshift({ name: newNode.name, id: newNode.id });
          window.localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify([...new Set(historyNames)]));
        }
      }
      setLoading(false);
    }
  }, 500);

  const hanldeClickHistory = ({ name, id }) => {
    (handleSelect as any)(name, { value: name, id });
  };

  useEffect(() => {
    // @ts-ignore
    handleChange(currentContent);
  }, [type]);

  useEffect(() => {
    if (data.nodes?.length) setFirstSearch(false);
    else setFirstSearch(true);
  }, [data]);

  useEffect(() => {
    // TODO
    if (!graph || graph.destroyed) return;
    graph.on('graphin:datachange', handleDataChange);
    graph.on('canvas:click', handleClear);
    graph.on('node:dragstart', handleCancelFix);
    return () => {
      graph.off('graphin:datachange', handleDataChange);
      graph.off('canvas:click', handleClear);
      graph.off('node:dragstart', handleCancelFix);
    };
  }, []);

  const handleCancelFix = evt => {
    graph.updateItem(evt.item, { fx: undefined, fy: undefined });
  };

  const handleDataChange = useMemoizedFn(() => {
    const newNode = graph.findById(newNodeId);
    if (newNode && !newNode.destroyed) {
      graph.setItemState(newNode, 'query_start', true);
    }
  });
  const handleClear = () => {
    const queryStartNodes = graph.findAllByState('node', 'query_start');
    const queryNormalNodes = graph.findAllByState('node', 'query_normal');
    [...queryStartNodes, ...queryNormalNodes].forEach(node => {
      graph.setItemState(node, 'query_start', false);
      graph.setItemState(node, 'query_normal', false);
    });
    setNewNodeId('');
  };

  const positionStyles = getPositionStyles(placement, offset);

  const size = firstSearch ? 'large' : propSize;
  let iconHeight = '22px';
  if (size === 'large') iconHeight = '40px';
  else if (size === 'middle') iconHeight = '32px';

  const searchBarStyle = { ...positionStyles, width };

  const historyNames = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY) || '[]');

  const queryCommonNeighbors = (nodes, types, limit, resGraphData) => {
    if (!commoneNeighborsService || !nodes?.length || nodes.length < 2) return [];
    const pairs: string[][] = [];
    nodes.forEach((nodei, i) => {
      nodes.forEach((nodej, j) => {
        if (i <= j) return;
        pairs.push([nodei.id, nodej.id]);
      });
    });
    if (nodes.length > 2) {
      pairs.push(nodes.map(node => node.id));
    }

    return pairs.map(async pair => {
      const res = await commoneNeighborsService({
        ids: pair,
        type: types,
        top: limit,
      });
      resGraphData.nodes = resGraphData.nodes.concat(res.nodes);
      resGraphData.edges = resGraphData.edges.concat(res.edges);
      return res;
    });
  };

  const queryNeighbors = (nodes, types, limit, resGraphData, callback) => {
    if (!neighborsService || !nodes?.length || !types?.length) return [];
    return types.map(async type => {
      const res = await neighborsService({
        ids: nodes.map(node => node.id),
        nodes: nodes,
        type,
        top: limit,
      });
      await callback?.(res);
      resGraphData.nodes = resGraphData.nodes.concat(res.nodes);
      resGraphData.edges = resGraphData.edges.concat(res.edges);
      return res;
    });
  };

  const onDemoChange = async demo => {
    const { repoNames, userNames, repoIds: propsRepoIds, userIds: propsUserIds, orgIds = [], actions } = demo;
    if (!getIdService) {
      message.warn('查询 Demo 失败，未配置 ID 查询服务');
      return;
    }
    setLoading(true);

    let repoIds: string[] = [];
    if (propsRepoIds) {
      repoIds = propsRepoIds;
    } else if (repoNames?.length) {
      const { data: idData } = await getIdService({ names: repoNames, isUser: false });
      if (idData.idsMap) repoIds = Object.values(idData.idsMap);
    }

    let userIds: string[] = [];
    if (propsUserIds) {
      userIds = propsUserIds;
    } else if (userNames?.length) {
      const { data: idData } = await getIdService({ names: userNames, isUser: true });
      if (idData.idsMap) userIds = Object.values(idData.idsMap);
    }

    if (!repoIds.length && !userIds.length && !orgIds.length) {
      message.warn('未查询到相关节点');
      return;
    }

    const repoNodes = await queryNodesService({ ids: repoIds });
    const userNodes = await queryNodesService({ ids: userIds });
    const orgNodes = await queryNodesService({ ids: orgIds });
    if (!repoNodes.length && !userNodes.length && !orgNodes.length) {
      setLoading(false);
      message.error('未找到节点');
      return;
    }
    const resGraphData: any = {
      nodes: [...repoNodes, ...userNodes, ...orgNodes],
      edges: [],
    };

    let promises: Promise<any>[] = [];
    await actions.map(async action => {
      switch (action) {
        case 'commonNeighbors':
          const topRepos = repoNodes.slice(0, 10);
          const topUsers = userNodes.slice(0, 10);
          const limit = getLimit([...topRepos, ...topUsers]);
          const commonStarsPromises = queryCommonNeighbors(topRepos, ['REPOS_COMMON_STAR'], limit, resGraphData);
          const repoCommonNeighborsPromises = queryCommonNeighbors(
            topRepos,
            ['REPOS_COMMON_ORG', 'REPOS_COMMON_TOPIC', 'REPOS_COMMON_LICENSE', 'REPOS_COMMON_LANGUAGE'],
            limit,
            resGraphData,
          );
          const userCommonNeighborsPromises = queryCommonNeighbors(
            topUsers,
            ['USERS_COMMON_STAR', 'USERS_COMMON_PR', 'USERS_COMMON_ISSUE'],
            limit,
            resGraphData,
          );
          promises = promises.concat([
            ...commonStarsPromises,
            ...repoCommonNeighborsPromises,
            ...userCommonNeighborsPromises,
          ]);
        case 'search':
          break;
        case 'repoSubGraph':
        case 'userSubGraph':
          if (!subGraphService) return;
          const subGraphResult = await subGraphService({
            names: repoNames,
            ids: action === 'repoSubGraph' ? repoIds : userIds,
            networkName: action === 'repoSubGraph' ? 'repo_network' : 'developer_network',
          });
          resGraphData.nodes = [...resGraphData.nodes, ...subGraphResult.nodes];
          resGraphData.edges = [...resGraphData.edges, ...subGraphResult.edges];
          promises.push(subGraphResult);
          break;
        case 'subRepos': {
          const subRepoPromises = queryNeighbors(
            orgNodes,
            ['ORGANIZATION_HAS_REPO'],
            getLimit(orgNodes),
            resGraphData,
            async res => {
              if (!subGraphService) return;
              const subRepos = res.nodes.filter(node => node.nodeType === 'github_repo');
              const subGraphResult = await subGraphService({
                names: subRepos.map(repo => repo.name),
                ids: subRepos.map(repo => repo.id),
                networkName: 'developer_network',
              });
              resGraphData.nodes = [...resGraphData.nodes, ...subGraphResult.nodes];
              resGraphData.edges = [...resGraphData.edges, ...subGraphResult.edges];
              promises.push(subGraphResult);
            },
          );
          promises = promises.concat(subRepoPromises);
          break;
        }
        case 'neighbors':
          const repoNeighborPromises = queryNeighbors(
            repoNodes,
            ['REPO_IS_ORGANIZATION', 'REPO_LICENSE_TOPIC'],
            getLimit(repoNodes),
            resGraphData,
          );
          const repoStarNeighborPromises = queryNeighbors(
            repoNodes,
            ['REPO_NEW_STAR'],
            getLimit(repoNodes),
            resGraphData,
          );
          const userNeighborPromises = queryNeighbors(userNodes, ['USER_NEW_STAR'], getLimit(userNodes), resGraphData);
          promises = promises.concat([...repoNeighborPromises, ...repoStarNeighborPromises, ...userNeighborPromises]);
          break;
        default:
          break;
      }
    });
    await Promise.all([repoNodes, userNodes, ...promises]);
    const uniqData = uniqueGraphData(resGraphData);
    const strIds = [...repoIds, ...userIds].map(String);
    const focusPosition = getCirclePositionsMap(strIds, graph.getWidth() * 0.8, graph.getHeight() * 0.8);
    uniqData.nodes.forEach((node: any) => {
      if (strIds.includes(node.id)) {
        const { x, y } = focusPosition[node.id];
        node.fx = x;
        node.fy = y;
      }
    });
    setLoading(false);
    updateContext(draft => {
      draft.isLoading = false;
    });
    updateData(uniqData);
  };

  const loadingComponent = firstSearch ? (
    <Spin className="gi-xlabsearch-loading-first" size="large" />
  ) : (
    <div className={'gi-xlabsearch-loading'}>
      <LoadingOutlined rev={undefined} />
    </div>
  );

  return (
    <div
      className={firstSearch ? 'gi-xlabsearch-wrapper-first' : 'gi-xlabsearch-wrapper'}
      style={firstSearch ? {} : searchBarStyle}
      data-tut="gi_xlab_search"
    >
      {firstSearch ? (
        <Row className="gi-xlabsearch-template-wrapper" justify={'center'}>
          {templates.map(template => (
            <Col span={6}>
              <TemplateCard info={template} onDemoChange={onDemoChange} searchService={searchService} />
            </Col>
          ))}
        </Row>
      ) : (
        ''
      )}
      <Input.Group
        className="gi-xlabsearch-searchbar"
        compact
        style={firstSearch ? { top: '20px', left: '10%', width: '80%' } : {}}
        size={size}
      >
        {firstSearch ? (
          <>
            <div className="gi-xlabsearch-searchbar-title">单点搜索：</div> <br />
          </>
        ) : (
          ''
        )}

        <Select
          className="gi-xlabsearch-type-select"
          defaultValue="repo"
          style={{ width: '80px', color: 'var(--text-color-2)' }}
          size={size}
          onChange={setType}
          disabled={loading}
        >
          <Option value="repo">Repo</Option>
          <Option value="user">User</Option>
        </Select>
        <AutoComplete
          showSearch
          style={{ width: `calc(100% - ${iconHeight} - 80px + 2px)` }}
          size={size}
          placeholder={$i18n.get({ id: 'gi-assets-xlab.components.Search.Component.EnterAName', dm: '输入名称' })}
          options={searchOptions}
          onChange={handleSelect}
          onSelect={handleSelect}
          onSearch={handleChange}
        />

        {
          <span
            className="gi-xlabsearch-icon"
            style={{ width: iconHeight, height: iconHeight, lineHeight: iconHeight }}
          >
            <SearchOutlined rev={undefined} />
          </span>
        }
      </Input.Group>
      {firstSearch && historyNames.length ? (
        <div className="gi-xlabsearch-history">
          历史记录：
          {historyNames.map(({ name, id }) => (
            <Tag className="gi-xlabsearch-history-tag" color="default" onClick={() => hanldeClickHistory({ name, id })}>
              {name}
            </Tag>
          ))}
        </div>
      ) : (
        ''
      )}
      {loading ? loadingComponent : ''}
    </div>
  );
};

export default XlabSearch;

const getLimit = nodes => {
  const nodeNum = nodes.length;
  const scale = nodeNum < 6 ? 10 : 14;
  return Math.max(100 - nodeNum * scale, 2);
};
