## 01 `api/query/schema`

`POST` 查询子图的 Schema 接口

```js
const request = {
  subGraphName: 'xlab', // 需要查询的子图
};

const response = {
  success: true,
  data: {
    nodes: [
      {
        /** 节点类型 */
        nodeType: 'repo',
        /** 节点类型，通过业务数据（data）中的哪个字段映射的 */
        nodeTypeKeyFromProperties: 'label',
        /** 业务数据（data）中的字段类型，目前不支持嵌套 */
        properties: {
          star: 'number',
          createTime: 'date',
        },
      },
      {
        nodeType: 'user',
        nodeTypeKeyFromProperties: 'label',
        properties: {
          city: 'string',
          age: 'string',
        },
      },
    ],
    edges: [
      {
        /** 边类型 */
        edgeType: 'star',
        /** 边类型，通过业务数据（data）中的哪个字段映射的 */
        edgeTypeKeyFromProperties: 'label',
        /** 边上开端节点类型   */
        sourceNodeType: 'user',
        /** 边上目标节点类型 */
        targetNodeType: 'repo',
        /** 业务数据（data）中的字段类型，目前不支持嵌套 */
        properties: {
          time: 'date',
        },
      },
    ],
    metas: {
      /** 默认的标签映射字段 */
      defaultLabelField: 'name',
    },
  },
};
```

## 02 `api/query/fuzzy`

`POST` 模糊查询节点接口，用于用户输入的数据填充

```js
const request = {
  label: 'repo', // schema 类型
  value: 'antvis', // 模糊查询的值，比如 antvis
};

const response = {
  success: true,
  data: [
    {
      name: 'antvis/G6',
      id: 'yy123841',
      label: 'repo',
      properties: {
        city: 'hangzhou',
        star: 408,
        group: 'antvis',
      },
    },
    {
      name: 'antvis/G6VP',
      id: 'xx2123123',
      label: 'repo',
      properties: {
        city: 'hangzhou',
        star: 408,
        group: 'antvis',
      },
    },
  ];
}
```

## 03 `api/query/graph`

`POST` 查询子图

```js
const request = {
  label: 'repo', //查询的类型
  id: 'xx2123123', // id 值
  mode: 'node', // 查询节点(node)/边(edge)/子图(subGraph)
};

const response = {
  success: true,
  data: {
    nodes: [
      {
        id: 'xx2123123',
        name: 'antvis/G6VP',
        label: 'repo',
        properties: {
          city: 'hangzhou',
          star: 408,
          group: 'antvis',
        },
      },
    ],
    edges: [],
  },
};
```

## 04 `api/query/neighbors`

`POST` 查询邻居

```js
const request = {
  ids: ['xx2123123', 'yy123841'], // 多个 id 的节点的邻居的并集
  hops: 1, // 跳数
  filter: [
    {
      key: 'star',
      operator: 'gt',
      value: 100,
    },
    {
      key: 'label',
      operator: 'in',
      value: ['repo', 'user'],
    },
  ],
};

const response = {
  success: true,
  data: [
    {
      id: 'query.oneDagre',
      name: '查询关联的节点',
      label: 'repo',
      properties: {
        city: 'hangzhou',
        star: 408,
        group: 'antvis',
      },
    },
  ],
};
```

## 05 `api/query/path`

`POST` 查询两个节点之间 N 跳以内 / 最短路径

```js
const request = {
  sourceId: 'xx2123123', // 起点 id
  targetId: 'yy123841', // 终点 id
  directed: true, // 是否有向
  hops: 3, // 跳数，若为 0 则代表最短路径的查询
};

const response = {
  success: true,
  data: { // 路径子图
    nodes: [
      {
        id: 'xx2123123',
        name: 'antvis/G6VP',
        label: 'repo',
        properties: {
          city: 'hangzhou',
          star: 408,
          group: 'antvis',
        },
        {
          id: 'zz924308',
          name: 'antvis/Graphin',
          label: 'repo',
          properties: {
            city: 'hangzhou',
            star: 333,
            group: 'antvis',
          },
        },
        {
          id: 'yy123841',
          name: 'antvis/G6',
          label: 'repo',
          properties: {
            city: 'hangzhou',
            star: 10000,
            group: 'antvis',
          },
        },
      },
    ],
    edges: [{
      id: 'edge23434',
      source: 'xx2123123',
      target: 'zz924308',
      label: 'dependent',
      properties: {
        xx: 'xxx'
      }
    }, {
      id: 'edge15452',
      source: 'zz924308',
      target: 'yy123841',
      label: 'dependent',
      properties: {
        xx: 'xxx'
      }
    }],
  }
};
```

## 06 `api/query/graphHistory`

`POST` 查询指定节点指定属性在一段时间内的时序数据，或指定节点相关边（带过滤条件）数量在一段时间内的时序数据

```js
const request = {
  ids: ['xx2123123', 'yy123841'], // 多个节点/边 id
  timeRange: [1687762131571, 1687768056732], // 时间戳范围
  mode: 'nodeProperty', // 是否查询节点属性(nodeProperty)，为 'edgeProperty' 为查询边的属性，为 'edgeCount' 则代表相关边的数量历史
  fields: ['star', 'pr'], // 若 mode 为 'nodeProperty' 或 'edgeProperty' 的举例，即节点/边的属性名列表
  fields: [{ // 若 mode 为 'edgeCount' 的举例，相关边的过滤条件（且的关系）
    key: 'label', // 边的属性，label 为边类型
    operator: 'eq', // 等于
    value: 'pullRequest', // 边类型等于'pullRequest'
  }, {
    key: 'size', // 边的属性
    operator: 'eq', // 等于
    value: 'xs', // pullRequest 边 size 为 'xs' 的
  }]
};

const response = {
  success: true,
  data: [{
    id: 'xx2123123', // ids 中第一个 id 对应的时序结果
    value: [
      {
        timeStamp: 1687762142153,
        value: 50,
      },
      {
        timeStamp: 1687762162261,
        value: 100,
      },
    ]
  }, {
    id: 'yy123841', // ids 中第二个 id 对应的时序结果
    value: [
      {
        timeStamp: 1687762142153,
        value: 100,
      },
      {
        timeStamp: 1687762162261,
        value: 200,
      },
    ]
  }],
};
```
