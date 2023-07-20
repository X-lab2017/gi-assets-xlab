import { useContext, utils } from '@antv/gi-sdk';
import { Input, AutoComplete, Select } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { debounce } from '@antv/util';
import { formatContent } from './util';
import { GraphData } from '@antv/g6';
import './index.less';
import $i18n from '../../i18n';

const { getPositionStyles } = utils;
const { Option } = Select;

const XlabSearch = props => {
  const { searchServiceId, cypherServiceId, placement, offset, width = '100%', size = 'large' } = props;
  const { graph, services, updateData } = useContext();
  const searchService = utils.getService(services, searchServiceId);
  const queryService = utils.getService(services, cypherServiceId);
  if (!searchService || !queryService) {
    return null;
  }

  const [type, setType] = useState('repo');
  const [loading, setLoading] = useState(false);
  const [searchOptions, setSearchOptions] = useState<{}[]>([]);
  const [currentContent, setCurrentContent] = useState('');

  const handleChanage = debounce(async content => {
    setLoading(true);
    const val = await searchService({ name: formatContent(content), isUser: type === 'user' });
    if (val.data?.result) {
      const nodes = JSON.parse(val.data.result);
      if (nodes) {
        setSearchOptions(
          Object.keys(nodes).map(id => ({
            value: id,
            label: `${nodes[id]}(${id})`,
          })),
        );
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
      const schemaType = type === 'repo' ? 'github_repo' : 'github_user';
      const statement = `MATCH (n:${schemaType} {id:${val}}) RETURN n`;
      const resultData = await queryService({
        value: statement,
        limit: 1,
      });
      if (resultData.nodes?.length) {
        const graphData = graph.save() as GraphData;
        const newNodes = [...(graphData.nodes || []), resultData.nodes[0]];
        updateData({
          ...graphData,
          nodes: newNodes,
        });
      }
      setLoading(false);
    }
  }, 500);

  useEffect(() => {
    // @ts-ignore
    handleChanage(currentContent);
  }, [type]);

  const positionStyles = getPositionStyles(placement, offset);

  let iconHeight = '22px';
  if (size === 'large') iconHeight = '40px';
  else if (size === 'middle') iconHeight = '32px';

  return (
    <div>
      <Input.Group compact style={{ ...positionStyles, width }} size={size}>
        <Select
          className="gi-xlabsearch-type-select"
          defaultValue="repo"
          style={{ width: '80px', color: 'var(--text-color-2)' }}
          size={size}
          onChange={setType}
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
          onSearch={handleChanage}
        />

        {
          <span
            className="gi-xlabsearch-icon"
            style={{ width: iconHeight, height: iconHeight, lineHeight: iconHeight }}
          >
            {loading ? <LoadingOutlined /> : <SearchOutlined />}
          </span>
        }
      </Input.Group>
    </div>
  );
};

export default XlabSearch;
