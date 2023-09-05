import { Select, Tag, Image, Row, Col, Divider } from 'antd';
import React, { useState } from 'react';
import { debounce } from '@antv/util';
import { formatContent } from '../util';
import { SendOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import './index.less';

const DEFAULT_IMG = 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*A-nPRYPk_SsAAAAAAAAAAAAADmJ7AQ/original';

const TemplateCard = props => {
  const { info, onDemoChange, searchService } = props;
  const {
    title,
    desc,
    demos,
    actions,
    color = '#3b5999',
    isUser,
    searchHolder,
    img = DEFAULT_IMG,
    allowCustom = true,
  } = info;
  const [searchOptions, setSearchOptions] = useState<{ value: string; label: string }[]>([]);
  const [inputIds, setInputIds] = useState<string[]>([]);
  const [isFocus, setIsFocus] = useState<boolean>(false);

  const handleCustomSearch = useMemo(() => {
    const loadOptions = async content => {
      if (content) {
        const val = await searchService({ name: formatContent(content), isUser });
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
    };
    return debounce(loadOptions, 500);
  }, []);

  const handleChange = vals => {
    setIsFocus(vals?.length ? true : false);
    setInputIds(vals);
  };

  return (
    <div className="gi-xlabsearch-template-card">
      <h3 className="gi-xlabsearch-template-title">{title}</h3>
      <div>{desc}</div>
      <Divider type="horizontal" />
      <Image className="gi-xlabsearch-template-img" src={img} preview={false} />
      <Divider type="horizontal" />
      <Row className="gi-xlabsearch-template-demos" justify="start">
        <Col className="gi-xlabsearch-template-label" span={6}>
          案例：
        </Col>
        <Col span={18}>
          {demos.map(demo => {
            return (
              <Tag
                className="gi-xlabsearch-demo-tag"
                key={demo.id}
                color={color}
                onClick={() => onDemoChange({ ...demo, actions })}
              >
                {demo.title}
              </Tag>
            );
          })}
        </Col>
      </Row>
      {allowCustom ? (
        <Row className="gi-xlabsearch-template-custom" justify="start">
          <Col className="gi-xlabsearch-template-label" span={8}>
            自定义{isUser ? '用户' : '仓库'}：
          </Col>
          <Col span={14}>
            <Select
              mode="multiple"
              size="small"
              style={{ width: '100%' }}
              filterOption={false}
              placeholder={searchHolder}
              onChange={handleChange}
              onSearch={handleCustomSearch}
              options={searchOptions}
              onFocus={() => {
                if (inputIds?.length) setIsFocus(true);
              }}
              onBlur={() => setIsFocus(false)}
            />
          </Col>
          <Col span={1} offset={1}>
            <SendOutlined
              onClick={() => onDemoChange({ [isUser ? 'userIds' : 'repoIds']: inputIds, actions })}
              style={{ color: isFocus ? 'var(--primary-color)' : 'unset' }}
              rev={undefined}
            />
          </Col>
        </Row>
      ) : (
        ''
      )}
    </div>
  );
};

export default TemplateCard;
