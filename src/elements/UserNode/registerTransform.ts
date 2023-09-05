import type { GINodeConfig } from '@antv/gi-sdk';
import { Utils } from '@antv/graphin';

const getLabel = (data, LABEL_KEYS) => {
  return LABEL_KEYS.map((d: string) => {
    /**
     * 兼容性处理：原先的label 逻辑是 ${type}.${properpertiesKey}
     * 现在改为 ${type}^^${properpertiesKey}
     */
    const [newNodeType, newLabelKey] = d.split('^^');
    const [oldNodeType, oldLabelKey] = d.split('.');
    const key = newLabelKey || oldLabelKey || 'id';
    return data[key];
  })
    .filter(d => d)
    .join('\n');
};

const defaultNodeTheme = {
  primaryColor: '#FF6A00',
  nodeSize: 26,
  mode: 'light' as 'light' | 'dark',
};
const defaultNodeStyles = Utils.getNodeStyleByTheme(defaultNodeTheme);
const { style, status } = defaultNodeStyles;
const { keyshape, halo, label } = style;

export const defaultConfig = {
  size: defaultNodeTheme.nodeSize,
  color: defaultNodeTheme.primaryColor,
  label: [],
  advanced: {
    keyshape: {
      ...keyshape,
      fillOpacity: 0.8,
    },
    label: {
      ...label,
      opacity: 1,
      visible: true,
    },
    halo: {
      ...halo,
      visible: false,
      lineWidth: 0,
    },
  },
  status: {
    minZoom: {
      label: {
        opacity: 0,
      },
      icon: {
        opacity: 0,
      },
      badges: {
        opacity: 0,
      },
    },
  },
};
export type NodeConfig = typeof defaultConfig;

/** 数据映射函数  需要根据配置自动生成*/

/** 数据映射函数  需要根据配置自动生成*/
const transform = (nodes, nodeConfig: GINodeConfig, reset?: boolean) => {
  try {
    /** 解构配置项 */

    const {
      color,
      size,
      label: LABEL_KEYS,
      advanced,
      status: userStatus,
    } = {
      ...defaultConfig,
      ...nodeConfig.props,
    } as NodeConfig;

    let isBug = false;
    //@ts-ignore
    if (!Object.is(advanced)) {
      isBug = true;
    }
    const { halo } = isBug ? defaultConfig.advanced : advanced;

    const transNodes = nodes.map(node => {
      // properties
      const data = node.data || node.properties || node;

      const keyshape = {
        ...advanced.keyshape,
        fill: color,
        stroke: color,
        size: size,
      };
      advanced.keyshape = keyshape;
      const LABEL_VALUE = getLabel(data, LABEL_KEYS);

      const label = {
        ...advanced.label,
        value: advanced.label.visible ? LABEL_VALUE : '',
      };

      let preStyle = (node && node.style) || {};
      if (reset) {
        preStyle = {};
      }

      const styleByConfig = {
        keyshape,
        label,
        halo,
        status: {
          ...status,
          ...userStatus,
          highlight: {
            keyshape: {
              lineWidth: 4,
              fillOpacity: 0.6,
            },
          },
          active: {
            halo: {
              visible: true,
            },
            keyshape: {
              lineWidth: 5,
            },
          },
          /** 扩散的状态 */
          query_start: {
            halo: {
              visible: true,
              stroke: color,
              lineWidth: 4,
              lineDash: [8, 8],
            },
          },
          query_normal: {
            halo: {
              visible: true,
              stroke: color,
              lineWidth: 1,
              lineDash: [8, 8],
            },
          },
        },
      };

      return {
        ...node,
        id: node.id,
        data,
        nodeType: node.nodeType || 'UNKNOW',
        type: 'xlab-user-node',
        // 数据中的style还是优先级最高的
        style: { ...styleByConfig, ...preStyle },
      };
    });
    return transNodes;
  } catch (error) {
    console.error('parse transform error:', error);
    return nodes;
  }
};
export default transform;
