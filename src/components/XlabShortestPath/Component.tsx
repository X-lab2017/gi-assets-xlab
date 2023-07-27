import { CaretRightOutlined, DeleteOutlined, FormOutlined } from '@ant-design/icons';
import { useContext, utils } from '@antv/gi-sdk';
import { Button, Col, Collapse, Empty, Form, Row, Radio, Space, Switch, Timeline, message, Select } from 'antd';
import { enableMapSet } from 'immer';
import React, { useEffect, useRef, ReactNode } from 'react';
import { useImmer } from 'use-immer';
import FilterRule from './FilterRule';
import './index.less';
import PanelExtra from './PanelExtra';
import { IHighlightElement, IState } from './typing';
import { getPathByWeight } from './utils';
import { findShortestPath } from '@antv/algorithm';
import $i18n from '../../i18n';
import { AutoComplete } from 'antd';
import { debounce } from '@antv/util';
import { formatContent } from '../util';
import { GraphData } from '@antv/g6';

const { Panel } = Collapse;

export interface IPathAnalysisProps {
  pathNodeLabel: string;
  controlledValues?: {
    source: string;
    target: string;
    direction: string;
  };
  searchServiceId?: string;
  cypherServiceId?: string;
  onOpen: () => void;
}

enableMapSet();

const XlabPathAnalysis: React.FC<IPathAnalysisProps> = props => {
  const { pathNodeLabel, controlledValues, searchServiceId, cypherServiceId, onOpen = () => {} } = props;
  const { data: graphData, graph, sourceDataMap, updateHistory, services, updateData } = useContext();

  // fuzzy search service
  const searchService = utils.getService(services, searchServiceId);
  const queryService = utils.getService(services, cypherServiceId);
  if (!searchService || !queryService) return null;

  const [state, updateState] = useImmer<IState>({
    allNodePath: [],
    allEdgePath: [],
    nodePath: [],
    edgePath: [],
    highlightPath: new Set<number>(),
    isAnalysis: false,
    filterRule: {
      type: 'All-Path',
    },
    selecting: '',
    searchOptions: [],
    loading: false,
    source: undefined,
    target: undefined,
    searchRange: 'canvas',
  });
  const { searchOptions, loading, source, target, searchRange } = state;

  let nodeClickListener = e => {};

  // 缓存被高亮的节点和边
  const highlightElementRef = useRef<IHighlightElement>({
    nodes: new Set(),
    edges: new Set(),
  });

  const [form] = Form.useForm();

  const handleResetForm = () => {
    form.resetFields();
    updateState(draft => {
      draft.allNodePath = [];
      draft.allEdgePath = [];
      draft.nodePath = [];
      draft.edgePath = [];
      draft.highlightPath = new Set();
      draft.isAnalysis = false;
      draft.filterRule = {
        type: 'All-Path',
      };
      draft.selecting = '';
    });
    cancelHighlight();
  };

  const handleSearch = () => {
    form.validateFields().then(values => {
      cancelHighlight();
      const { source: formSource, target: formTarget, direction = false } = values;
      const history = {
        componentId: 'PathAnalysis',
        type: 'analyse',
        subType: $i18n.get({ id: 'basic.components.PathAnalysis.Component.Path', dm: '路径' }),
        statement: $i18n.get(
          {
            id: 'basic.components.PathAnalysis.Component.StartPointSourceEndPoint',
            dm: '起点: {source}, 终点: {target}',
          },
          { source: formSource, target: formTarget },
        ),
        params: {
          source: formSource,
          target: formTarget,
          direction: String(direction),
        },
      };
      try {
        if (searchRange === 'canvas') {
          doSearchInCanvas(formSource, formTarget, direction);
        } else {
          doSearchInDatabase(formSource, formTarget, direction);
        }
        // 更新到历史记录
        updateHistory({
          ...history,
          success: true,
        });
      } catch (error) {
        updateHistory({ ...history, success: false, errorMsg: error });
      }
    });
  };

  const onSwitchChange = (pathId: number) => {
    updateState(draft => {
      if (draft.highlightPath.has(pathId)) {
        draft.highlightPath.delete(pathId);
      } else {
        draft.highlightPath.add(pathId);
      }
    });
  };

  // 取消所有节点和边的高亮状态
  const cancelHighlight = () => {
    [...highlightElementRef.current?.nodes].forEach(nodeId => {
      graph.findById(nodeId) && graph.setItemState(nodeId, 'active', false);
    });
    [...highlightElementRef.current.edges].forEach(edgeId => {
      // graph.findById(edgeId) && graph.setItemState(edgeId, 'active', false);
      if (graph.findById(edgeId)) {
        graph.setItemState(edgeId, 'active', false);
        graph.updateItem(edgeId, {
          style: {
            animate: {
              visible: false,
              type: 'circle-running',
              color: 'rgba(236,65,198,1)',
              repeat: true,
              duration: 1000,
            },
          },
        });
      }
    });
  };

  const beginSelect = type => {
    updateState(draft => {
      draft.selecting = type;
    });
    graph.off('node:click', nodeClickListener);

    nodeClickListener = e => {
      updateState(draft => {
        draft.selecting = '';
      });
      const { item } = e;
      if (!item || item.destroyed) return;
      form.setFieldsValue({ [type]: item.getID() });
    };
    graph.once('node:click', nodeClickListener);
  };

  const handleChanage = debounce(async content => {
    updateState(draft => {
      draft.loading = true;
    });
    let searchResults: { label: string; value: string }[] = [];
    const promises: Promise<any>[] = ['user', 'repo'].map(async type => {
      const val = await searchService({ name: formatContent(content), isUser: type === 'user' });
      if (val.data?.result) {
        const nodes = JSON.parse(val.data.result);
        if (nodes && nodes.ok !== false) {
          searchResults = searchResults.concat(
            Object.keys(nodes).map(id => ({
              value: id,
              label: `${nodes[id]}(${id})`,
            })) || [],
          );
        }
      }
      return val;
    });
    await Promise.all(promises);
    updateState(draft => {
      draft.loading = false;
      draft.searchOptions = searchResults;
    });
  }, 500);

  const handleSelect: (val: string, options: any, type: 'source' | 'target') => void = debounce(
    async (val, option, type = 'source') => {
      if (!option?.value) return;
      // find same node on the graph first
      const graphNodes = graph.getNodes().filter(node => (node.getModel() as any).properties.id?.toString() === val);
      if (graphNodes.length) {
        graph.focusItems(graphNodes);
      } else {
        // add node to the origin data
        updateState(draft => {
          draft.loading = true;
        });
        const statement = `MATCH (n) where id(n) = ${val} RETURN n`;
        const resultData = await queryService({
          value: statement,
          limit: 1,
        });
        if (resultData.nodes?.length) {
          updateState(draft => {
            draft[type] = resultData.nodes[0].id;
          });
        }
        updateState(draft => {
          draft.loading = false;
        });
      }
    },
    500,
  );

  const doSearchInCanvas = (formSource, formTarget, direction) => {
    const { allPath: allNodePath, allEdgePath }: any = findShortestPath(graphData, formSource, formTarget, direction);
    if (!allNodePath?.length) {
      let info = $i18n.get({
        id: 'basic.components.PathAnalysis.Component.NoPathThatMeetsThe',
        dm: '无符合条件的路径',
      });
      if (direction) {
        info = $i18n.get(
          {
            id: 'basic.components.PathAnalysis.Component.InfoYouCanTryTo',
            dm: '{info}，可尝试将“是否有向”设置为“无向”，或改变起点与终点',
          },
          { info: info },
        );
      } else {
        info = $i18n.get(
          {
            id: 'basic.components.PathAnalysis.Component.InfoYouCanTryTo.1',
            dm: '{info}，可尝试改变起点与终点',
          },
          { info: info },
        );
      }
      message.info(info);
      updateHistory({
        ...history,
        success: false,
        errorMsg: info,
      });
      return;
    }
    const highlightPath = new Set<number>(allNodePath.map((_, index) => index));

    updateState(draft => {
      draft.allNodePath = allNodePath;
      draft.allEdgePath = allEdgePath;
      draft.nodePath = allNodePath;
      draft.edgePath = allEdgePath;
      draft.isAnalysis = true;
      draft.highlightPath = highlightPath;
      draft.filterRule = {
        type: 'All-Path',
      };
      draft.selecting = '';
    });
  };

  const doSearchInDatabase = async (formSource, formTarget, direction) => {
    updateState(draft => {
      draft.loading = true;
    });
    // const statement = `MATCH (n1) WHERE id(n1) = ${formSource} with n1 MATCH (n2) WHERE id(n2) = ${formTarget} with n1, n2 CALL algo.shortestPath(n1,n2) YIELD path RETURN path`;
    const statement = `MATCH (n1) WHERE id(n1) = ${formSource} with n1 MATCH (n2) WHERE id(n2) = ${formTarget} with n1, n2 CALL algo.allShortestPaths(n1,n2) YIELD relationshipIds RETURN relationshipIds`;
    const resultData = await queryService({
      value: statement,
      limit: 1,
    });
    const { nodes, edges, paths } = resultData;
    if (nodes?.length) {
      const graphData = graph.save() as GraphData;
      const newNodes = [...(graphData.nodes || []), ...nodes];
      const newEdges = [...(graphData.edges || []), ...edges];
      updateData({
        ...graphData,
        nodes: newNodes,
        edges: newEdges,
      });
      const allNodePath: string[][] = [];
      const allEdgePath: string[][] = [];
      paths?.forEach(path => {
        allNodePath.push(path.nodes.map(nodeId => String(nodeId)));
        allEdgePath.push(path.edges);
      });
      updateState(draft => {
        draft.allNodePath = allNodePath;
        draft.allEdgePath = allEdgePath;
        draft.nodePath = allNodePath;
        draft.edgePath = allEdgePath;
        draft.isAnalysis = true;
        draft.highlightPath = new Set<number>(allNodePath.map((_, index) => index));
        draft.filterRule = {
          type: 'All-Path',
        };
        draft.selecting = '';
      });
    } else {
      message.info('该起点和终点之间不存在路径');
    }
    updateState(draft => {
      draft.loading = false;
    });
  };

  useEffect(() => {
    for (let i = 0; i < state.nodePath.length; i++) {
      const nodes = state.nodePath[i];
      const edges = state.edgePath[i];

      if (!state.highlightPath.has(i)) {
        nodes.forEach(nodeId => {
          graph.findById(nodeId) && graph.setItemState(nodeId, 'active', false);
          highlightElementRef.current?.nodes.delete(nodeId);
        });

        edges.forEach(edgeId => {
          graph.findById(edgeId) && graph.setItemState(edgeId, 'active', false);
          highlightElementRef.current?.edges.delete(edgeId);
        });
      }
    }

    for (let i = 0; i < state.nodePath.length; i++) {
      const nodes = state.nodePath[i];
      const edges = state.edgePath[i];
      if (state.highlightPath.has(i)) {
        nodes.forEach(nodeId => {
          graph.findById(nodeId) && graph.setItemState(nodeId, 'active', true);
          highlightElementRef.current?.nodes.add(nodeId);
        });
        edges.forEach(edgeId => {
          // graph.findById(edgeId) && graph.setItemState(edgeId, 'active', true);
          if (graph.findById(edgeId)) {
            graph.setItemState(edgeId, 'active', true);
            graph.updateItem(edgeId, {
              style: {
                animate: {
                  visible: true,
                  type: 'circle-running',
                  color: 'rgba(236,65,198,1)',
                  repeat: true,
                  duration: 1000,
                },
              },
            });
          }
          highlightElementRef.current?.edges.add(edgeId);
        });
      }
    }
  }, [state.highlightPath]);

  // 过滤逻辑副作用
  useEffect(() => {
    cancelHighlight();
    highlightElementRef.current = { nodes: new Set(), edges: new Set() };

    let nodePath: string[][] = [];
    let edgePath: string[][] = [];
    if (state.filterRule.type === 'Shortest-Path') {
      const pathLenMap = {};
      let minLen = Infinity;
      state.allEdgePath.forEach((path, pathId) => {
        const len = state.filterRule.weightPropertyName
          ? getPathByWeight(path, state.filterRule.weightPropertyName, sourceDataMap)
          : path.length;
        minLen = Math.min(minLen, len);
        pathLenMap[pathId] = len;
      });

      nodePath = state.allNodePath.filter((_, pathId) => pathLenMap[pathId] === minLen);
      edgePath = state.allEdgePath.filter((_, pathId) => pathLenMap[pathId] === minLen);
    } else if (state.filterRule.type === 'Edge-Type-Filter' && state.filterRule.edgeType) {
      const validPathId = new Set();
      state.allEdgePath.forEach((path, pathId) => {
        const isMatch = path.every(edgeId => {
          const edgeConfig = sourceDataMap.edges[edgeId];
          return edgeConfig?.edgeType === state.filterRule.edgeType;
        });
        if (isMatch) {
          validPathId.add(pathId);
        }
      });
      nodePath = state.allNodePath.filter((_, pathId) => validPathId.has(pathId));
      edgePath = state.allEdgePath.filter((_, pathId) => validPathId.has(pathId));
    } else {
      nodePath = state.allNodePath;
      edgePath = state.allEdgePath;
    }

    updateState(draft => {
      draft.nodePath = nodePath;
      draft.edgePath = edgePath;
      draft.highlightPath = new Set(nodePath.map((_, index) => index));
    });
  }, [state.allNodePath, state.allEdgePath, state.filterRule]);

  useEffect(() => {
    handleResetForm();
  }, [graphData]);

  /**
   * 外部控制参数变化，进行分析
   * e.g. ChatGPT，历史记录模版等
   */
  useEffect(() => {
    if (controlledValues) {
      const { source, target, direction } = controlledValues;
      onOpen();
      form.setFieldsValue({
        source,
        target,
        direction: direction !== 'false',
      });
      handleSearch();
    }
  }, [controlledValues]);

  return (
    <div className="gi-path-analysis">
      <Form form={form}>
        <Form.Item
          name="searchRange"
          label={$i18n.get({ id: 'basic.components.PathAnalysis.Component.IsThereAnyDirection', dm: '搜索范围' })}
          initialValue={searchRange}
        >
          <Radio.Group
            size="middle"
            options={[
              { label: '画布内', value: 'canvas' },
              { label: '数据库', value: 'database' },
            ]}
            onChange={ele => {
              updateState(draft => {
                draft.searchRange = ele.target?.value || 'canvas';
              });
            }}
            optionType="button"
          />
        </Form.Item>

        <Row justify="space-between">
          <Col span={22}>
            <Form.Item
              label={$i18n.get({ id: 'basic.components.PathAnalysis.Component.StartNode', dm: '起始节点' })}
              name="source"
              initialValue={source}
              rules={[
                {
                  required: true,
                  message: $i18n.get({
                    id: 'basic.components.PathAnalysis.Component.EnterTheStartNodeId',
                    dm: '请填写起点节点ID',
                  }),
                },
              ]}
              tooltip={{
                open: state.selecting === 'source',
                title: $i18n.get({
                  id: 'basic.components.PathAnalysis.Component.YouCanClickTheCanvas',
                  dm: '可点选画布节点，快速选择起始节点',
                }),
              }}
            >
              {searchRange === 'database' ? (
                <AutoComplete
                  showSearch
                  placeholder={$i18n.get({
                    id: 'gi-assets-xlab.components.Search.Component.EnterAName',
                    dm: '模糊搜索起点名称',
                  })}
                  options={searchOptions}
                  onChange={(val, option) => handleSelect(val, option, 'source')}
                  onSelect={(val, option) => handleSelect(val, option, 'source')}
                  onSearch={handleChanage}
                  onFocus={() => beginSelect('source')}
                />
              ) : (
                <Select
                  showSearch
                  optionFilterProp="children"
                  onChange={() => {
                    updateState(draft => {
                      draft.selecting = '';
                    });
                  }}
                  onFocus={() => beginSelect('source')}
                >
                  {graphData.nodes.map(node => (
                    <Select.Option key={node.id} value={node.id}>
                      {node.name}({node.id})
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={2} style={{ lineHeight: '32px', textAlign: 'right' }}>
            <FormOutlined
              style={{ cursor: 'pointer', color: state.selecting === 'source' ? '#1890ff' : 'rgba(0, 0, 0, 0.65)' }}
              onClick={() => beginSelect('source')}
            />
          </Col>
        </Row>
        <Row justify="space-between">
          <Col span={22}>
            <Form.Item
              label={$i18n.get({ id: 'basic.components.PathAnalysis.Component.TargetNode', dm: '目标节点' })}
              initialValue={target}
              name="target"
              rules={[
                {
                  required: true,
                  message: $i18n.get({
                    id: 'basic.components.PathAnalysis.Component.EnterTheEndpointId',
                    dm: '请填写终点节点ID',
                  }),
                },
              ]}
              tooltip={{
                open: state.selecting === 'target',
                title: $i18n.get({
                  id: 'basic.components.PathAnalysis.Component.YouCanClickTheCanvas.1',
                  dm: '可点选画布节点，快速选择目标节点',
                }),
              }}
            >
              {searchRange === 'database' ? (
                <AutoComplete
                  showSearch
                  placeholder={$i18n.get({
                    id: 'gi-assets-xlab.components.Search.Component.EnterAName',
                    dm: '模糊搜索终点名称',
                  })}
                  options={searchOptions}
                  onChange={(val, option) => handleSelect(val, option, 'target')}
                  onSelect={(val, option) => handleSelect(val, option, 'target')}
                  onSearch={handleChanage}
                  onFocus={() => beginSelect('target')}
                />
              ) : (
                <Select
                  showSearch
                  optionFilterProp="children"
                  onChange={() => {
                    updateState(draft => {
                      draft.selecting = '';
                    });
                  }}
                  onFocus={() => beginSelect('target')}
                >
                  {graphData.nodes.map(node => (
                    <Select.Option key={node.id} value={node.id}>
                      {node.name}({node.id})
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={2} style={{ lineHeight: '32px', textAlign: 'right' }}>
            <FormOutlined
              style={{ cursor: 'pointer', color: state.selecting === 'target' ? '#1890ff' : 'rgba(0, 0, 0, 0.65)' }}
              onClick={() => beginSelect('target')}
            />
          </Col>
        </Row>
        {/* <Form.Item
          name="direction"
          label={$i18n.get({ id: 'basic.components.PathAnalysis.Component.IsThereAnyDirection', dm: '是否有向' })}
        >
          <Switch
            checkedChildren={$i18n.get({ id: 'basic.components.PathAnalysis.Component.Directed', dm: '有向' })}
            unCheckedChildren={$i18n.get({ id: 'basic.components.PathAnalysis.Component.Undirected', dm: '无向' })}
            defaultChecked
          />
        </Form.Item> */}
        <Form.Item>
          <Row>
            <Col span={16}>
              <Button type="primary" onClick={handleSearch} style={{ width: '100%' }} loading={loading}>
                {$i18n.get({ id: 'basic.components.PathAnalysis.Component.QueryPath', dm: '查询路径' })}
              </Button>
            </Col>
            <Col offset="2" span={6} style={{ textAlign: 'right' }}>
              <Space size={'small'}>
                {state.isAnalysis && state.allNodePath.length > 0 && (
                  <FilterRule state={state} updateState={updateState} />
                )}

                <Button danger onClick={handleResetForm} icon={<DeleteOutlined />}></Button>
              </Space>
            </Col>
          </Row>
        </Form.Item>
      </Form>
      <div className="gi-path-analysis-path-list-container">
        {state.nodePath.length > 0 && (
          <Collapse
            defaultActiveKey={0}
            ghost={true}
            className="gi-collapse-container"
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          >
            {state.nodePath.map((path, index) => {
              return (
                <Panel
                  key={index}
                  header={$i18n.get(
                    { id: 'basic.components.PathAnalysis.Component.PathNumber', dm: `路径${index + 1}` },
                    { numebr: index + 1 },
                  )}
                  extra={
                    <PanelExtra pathId={index} highlightPath={state.highlightPath} onSwitchChange={onSwitchChange} />
                  }
                >
                  <Timeline>
                    {path.map(nodeId => {
                      const node = graph.findById(nodeId);
                      if (node) {
                        const { name } = node.getModel();
                        return <Timeline.Item>{(name || nodeId) as ReactNode}</Timeline.Item>;
                      } else {
                        const nodeConfig = sourceDataMap.nodes[nodeId];
                        const data = nodeConfig?.data || {};
                        return <Timeline.Item>{data[pathNodeLabel] || nodeId}</Timeline.Item>;
                      }
                    })}
                  </Timeline>
                </Panel>
              );
            })}
          </Collapse>
        )}

        {state.isAnalysis && state.nodePath.length === 0 && <Empty />}
      </div>
    </div>
  );
};

export default XlabPathAnalysis;
