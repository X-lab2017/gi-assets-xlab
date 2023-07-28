export interface IFilterRule {
  type: string;
  weightPropertyName?: string;
  edgeType?: string;
}

export interface IState {
  allNodePath: string[][];
  allEdgePath: string[][];
  nodePath: string[][];
  edgePath: string[][];
  highlightPath: Set<number>;
  isAnalysis: boolean;
  filterRule: IFilterRule;
  selecting: string;
  searchOptions: Object[];
  loading: boolean;
  source: string | undefined;
  target: string | undefined;
  searchRange: 'canvas' | 'database';
}

export interface IHighlightElement {
  nodes: Set<string>;
  edges: Set<string>;
}
