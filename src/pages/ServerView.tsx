import { Button, Drawer } from 'antd';
import * as React from 'react';
import Server from '../services/Server';

interface ServerViewProps {}

const ServerView: React.FunctionComponent<ServerViewProps> = props => {
  const [open, setOpen] = React.useState<boolean>(false);
  return (
    <div style={{ position: 'absolute', bottom: '0px', background: 'grey', textAlign: 'center', zIndex: 999 }}>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        模拟 自定义服务：连接引擎，模拟这是 GI 站点的外围
      </Button>
      <Drawer
        title="模拟 G6VP 平台的导入数据"
        open={open}
        visible={open}
        width={'80%'}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Server
          updateGISite={() => {
            location.reload();
          }}
        />
      </Drawer>
    </div>
  );
};

export default ServerView;
