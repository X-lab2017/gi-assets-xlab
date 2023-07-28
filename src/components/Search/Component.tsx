import { useContext, utils } from '@antv/gi-sdk';
import { Input, AutoComplete, Select, Tag, Image } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { debounce } from '@antv/util';
import { formatContent } from '../util';
import { GraphData } from '@antv/g6';
import './index.less';
import $i18n from '../../i18n';

const { getPositionStyles } = utils;
const { Option } = Select;
const LOCAL_STORAGE_HISTORY_KEY = 'GI-XLABSEARCH-HISTORY';

const XlabSearch = props => {
  const { searchServiceId, cypherServiceId, placement, offset, width = '100%', size: propSize = 'large' } = props;
  const { data, graph, services, updateData } = useContext();
  const searchService = utils.getService(services, searchServiceId);
  const queryService = utils.getService(services, cypherServiceId);
  if (!searchService || !queryService) {
    return null;
  }

  const [type, setType] = useState('repo');
  const [loading, setLoading] = useState(false);
  const [searchOptions, setSearchOptions] = useState<{}[]>([]);
  const [currentContent, setCurrentContent] = useState('');
  const [firstSearch, setFirstSearch] = useState(true);

  const handleChange = debounce(async content => {
    setLoading(true);
    if (content) {
      const val = await searchService({ name: formatContent(content), isUser: type === 'user' });
      if (val.success) {
        const { nodes } = val.data;
        if (nodes) {
          setSearchOptions(
            Object.keys(nodes).map(id => ({
              value: id,
              label: `${nodes[id]}(${id})`,
            })),
          );
        }
      }
    }
    setLoading(false);
    setCurrentContent(content);
  }, 500);

  const handleSelect = debounce(async (val, option) => {
    if (!option?.value) return;
    // find same node on the graph first
    const graphNodes = graph.getNodes().filter(node => (node.getModel() as any).properties.id?.toString() === val);
    if (graphNodes.length) {
      graph.focusItems(graphNodes);
    } else {
      // add node to the origin data
      setLoading(true);
      const statement = `MATCH (n) where id(n) = ${val} RETURN n`;
      const resultData = await queryService({
        value: statement,
        limit: 1,
      });
      if (resultData.nodes?.length) {
        const graphData = graph.save() as GraphData;
        const newNode = resultData.nodes[0];
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

  const hanldeClickHistory = id => {
    (handleSelect as any)(id, { value: id });
  };

  useEffect(() => {
    // @ts-ignore
    handleChange(currentContent);
  }, [type]);

  useEffect(() => {
    if (data.nodes?.length) setFirstSearch(false);
  }, [data]);

  const positionStyles = getPositionStyles(placement, offset);

  const size = firstSearch ? 'large' : propSize;
  let iconHeight = '22px';
  if (size === 'large') iconHeight = '40px';
  else if (size === 'middle') iconHeight = '32px';

  const searchBarStyle = { ...positionStyles, width };

  const historyNames = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY) || '[]');

  return (
    <div
      className={firstSearch ? 'gi-xlabsearch-wrapper-first' : 'gi-xlabsearch-wrapper'}
      style={firstSearch ? {} : searchBarStyle}
    >
      {firstSearch ? (
        <Image
          className="gi-xlabsearch-first-search-img"
          src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*A-nPRYPk_SsAAAAAAAAAAAAADmJ7AQ/original"
          preview={false}
        />
      ) : (
        ''
      )}
      <Input.Group
        className="gi-xlabsearch-searchbar"
        compact
        style={firstSearch ? { top: '20px', left: '10%', width: '80%' } : {}}
        size={size}
      >
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
            <SearchOutlined />
          </span>
        }
      </Input.Group>
      {firstSearch && historyNames.length ? (
        <div className="gi-xlabsearch-history">
          历史记录：
          {historyNames.map(({ name, id }) => (
            <Tag className="gi-xlabsearch-history-tag" color="default" onClick={() => hanldeClickHistory(id)}>
              {name}
            </Tag>
          ))}
        </div>
      ) : (
        ''
      )}
      {loading ? (
        <div className={`gi-xlabsearch-loading ${firstSearch ? 'gi-xlabsearch-loading-first' : ''}`}>
          <LoadingOutlined />
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default XlabSearch;
