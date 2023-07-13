import { EngineBanner, utils } from '@antv/gi-sdk';
import { Button, Col, Form, Input, Row } from 'antd';
import * as React from 'react';
import { GI_SERVICE_SCHEMA } from './Initializer';
import $i18n from '../i18n';
const { setServerEngineContext, getServerEngineContext } = utils;

interface ServerProps {
  updateGISite: (params: any) => void;
}

const DEFAULT_INFO = {
  initialQuery:
    'https://xlab-open-source.oss-cn-beijing.aliyuncs.com/zhicheng-ning/sample-data/mock-graph-data-for-gi-assets-xlab.json',
  schemaQuery: '',
  propertiesQuery: '',
  neighborQuery: '',
};

const Server: React.FunctionComponent<ServerProps> = props => {
  const { updateGISite } = props;

  const [form] = Form.useForm();
  const [isLoading, setLoading] = React.useState(false);

  React.useEffect(() => {
    form.setFieldsValue(getServerEngineContext(DEFAULT_INFO));
  }, []);

  const handleStart = async () => {
    setLoading(true);
    const values = await form.validateFields();
    setServerEngineContext(values);
    const schema = await GI_SERVICE_SCHEMA.service();
    const engineContext = {
      engineId: 'MyServer',
      ...values,
    };
    setServerEngineContext(engineContext);
    setLoading(false);
    updateGISite({
      engineId: 'MyServer',
      schemaData: schema,
      engineContext,
    });
  };

  return (
    <div>
      <EngineBanner
        logo="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*XfClS7s1anIAAAAAAAAAAAAADmJ7AQ/original"
        title={$i18n.get({ id: 'gi-assets-xlab.src.services.Server.CustomService', dm: '自定义服务' })}
        desc={$i18n.get({
          id: 'gi-assets-xlab.src.services.Server.ThisIsMyCustomService',
          dm: '这个是我的自定义服务，它的引擎 ID 为 MyServer，它将复写原先 G6VP 平台的初始化查询，图模型查询，邻居查询，属性信息查询等服务',
        })}
      />

      <Form name="form" form={form}>
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <Form.Item
              label={$i18n.get({ id: 'gi-assets-xlab.src.services.Server.InitializeAQuery', dm: '初始化查询' })}
              name="initialQuery"
              rules={[
                {
                  required: true,
                  message: $i18n.get({
                    id: 'gi-assets-xlab.src.services.Server.ToInitializeTheQueryAddress',
                    dm: '初始化查询地址，必须填写!',
                  }),
                },
              ]}
            >
              <Input
                placeholder={$i18n.get({
                  id: 'gi-assets-xlab.src.services.Server.EnterTheInitializationQueryAddress',
                  dm: '请输入 初始化查询地址',
                })}
              />
            </Form.Item>
            <Form.Item
              label={$i18n.get({ id: 'gi-assets-xlab.src.services.Server.GraphModelQuery', dm: '图模型查询' })}
              name="schemaQuery"
            >
              <Input
                placeholder={$i18n.get({
                  id: 'gi-assets-xlab.src.services.Server.ItCanBeEmptyBy',
                  dm: '可以为空，默认前端根据初始化查询数据，自动计算图模型',
                })}
              />
            </Form.Item>
            <Form.Item
              label={$i18n.get({ id: 'gi-assets-xlab.src.services.Server.PropertyQuery', dm: '属性查询' })}
              name="propertiesQuery"
            >
              <Input
                placeholder={$i18n.get({
                  id: 'gi-assets-xlab.src.services.Server.ItCanBeEmptyBy.1',
                  dm: '可以为空，默认将把节点或边的数据展示在属性面板中',
                })}
              />
            </Form.Item>
            <Form.Item
              label={$i18n.get({ id: 'gi-assets-xlab.src.services.Server.NeighborQuery', dm: '邻居查询' })}
              name="neighborQuery"
            >
              <Input
                placeholder={$i18n.get({
                  id: 'gi-assets-xlab.src.services.Server.CanBeEmptyByDefault',
                  dm: '可以为空，默认 MOCK 邻居查询数据',
                })}
              />
            </Form.Item>
            <Form.Item>
              <Button style={{ width: '100%' }} onClick={handleStart} type="primary" loading={isLoading}>
                {$i18n.get({ id: 'gi-assets-xlab.src.services.Server.StartAnalysis', dm: '开始分析' })}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export { ServerProps };
export default Server;
