import { useContext, utils } from '@antv/gi-sdk';
import { useMemoizedFn } from 'ahooks';
import { Chart } from '@antv/g2';
import { LoadingOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Empty, Tooltip, message } from 'antd';
import Overview from './Overview';
import { COLORS, createChart, getTypeNodeModels, DETAIL_SCHEMA_TYPES } from './util';
import $i18n from '../../i18n';
import './index.less';

const { getSchemaGraph } = utils;

const charts: { [key: string]: Chart | undefined } = {
  fork: undefined,
  issue: undefined,
  pr: undefined,
  star: undefined,
  nodeType: undefined,
  edgeType: undefined,
};

const cachedStateicData = {};

const XlabPropertiesPanel = props => {
  const { serviceId, schemaServiceId, countServiceId } = props;
  const { graph, services, data, config } = useContext();
  const propertiesService = utils.getService(services, serviceId);
  const schemaService = utils.getService(services, schemaServiceId);
  const countService = utils.getService(services, countServiceId);
  if (!propertiesService) return null;

  const [models, setModels] = useState([] as any);
  const [totals, setTotals] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);
  const [colorMap, setColorMap] = useState({});
  const [chartsReady, setChartsReady] = useState({});
  const [userInfos, setUserInfos] = useState({});

  const containerRefs = {
    Fork: useRef<HTMLDivElement>(null),
    Issue: useRef<HTMLDivElement>(null),
    PR: useRef<HTMLDivElement>(null),
    Star: useRef<HTMLDivElement>(null),
    Code: useRef<HTMLDivElement>(null),
    Comments: useRef<HTMLDivElement>(null),
    Commits: useRef<HTMLDivElement>(null),
    OpenRank: useRef<HTMLDivElement>(null),
    Activity: useRef<HTMLDivElement>(null),
    // Ranking: useRef<HTMLDivElement>(null),
    UserRanking: useRef<HTMLDivElement>(null),
    RepoRanking: useRef<HTMLDivElement>(null),
  };
  const overviewRefs = {
    nodeType: useRef<HTMLDivElement>(null),
    edgeType: useRef<HTMLDivElement>(null),
    OpenRank: useRef<HTMLDivElement>(null),
    Activity: useRef<HTMLDivElement>(null),
  };

  const DETAIL_FIELDS = {
    Fork: ['fork'],
    Issue: ['closed_issue', 'opened_issue', 'issue'],
    PR: ['merged_pr', 'opened_pr', 'pr'],
    Star: ['star'],
    Code: ['code_additions', 'code_changed_files', 'code_deletions'],
    Comments: ['comments'],
    Commits: ['commits'],
  };

  const STATIC_FIELD = {
    OpenRank: 'openrank',
    Activity: 'activity',
  };

  useEffect(() => {
    if (!graph || graph.destroyed) return;
    graph.on('canvas:click', handleCanvasClick);
    graph.on('nodeselectchange', handleNodeSelect);
    return () => {
      graph.off('canvas:click', handleCanvasClick);
      graph.off('canvas:click', handleCanvasClick);
    };
  }, [graph]);

  useEffect(() => {
    const repoUserModels = getTypeNodeModels(models, DETAIL_SCHEMA_TYPES);
    if (!repoUserModels.length) return;

    (async () => {
      setLoading(true);
      const chartDatas = {};
      const dotColorMap = {};
      const orderTypes: string[] = [];
      const singleNode = repoUserModels.length === 1;

      const promises: Promise<any>[] = repoUserModels.map(async (model, i) => {
        const { id, name, nodeType } = model;
        dotColorMap[id] = COLORS[i % COLORS.length];
        orderTypes.push(`${name}(${id})`);
        const val = await propertiesService({ id, schemaType: nodeType === 'github_repo' ? 'repo' : 'user' });
        if (val.success) {
          const value = val.data;
          const totalMap = {};
          Object.keys(DETAIL_FIELDS).forEach(fieldName => {
            const fields = DETAIL_FIELDS[fieldName];
            totalMap[fieldName] = totalMap[fieldName] || 0;
            fields.forEach(key => {
              if (!value[key]) return;
              const { monthly, total = 0 } = value[key];
              totalMap[fieldName] += total;
              if (monthly) {
                chartDatas[fieldName] = chartDatas[fieldName] || [];
                chartDatas[fieldName] = chartDatas[fieldName].concat(
                  Object.keys(monthly).map(date => ({
                    date,
                    count: monthly[date],
                    modelKey: `${name}(${id})`,
                    subType: key,
                    name,
                    id,
                  })),
                );
              }
            });
          });
          setTotals(singleNode ? totalMap : undefined);
        }
        return val;
      });

      const userNode = getTypeNodeModels(models, ['github_user']) || [];
      const infos = {};
      const userInfoPromises: Promise<any>[] = userNode.map(async model => {
        const response = await fetch(`https://oss.x-lab.info/open_digger/github/${model.name}/meta.json`);
        const fetchedData = await response.json();
        const { bio, location, company } = fetchedData.info;
        infos[model.id] = { '📝 bio': bio, '📍 location': location, '🏠 company': company };
        return fetchedData;
      });

      const staticPromises: Promise<any>[] = repoUserModels
        .map(async ({ id, name }) => {
          const modelKey = `${name}(${id})`;
          return Object.keys(STATIC_FIELD).map(async fieldName => {
            chartDatas[fieldName] = chartDatas[fieldName] || [];
            const key = STATIC_FIELD[fieldName];
            if (cachedStateicData[modelKey]?.[fieldName]) {
              const data = cachedStateicData[modelKey][fieldName];
              chartDatas[fieldName] = chartDatas[fieldName].concat(
                Object.keys(data)
                  .filter(date => new Date(date).toString() !== 'Invalid Date')
                  .map(date => ({
                    date,
                    count: data[date],
                    modelKey,
                    subType: key,
                    name,
                    id,
                  })),
              );
              return;
            }
            try {
              const response = await fetch(`https://oss.x-lab.info/open_digger/github/${name}/${key}.json`);
              const fetchedData = await response.json();
              cachedStateicData[modelKey] = cachedStateicData[modelKey] || {};
              cachedStateicData[modelKey][key] = fetchedData;
              chartDatas[fieldName] = chartDatas[fieldName].concat(
                Object.keys(fetchedData)
                  .filter(date => new Date(date).toString() !== 'Invalid Date')
                  .map(date => ({
                    date,
                    count: fetchedData[date],
                    modelKey,
                    subType: key,
                    name,
                    id,
                  })),
              );
              return fetchedData;
            } catch (error) {
              console.warn(`${name} 的 ${key} 文件获取失败`);
            }
          });
        })
        .flat();
      await Promise.all([...promises, ...userInfoPromises, ...staticPromises]);

      setUserInfos(infos);

      Object.keys(DETAIL_FIELDS)
        .concat(Object.keys(STATIC_FIELD))
        .forEach(fieldName => {
          destroyChart(fieldName, containerRefs[fieldName]);
          if (!chartDatas[fieldName]?.length) {
            setChartsReady(old => {
              return {
                ...old,
                [fieldName]: false,
              };
            });
            return;
          }
          chartDatas[fieldName].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          charts[fieldName] = createChart(
            fieldName,
            chartDatas[fieldName],
            containerRefs[fieldName].current,
            orderTypes,
            models.length === 1 && ['Issue', 'PR', ' Code'].includes(fieldName),
          );
          setChartsReady(old => {
            return {
              ...old,
              [fieldName]: true,
            };
          });
        });

      if (!singleNode) setColorMap(dotColorMap);
      setLoading(false);
    })();
  }, [models]);

  useEffect(() => {
    if (!graph || graph.destroyed) return;
    if (!data.nodes.length) {
      setModels([]);
    }
  }, [data, graph]);

  const handleNodeSelect = e => {
    const { selectedItems, select } = e;
    if (!select || !selectedItems?.nodes?.length) return;
    destroyChart('nodeType', overviewRefs.nodeType);
    destroyChart('edgeType', overviewRefs.edgeType);
    const showModels = selectedItems.nodes
      .map(item => {
        const { id, pid, properties, nodeType, name } = item.getModel();
        const showProperties = {
          name,
          nodeType,
          ...properties,
          pid,
          id,
        };
        Object.keys(showProperties).forEach(field => {
          if (showProperties[field] === null) delete showProperties[field];
          if (['closed_at', 'created_at'].includes(field)) {
            const date = new Date(showProperties[field] * 1000);
            showProperties[field] = date.toLocaleDateString();
          }
        });
        return showProperties;
      })
      .sort((a, b) => {
        const aHasDetail = DETAIL_SCHEMA_TYPES.includes(a.nodeType) ? 1 : -1;
        const bHasDetail = DETAIL_SCHEMA_TYPES.includes(b.nodeType) ? 1 : -1;
        return bHasDetail - aHasDetail;
      });

    setModels(showModels);
  };

  const handleCanvasClick = useMemoizedFn(() => {
    if (models.length) {
      setModels([]);
      setColorMap({});
    }
  });

  const handleCopyText = text => {
    const copyipt = document.createElement('input');
    copyipt.setAttribute('value', text);
    document.body.appendChild(copyipt);
    copyipt.select();
    document.execCommand('copy');
    document.body.removeChild(copyipt);
    message.success(
      $i18n.get({
        id: 'gi-assets-xlab.components.XlabPropertiesPanel.Component.TheTextHasBeenCopied',
        dm: '文本已复制到剪贴板',
      }),
    );
  };

  const destroyChart = (key, ref) => {
    if (!charts[key]) return;
    charts[key]?.clear();
    if (ref?.current) {
      ref.current.childNodes.forEach(child => ref.current.removeChild(child));
      ref.current.innerHTML = '';
    }
  };

  const handleHighlightChart = (evt, model) => {
    evt.stopPropagation();
    if (models.length < 2) return;
    const { name, id } = model;
    Object.keys(DETAIL_FIELDS)
      .concat(Object.keys(STATIC_FIELD))
      .forEach(fieldName => {
        charts[fieldName]?.emit('element:unhighlight', {});
        charts[fieldName]?.emit('element:highlight', {
          data: { data: { modelKey: `${name}(${id})` } },
        });
      });
  };
  const handleUnhighlightChart = () => {
    Object.keys(DETAIL_FIELDS)
      .concat(Object.keys(STATIC_FIELD))
      .forEach(fieldName => {
        charts[fieldName]?.emit('element:unhighlight', {});
      });
  };

  const hasNoCharts = useMemo(() => totals && !Object.values(totals).find(num => num !== 0), [totals]);

  return (
    <div className="gi-xlab-panel">
      {models.length ? (
        <>
          <div className="gi-xlab-panel-detail-wrapper">
            {models.map(model => {
              const { id, nodeType, name, pid } = model;
              const url = DETAIL_SCHEMA_TYPES.includes(nodeType) ? `https://github.com/${name}` : undefined;
              return (
                <div
                  className={
                    models?.length === 1
                      ? 'gi-xlab-panel-detail-one'
                      : 'gi-xlab-panel-detail-one gi-xlab-panel-detail-multi'
                  }
                  onMouseEnter={evt => handleHighlightChart(evt, model)}
                  onMouseLeave={handleUnhighlightChart}
                >
                  {DETAIL_SCHEMA_TYPES.includes(nodeType) ? (
                    <img
                      className="gi-xlab-panel-detail-title"
                      src={`https://avatars.githubusercontent.com/${nodeType === 'github_user' ? name : id}`}
                    />
                  ) : (
                    ''
                  )}
                  <Tooltip title={name || id}>
                    <p className={`gi-xlab-panel-detail-item`}>
                      {colorMap[id] ? (
                        <span className="gi-xlab-panel-detail-color-dot" style={{ background: colorMap[id] }} />
                      ) : (
                        ''
                      )}
                      <a
                        href={url}
                        target="_blank"
                        className={`gi-xlab-panel-detail-title ${!url ? 'gi-xlab-panel-detail-title-disabled' : ''}`}
                      >
                        {name || id}
                      </a>
                    </p>
                  </Tooltip>
                  <div className="gi-xlab-panel-detail-properties-wrapper">
                    {userInfos[id]
                      ? Object.keys(userInfos[id]).map(field => (
                          <Tooltip title={`${field}: ${userInfos[id][field]}`}>
                            <p
                              className="gi-xlab-panel-detail-item"
                              onClick={() => handleCopyText(userInfos[id][field])}
                            >
                              {field}: {userInfos[id][field]}
                            </p>
                          </Tooltip>
                        ))
                      : ''}
                    {Object.keys(model)
                      .map(field =>
                        ['name', 'id', 'nodeType', 'pid'].includes(field) ? undefined : (
                          <Tooltip title={`${field}: ${model[field]}`}>
                            <p className="gi-xlab-panel-detail-item" onClick={() => handleCopyText(model[field])}>
                              {field}: {model[field]}
                            </p>
                          </Tooltip>
                        ),
                      )
                      .filter(Boolean)}
                  </div>
                </div>
              );
            })}
          </div>

          {loading ? (
            <div className="gi-xlab-panel-chart-wrapper">
              <LoadingOutlined rev={undefined} />
            </div>
          ) : (
            ''
          )}

          {getTypeNodeModels(models, DETAIL_SCHEMA_TYPES).length ? (
            <div className="gi-xlab-panel-chart-wrapper" style={{ visibility: loading ? 'hidden' : 'visible' }}>
              {hasNoCharts ? (
                <Empty
                  className="gi-xlab-panel-empty"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={$i18n.get({
                    id: 'gi-assets-xlab.components.XlabPropertiesPanel.Component.NoCharts',
                    dm: '该节点暂无指标',
                  })}
                />
              ) : (
                ''
              )}
              {Object.keys(STATIC_FIELD).map(key => (
                <div
                  className="gi-xlab-panel-chart-container"
                  style={chartsReady[key] ? {} : { visibility: 'hidden', height: 0 }}
                >
                  <h4 className="gi-xlab-panel-chart-title">{`${key} Trending(from X-Lab)`}</h4>
                  <div
                    className={`gi-xlab-panel-${key.toLowerCase()}-chart gi-xlab-panel-chart`}
                    ref={containerRefs[key]}
                  ></div>
                </div>
              ))}
              {Object.keys(DETAIL_FIELDS).map(key => (
                <div
                  className="gi-xlab-panel-chart-container"
                  style={chartsReady[key] ? {} : { visibility: 'hidden', height: 0 }}
                >
                  <h4 className="gi-xlab-panel-chart-title">{`${key} Trending${totals ? `(${totals[key]})` : ''}`}</h4>
                  <div
                    className={`gi-xlab-panel-${key.toLowerCase()}-chart gi-xlab-panel-chart`}
                    ref={containerRefs[key]}
                  ></div>
                </div>
              ))}
            </div>
          ) : (
            ''
          )}
        </>
      ) : (
        <Overview
          models={models}
          chartsReady={chartsReady}
          charts={charts}
          cachedStateicData={cachedStateicData}
          containerRefs={containerRefs}
          overviewRefs={overviewRefs}
          schemaService={schemaService}
          countService={countService}
          propertiesService={propertiesService}
          setLoading={setLoading}
          setChartsReady={setChartsReady}
          destroyChart={destroyChart}
        />
      )}
    </div>
  );
};

export default XlabPropertiesPanel;
