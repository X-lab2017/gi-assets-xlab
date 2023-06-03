export default {
  nodeModulesTransform: {
    type: 'none',
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@antv/graphin': 'Graphin',
    '@antv/g6': 'G6',
    antd: 'antd',
    '@ant-design/icons': 'icons',
    moment: 'moment',
    '@antv/g2plot': 'G2Plot',
    localforage: 'localforage',
  },
  headScripts: [
    'https://gw.alipayobjects.com/os/lib/react/17.0.2/umd/react.production.min.js',
    'https://gw.alipayobjects.com/os/lib/react-dom/17.0.2/umd/react-dom.production.min.js',
  ],
  scripts: [
    'https://gw.alipayobjects.com/os/lib/localforage/1.10.0/dist/localforage.min.js',

    'https://gw.alipayobjects.com/os/lib/antv/g6/4.8.14/dist/g6.min.js',
    'https://gw.alipayobjects.com/os/lib/antv/graphin/2.7.16/dist/graphin.min.js',
    /** Antd */
    'https://gw.alipayobjects.com/os/lib/lodash/4.17.21/lodash.min.js',
    'https://gw.alipayobjects.com/os/lib/moment/2.29.1/moment.js',
    'https://gw.alipayobjects.com/os/lib/ant-design/icons/4.6.4/dist/index.umd.min.js',
    'https://gw.alipayobjects.com/os/lib/antd/4.24.2/dist/antd.min.js',

    /**  G2Plot */
    'https://gw.alipayobjects.com/os/lib/antv/g2plot/2.4.16/dist/g2plot.min.js',

    /** GI */
    'https://gw.alipayobjects.com/os/lib/antv/gi-sdk/2.3.3/dist/index.min.js',
  ],
  styles: [
    'https://gw.alipayobjects.com/os/lib/antv/graphin/2.7.16/dist/index.css',
    'https://gw.alipayobjects.com/os/lib/antv/gi-sdk/2.3.3/dist/index.css',
    'https://gw.alipayobjects.com/os/lib/antv/gi-theme-antd/0.1.0/dist/light.css',
    
  ],
};
