const formatContent = content => {
  return content.replaceAll('/', '//');
};

const uniqueGraphData = graphData => {
  const nodeMap = {};
  const edgeMap = {};
  graphData.nodes?.forEach(node => (nodeMap[node.id] = node));
  graphData.edges?.forEach(edge => {
    const { source, target, label } = edge;
    edgeMap[`${source}-${label}-${target}`] = edge;
  });
  return {
    nodes: Object.values(nodeMap),
    edges: Object.values(edgeMap),
  };
};

const getCirclePositionsMap = (ids, width, height) => {
  const radius = Math.max(Math.min(width, height) / 2, 10 * ids.length);
  const angle = (Math.PI * 2) / ids.length;
  const positionMap = {};
  ids.forEach((id, i) => {
    positionMap[id] = {
      x: Math.cos(angle * i) * radius + width / 2,
      y: Math.sin(angle * i) * radius + height / 2,
    };
  });
  return positionMap;
};

export { formatContent, uniqueGraphData, getCirclePositionsMap };
