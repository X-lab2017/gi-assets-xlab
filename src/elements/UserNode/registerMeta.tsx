import $i18n from '../../i18n';

const registerMeta = context => {
  const { schemaData } = context;

  return {
    type: 'object',
    properties: {
      size: {
        title: $i18n.get({ id: 'basic.elements.SimpleNode.registerMeta.Size', dm: '大小' }),
        type: 'number',
        'x-decorator': 'FormItem',
        'x-component': 'NumberPicker',
        default: 26,
      },
      color: {
        title: $i18n.get({ id: 'basic.elements.SimpleNode.registerMeta.Color', dm: '颜色' }),
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'ColorInput',
        default: '#FF6A00',
      },
      label: {
        title: $i18n.get({ id: 'basic.elements.SimpleNode.registerMeta.Text', dm: '文本' }),
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'GroupSelect',
        'x-component-props': {
          mode: 'multiple',
          schemaData: schemaData.nodes,
        },
      },
      advancedPanel: {
        type: 'void',
        'x-decorator': 'FormItem',
        'x-component': 'FormCollapse',
        'x-component-props': {
          className: 'gi-assets-elements-advance-panel',
          // style: { background: 'blue' },
          ghost: true,
        },
        properties: {
          advanced: {
            type: 'object',
            'x-component': 'FormCollapse.CollapsePanel',
            'x-component-props': {
              header: $i18n.get({
                id: 'basic.elements.SimpleNode.registerMeta.AdvancedConfiguration',
                dm: '高级配置',
              }),
              // 暂时不设置高级配置默认收起，否则下面的 visible 控制就失效了
              key: 'advanced-panel',
            },
            properties: {
              panel: {
                type: 'void',
                'x-decorator': 'FormItem',
                'x-component': 'FormCollapse',
                'x-component-props': {
                  className: 'gi-assets-elements-panel',
                  style: {
                    // background: 'red',
                    // margin: '-16px',
                  },
                  ghost: true,
                },
                properties: {
                  label: {
                    type: 'object',
                    'x-component': 'FormCollapse.CollapsePanel',
                    'x-component-props': {
                      header: $i18n.get({ id: 'basic.elements.SimpleNode.registerMeta.Text', dm: '文本' }),
                      key: 'label-panel',
                    },
                    properties: {
                      visible: {
                        type: 'boolean',
                        title: $i18n.get({ id: 'basic.elements.SimpleNode.registerMeta.Switch', dm: '开关' }),
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch',
                        default: true,
                        'x-reactions': [
                          {
                            target: 'advanced.label.fill',
                            fulfill: {
                              state: {
                                visible: '{{$self.value}}',
                              },
                            },
                          },
                          {
                            target: 'advanced.label.fontSize',
                            fulfill: {
                              state: {
                                visible: '{{$self.value}}',
                              },
                            },
                          },
                          {
                            target: 'advanced.label.position',
                            fulfill: {
                              state: {
                                visible: '{{$self.value}}',
                              },
                            },
                          },
                        ],
                      },
                      fill: {
                        title: $i18n.get({ id: 'basic.elements.SimpleNode.registerMeta.Color', dm: '颜色' }),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'ColorInput',
                        default: '#000',
                      },
                      fontSize: {
                        type: 'string',
                        title: $i18n.get({ id: 'basic.elements.SimpleNode.registerMeta.Size', dm: '大小' }),
                        'x-decorator': 'FormItem',
                        'x-component': 'NumberPicker',
                        max: 100,
                        min: 12,
                        default: 12,
                      },
                      position: {
                        title: $i18n.get({ id: 'basic.elements.SimpleNode.registerMeta.Location', dm: '位置' }),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'Select',
                        enum: [
                          {
                            label: $i18n.get({ id: 'basic.elements.SimpleNode.registerMeta.Top', dm: '顶部' }),
                            value: 'top',
                          },
                          {
                            label: $i18n.get({ id: 'basic.elements.SimpleNode.registerMeta.Bottom', dm: '底部' }),
                            value: 'bottom',
                          },
                          {
                            label: $i18n.get({ id: 'basic.elements.SimpleNode.registerMeta.LeftSide', dm: '左侧' }),
                            value: 'left',
                          },
                          {
                            label: $i18n.get({ id: 'basic.elements.SimpleNode.registerMeta.RightSide', dm: '右侧' }),
                            value: 'right',
                          },
                          {
                            label: $i18n.get({ id: 'basic.elements.SimpleNode.registerMeta.Middle', dm: '中间' }),
                            value: 'center',
                          },
                        ],

                        default: 'bottom',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
};

export default registerMeta;
