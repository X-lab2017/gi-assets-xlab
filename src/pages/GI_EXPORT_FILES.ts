import $i18n from '../i18n'; /** G6VP 站点自动生成的配置 **/
const GI_PROJECT_CONFIG = {
  nodes: [],
  edges: [],
  layout: {
    id: 'Force2',
    props: {
      type: 'force2',
      animate: true,
      preset: {
        type: 'concentric',
        width: 800,
        height: 800,
        minNodeSpacing: 10,
        nodeSize: 10,
      },
      clusterNodeStrength: 35,
      minMovement: 2,
      damping: 0.8,
      maxSpeed: 1000,
      distanceThresholdMode: 'max',
      edgeStrength: 200,
      nodeStrength: 1000,
      defSpringLenCfg: {
        minLimitDegree: 5,
        maxLimitLength: 500,
        defaultSpring: 100,
      },
      centripetalOptions: {
        leaf: 2,
        single: 2,
        others: 1,
      },
      advanceWeight: false,
      edgeWeightFieldScale: 1,
      nodeWeightFromType: 'node',
      nodeWeightFieldScale: 1,
      directed: false,
      directedFromType: 'node',
      directedIsLog: true,
      directedMultiple: '0.1',
    },
  },
  components: [
    {
      id: 'ZoomIn',
      props: {
        GI_CONTAINER_INDEX: 2,
        GIAC: {
          visible: false,
          disabled: false,
          isShowTitle: false,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.ZoomIn', dm: '放大' }),
          isShowIcon: true,
          icon: 'icon-zoomin',
          isShowTooltip: true,
          tooltip: '',
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '46px',
          isVertical: true,
        },
      },
    },
    {
      id: 'ZoomOut',
      props: {
        GI_CONTAINER_INDEX: 2,
        GIAC: {
          visible: false,
          disabled: false,
          isShowTitle: false,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.ZoomOut', dm: '缩小' }),
          isShowIcon: true,
          icon: 'icon-zoomout',
          isShowTooltip: true,
          tooltip: '',
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '46px',
          isVertical: true,
        },
      },
    },
    {
      id: 'FitView',
      props: {
        GI_CONTAINER_INDEX: 2,
        GIAC: {
          visible: false,
          disabled: false,
          isShowTitle: false,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.Adaptive', dm: '自适应' }),
          isShowIcon: true,
          icon: 'icon-fit-view',
          isShowTooltip: true,
          tooltip: '',
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '46px',
          isVertical: true,
        },
      },
    },
    {
      id: 'FitCenter',
      props: {
        GI_CONTAINER_INDEX: 2,
        GIAC: {
          visible: false,
          disabled: false,
          isShowTitle: false,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.ViewCenter', dm: '视图居中' }),
          isShowIcon: true,
          icon: 'icon-fit-center',
          isShowTooltip: true,
          tooltip: '',
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '46px',
          isVertical: true,
        },
      },
    },
    {
      id: 'LassoSelect',
      props: {
        GI_CONTAINER_INDEX: 2,
        GIAC: {
          visible: false,
          disabled: false,
          isShowTitle: false,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.FreeSelection', dm: '自由圈选' }),
          isShowIcon: true,
          icon: 'icon-lasso',
          isShowTooltip: true,
          tooltip: $i18n.get({
            id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.HoldDownShiftAndClick',
            dm: '按住Shift，点击画布即可自由圈选',
          }),
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '46px',
          isVertical: true,
        },
      },
    },

    {
      id: 'ActivateRelations',
      props: {
        enableNodeHover: true,
        enableEdgeHover: true,
        enable: true,
        trigger: 'click',
        upstreamDegree: 1,
        downstreamDegree: 1,
      },
    },
    {
      id: 'CanvasSetting',
      props: {
        styleCanvas: {
          backgroundColor: '#fff',
          backgroundImage: 'https://gw.alipayobjects.com/mdn/rms_0d75e8/afts/img/A*k9t4QamMuQ4AAAAAAAAAAAAAARQnAQ',
          background: '#fff',
        },
        dragCanvas: {
          disabled: false,
          direction: 'both',
          enableOptimize: true,
        },
        zoomCanvas: {
          disabled: false,
          enableOptimize: true,
        },
        clearStatus: true,
        doubleClick: true,
      },
    },
    {
      id: 'NodeLegend',
      props: {
        sortKey: 'type',
        textColor: '#ddd',
        placement: 'LB',
        offset: [100, 20],
      },
    },
    {
      id: 'Placeholder',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.CanvasPlaceholder', dm: '画布占位符' }),
      props: {
        img: 'https://gw.alipayobjects.com/zos/bmw-prod/db278704-6158-432e-99d2-cc5db457585d.svg',
        text: $i18n.get({
          id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.TheCurrentCanvasIsEmpty',
          dm: '当前画布为空，请先试试「数据/图数据源/导入/示例数据」',
        }),
        width: 380,
      },
    },
    {
      id: 'FilterPanel',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.FilterPanel', dm: '筛选面板' }),
      props: {
        filterKeys: ['edge-amount', 'node-icon'],
        isFilterIsolatedNodes: true,
        highlightMode: true,
        filterLogic: 'and',
        histogramOptions: {
          isCustom: false,
        },
        GI_CONTAINER_INDEX: 2,
        GIAC_CONTENT: {
          visible: false,
          disabled: false,
          isShowTitle: true,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.FilterPanel', dm: '筛选面板' }),
          isShowIcon: true,
          icon: 'icon-filter',
          isShowTooltip: true,
          tooltip: $i18n.get({
            id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.FilterCanvasInformationThroughAttributes',
            dm: '通过属性筛选画布信息，可自定义',
          }),
          tooltipColor: '#3056e3',
          tooltipPlacement: 'top',
          hasDivider: false,
          height: '46px',
          isVertical: true,
          containerType: 'div',
          containerAnimate: false,
          containerPlacement: 'RT',
          offset: [0, 0],
          containerWidth: '400px',
          containerHeight: 'calc(100% - 100px)',
          contaienrMask: false,
        },
        histogramColor: '#3056E3',
      },
    },
    {
      id: 'LargeGraph',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.DBigPicture', dm: '3D大图' }),
      props: {
        visible: false,
        minSize: '50%',
        maxSize: '100%',
        placement: 'RB',
        offset: [0, 0],
        GI_CONTAINER_INDEX: 2,
        GIAC: {
          visible: false,
          disabled: false,
          isShowTitle: false,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.DBigPicture', dm: '3D大图' }),
          isShowIcon: true,
          icon: 'icon-3d',
          isShowTooltip: true,
          tooltip: '',
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '46px',
          isVertical: true,
        },
        backgroundColor: '#fff',
        highlightColor: 'red',
      },
    },
    {
      id: 'MapMode',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.MapMode', dm: '地图模式' }),
      props: {
        visible: false,
        type: 'amap',
        theme: 'light',
        minSize: '50%',
        maxSize: '100%',
        placement: 'RB',
        offset: [0, 0],
        longitudeKey: 'longitude',
        latitudeKey: 'latitude',
        GI_CONTAINER_INDEX: 2,
        GIAC: {
          visible: false,
          disabled: false,
          isShowTitle: false,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.MapMode', dm: '地图模式' }),
          isShowIcon: true,
          icon: 'icon-global',
          isShowTooltip: true,
          tooltip: '',
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '46px',
          isVertical: true,
        },
      },
    },
    {
      id: 'SnapshotGallery',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.SnapshotGallery', dm: '快照画廊' }),
      props: {
        background: '#fff',
        direction: 'horizontal',
        placement: 'LT',
        offset: [20, 20],
        GI_CONTAINER_INDEX: 2,
        GIAC: {
          visible: false,
          disabled: false,
          isShowTitle: false,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.SnapshotGallery', dm: '快照画廊' }),
          isShowIcon: true,
          icon: 'icon-camera',
          isShowTooltip: true,
          tooltip: $i18n.get({
            id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.SnapshotGalleryShortcutCtrlX',
            dm: '快照画廊(快捷键ctrl+x)',
          }),
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '46px',
          isVertical: true,
        },
      },
    },
    {
      id: 'ContextMenu',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.RightClickMenu', dm: '右键菜单' }),
      props: {
        GI_CONTAINER: ['NeighborsQuery', 'ToggleClusterWithMenu', 'PinNodeWithMenu'],
        nodeMenuComponents: ['NeighborsQuery', 'ToggleClusterWithMenu', 'PinNodeWithMenu'],
        bindTypes: ['node'],
        edgeMenuComponents: [],
        canvasMenuComponents: [],
        comboMenuComponents: [],
      },
    },
    {
      id: 'ToggleClusterWithMenu',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.ExpandFoldUp', dm: '展开/收起' }),
      props: {
        isReLayout: false,
        degree: 1,
      },
    },
    {
      id: 'NeighborsQuery',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.NeighborQuery', dm: '邻居查询' }),
      props: {
        serviceId: 'GI/NeighborsQuery',
        degree: '1',
        isFocus: true,
      },
    },
    {
      id: 'Copyright',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.Copyright', dm: '版权' }),
      props: {
        imageUrl: 'https://gw.alipayobjects.com/zos/bmw-prod/c2d4b2f5-2a34-4ae5-86c4-df97f7136105.svg',
        width: 200,
        height: 30,
        placement: 'RB',
        offset: [10, 10],
      },
    },
    {
      id: 'Loading',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.LoadAnimation', dm: '加载动画' }),
      props: {},
    },
    {
      id: 'PinNodeWithMenu',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.FixedNodeMenu', dm: '固定节点(MENU)' }),
      props: {
        color: '#fff',
        fill: '#262626',
      },
    },
    {
      id: 'ForceSimulation',
      name: $i18n.get({
        id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.ForceGuideLayoutController',
        dm: '力导布局控制器',
      }),
      props: {
        autoPin: true,
        dragNodeMass: 10000000,
        GI_CONTAINER_INDEX: 2,
        GIAC: {
          visible: false,
          disabled: false,
          isShowTitle: false,
          title: $i18n.get({
            id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.ForceGuideLayoutController',
            dm: '力导布局控制器',
          }),
          isShowIcon: true,
          icon: 'icon-layout-force',
          isShowTooltip: true,
          tooltip: '',
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '46px',
          isVertical: true,
        },
      },
    },
    {
      id: 'Initializer',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.Initializer', dm: '初始化器' }),
      props: {
        serviceId: 'GI/GI_SERVICE_INTIAL_GRAPH',
        schemaServiceId: 'GI/GI_SERVICE_SCHEMA',
        GI_INITIALIZER: true,
        aggregate: false,
      },
    },
    {
      id: 'LayoutSwitch',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.LayoutSwitching', dm: '布局切换' }),
      props: {
        GI_CONTAINER_INDEX: 2,
        GIAC: {
          visible: false,
          disabled: false,
          isShowTitle: false,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.LayoutSwitching', dm: '布局切换' }),
          isShowIcon: true,
          icon: 'icon-layout',
          isShowTooltip: false,
          tooltip: $i18n.get({
            id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.SwitchCanvasLayoutWithOne',
            dm: '一键切换画布布局',
          }),
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '46px',
          isVertical: true,
        },
      },
    },
    {
      id: 'GrailLayout',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.HolyGrailLayout', dm: '圣杯布局' }),
      props: {
        GI_CONTAINER_LEFT: [],
        leftDisplay: false,
        leftVisible: true,
        leftWidth: '400px',
        GI_CONTAINER_RIGHT: ['FilterPanel', 'SankeyAnalysis'],
        rightDisplay: true,
        rightVisible: true,
        rightWidth: '350px',
        GI_CONTAINER_BOTTOM: ['ChartAnalysis'],
        bottomDisplay: true,
        bottomVisible: true,
        bottomHeight: '300px',
        GI_CONTAINER_TOP: [],
        topDisplay: false,
        topVisible: false,
        topHeight: '200px',
      },
    },
    {
      id: 'TableMode',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.TableMode', dm: '表格模式' }),
      props: {
        enableCopy: true,
        isSelectedActive: true,
        GI_CONTAINER_INDEX: 2,
        GIAC_CONTENT: {
          visible: false,
          disabled: false,
          isShowTitle: true,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.TableMode', dm: '表格模式' }),
          isShowIcon: true,
          icon: 'icon-table',
          isShowTooltip: true,
          tooltip: $i18n.get({
            id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.ShowNodesAndEdgesIn',
            dm: '将画布中的节点和边以表格形式展示',
          }),
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '60px',
          isVertical: true,
          containerType: 'div',
          containerAnimate: false,
          containerPlacement: 'RT',
          offset: [0, 0],
          containerWidth: '400px',
          containerHeight: 'calc(100% - 100px)',
          contaienrMask: false,
        },
      },
    },
    {
      id: 'InfoDetection',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.InformationDetection', dm: '信息检测' }),
      props: {
        GI_CONTAINER_INDEX: 2,
        GIAC_CONTENT: {
          visible: false,
          disabled: false,
          isShowTitle: true,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.InformationDetection', dm: '信息检测' }),
          isShowIcon: true,
          icon: 'icon-infomation',
          isShowTooltip: true,
          tooltip: $i18n.get({
            id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.DetectIsolatedPointsRingsEtc',
            dm: '检测画布中孤立点、环等',
          }),
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '60px',
          isVertical: true,
          containerType: 'div',
          containerAnimate: false,
          containerPlacement: 'RT',
          offset: [0, 0],
          containerWidth: '400px',
          containerHeight: 'calc(100% - 100px)',
          contaienrMask: false,
        },
      },
    },
    {
      id: 'SankeyAnalysis',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.SankeyDiagramAnalysis', dm: '桑基图分析' }),
      props: {
        weightField: 'amount',
        GI_CONTAINER_INDEX: 2,
        GIAC_CONTENT: {
          visible: false,
          disabled: false,
          isShowTitle: true,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.SankeyDiagramAnalysis', dm: '桑基图分析' }),
          isShowIcon: true,
          icon: 'icon-sankey',
          isShowTooltip: true,
          tooltip: '',
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '60px',
          isVertical: true,
          containerType: 'div',
          containerAnimate: false,
          containerPlacement: 'RT',
          offset: [0, 0],
          containerWidth: '400px',
          containerHeight: 'calc(100% - 100px)',
          contaienrMask: false,
        },
      },
    },
    {
      id: 'ChartAnalysis',
      name: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.ChartAnalysis', dm: '图表分析' }),
      props: {
        title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.UnnamedChart', dm: '未命名图表' }),
        chartType: 'columnChart',
        height: 150,
        dataType: 'edges',
        xField_edges: 'time',
        yField_edges: 'amount',
        GI_CONTAINER_INDEX: 2,
        GIAC_CONTENT: {
          visible: false,
          disabled: false,
          isShowTitle: true,
          title: $i18n.get({ id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.ChartAnalysis', dm: '图表分析' }),
          isShowIcon: true,
          icon: 'icon-barchart',
          isShowTooltip: true,
          tooltip: $i18n.get({
            id: 'gi-assets-xlab.src.pages.GI_EXPORT_FILES.TheDataInTheGraph',
            dm: '图中数据通过统计图表展示分析',
          }),
          tooltipColor: '#3056e3',
          tooltipPlacement: 'right',
          hasDivider: false,
          height: '60px',
          isVertical: true,
          containerType: 'div',
          containerAnimate: false,
          containerPlacement: 'RT',
          offset: [0, 0],
          containerWidth: '400px',
          containerHeight: 'calc(100% - 100px)',
          contaienrMask: false,
        },
      },
    },
  ],
};

/** G6VP 站点选择服务引擎的上下文配置信息 **/
const SERVER_ENGINE_CONTEXT = {};

/** 导出的主题 **/
const THEME_VALUE = 'light';

export { GI_PROJECT_CONFIG, SERVER_ENGINE_CONTEXT, THEME_VALUE };
