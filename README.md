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

`POST` 模糊查询接口，用于用户输入的数据填充

```js
const request = {
  value: 'antvis', // 迷糊查询的值，比如 antvis
};

const response = {
  success: true,
  data: [
    {
      name: 'antvis/G6',
      id: 'antvis/G6',
      label: 'repo',
    },
    {
      name: 'antvis/G6VP',
      id: 'antvis/G6VP',
      label: 'repo',
    },
  ];
}
```

## 03 `api/query/graph`

`POST` 查询节点

```js
const request = {
  label: 'repo', //查询的类型
  value: 'antvis/G6VP', // 具体的值，比如 antvis/G6VP
  mode: 'element',
};

const response = {
  success: true,
  data: {
    nodes: [
      {
        id: 'antvis/G6VP',
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
  ids: ['antvis/G6VP', 'antvis/G6'],
  spe: 1,
  filter: [
    {
      key: 'star',
      operator: 'gt',
      value: 100,
    },
  ],
};

const response = {
  success: true,
  data: [
    {
      id: 'query.oneDagre',
      name: '查询关联的节点',
    },
  ],
};
```
