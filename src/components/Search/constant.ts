export const templates = [
  {
    id: 'history',
    title: '领域发展史',
    color: '#3b5999',
    isUser: false,
    searchHolder: '请输入仓库名称（多选）',
    actions: ['search', 'commonNeighbors'],
    img: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*v_sNQIcQOPAAAAAAAAAAAAAADmJ7AQ/original',
    demos: [
      {
        id: 'history-bigdata',
        title: '大数据发展',
        repoNames: ['apache/hadoop', 'apache/hive', 'apache/hbase', 'apache/spark', 'apache/flink', 'apache/kafka'],
      },
      {
        id: 'history-antv',
        title: 'AntV 基础库',
        repoNames: ['antvis/G6', 'antvis/G2', 'antvis/X6', 'antvis/L7', 'antvis/G'],
      },
      {
        id: 'history-cluster',
        title: '集群发展',
        repoNames: ['kubernetes/kubernetes', 'docker-archive/classicswarm', 'apache/mesos'],
      },
    ],
  },
  // {
  //   id: 'versus',
  //   title: '生态对比',
  //   color: '#55acee',
  //   isUser: false,
  //   searchHolder: '请输入仓库名称（多选）',
  //   actions: ['search', 'commonNeighbors', 'clustering', 'repoSubGraph'],
  //   img: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*tTaoSbHxDLYAAAAAAAAAAAAADmJ7AQ/original',
  //   demos: [
  //     {
  //       id: 'versus-database',
  //       title: '数据库',
  //       repoNames: ['pingcap/tidb', 'oceanbase/oceanbase'],
  //     },
  //   ],
  // },
  {
    id: 'userAndRepo',
    title: '用户与仓库',
    color: '#108ee9',
    isUser: true,
    searchHolder: '请输入用户名（多选）',
    actions: ['search', 'commonNeighbors', 'clustering', 'userSubGarph', 'neighbors'],
    img: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*IjtKQLG-0TMAAAAAAAAAAAAADmJ7AQ/original',
    demos: [
      {
        id: 'userAndRepo-database',
        title: 'AntV 开发者',
        userNames: ['hustcc', 'afc163', 'Yanyan-Wang', 'pomelo-nwu', 'xiaoiver'],
        repoNames: ['ant-design/ant-design', 'antvis/G6', 'antvis/G2'],
      },
      {
        id: 'userAndRepo-JakeWharton',
        title: 'Jake Wharton 成长史',
        userNames: ['JakeWharton', 'jessewilson'],
        repoNames: [],
      },
    ],
  },
  {
    id: 'hot',
    title: '热门技术',
    color: '#b37feb',
    isUser: true,
    searchHolder: '请输入用户名（多选）',
    actions: ['search', 'commonNeighbors'],
    img: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*XII3RJaUWUYAAAAAAAAAAAAADmJ7AQ/original',
    allowCustom: false,
    demos: [
      {
        id: 'hot-ai',
        title: 'AI 技术',
        repoNames: [
          'hwchase17/langchain',
          'huggingface/transformers',
          'AUTOMATIC1111/stable-diffusion-webui',
          'Significant-Gravitas/Auto-GPT',
          'ggerganov/llama.cpp',
          'jerryjliu/llama_index',
          'milvus-io/milvus',
          'invoke-ai/InvokeAI',
          'nomic-ai/gpt4all',
          'facebookresearch/llama',
          'microsoft/DeepSpeed',
          'hpcaitech/ColossalAI',
          'reworkd/AgentGPT',
          'getcursor/cursor',
          'qdrant/qdrant',
          'ggerganov/whisper.cpp',
          'lencx/ChatGPT',
          'facebookresearch/segment-anything',
          'weaviate/weaviate',
          'mckaywrigley/chatbot-ui',
          'acheong08/ChatGPT',
          'tloen/alpaca-lora',
          'modelscope/modelscope',
          'lllyasviel/ControlNet',
          'cocktailpeanut/dalai',
          'Vision-CAIR/MiniGPT-4',
          'CompVis/stable-diffusion',
          'CarperAI/trlx',
          'bigscience-workshop/petals',
          'karpathy/nanoGPT',
          'openai/chatgpt-retrieval-plugin',
          'oneapi-src/oneDNN',
          'Stability-AI/stablediffusion',
          'TheR1D/shell_gpt',
          'huggingface/pytorch-image-models',
          'transitive-bullshit/chatgpt-api',
          'tatsu-lab/stanford_alpaca',
          'yoheinakajima/babyagi',
          'THUDM/GLM-130B',
          'fuergaosi233/wechat-chatgpt',
          'BlinkDL/ChatRWKV',
          'brycedrennan/imaginAIry',
          'wong2/chatgpt-google-extension',
          'microsoft/JARVIS',
          'openai/whisper',
          'vincelwt/chatgpt-mac',
          'Stability-AI/StableLM',
          'openai/point-e',
          'karpathy/minGPT',
          'alpa-projects/alpa',
          'jaymody/picoGPT',
          'lucidrains/PaLM-rlhf-pytorch',
          'rawandahmad698/PyChatGPT',
          'FMInference/FlexGen',
          'VinAIResearch/PhoBERT',
          'google-research/albert',
          'ashishpatel26/Tools-to-Design-or-Visualize-Architecture-of-Neural-Network',
          'rinnakk/japanese-pretrained-models',
        ],
      },
    ],
  },
];
