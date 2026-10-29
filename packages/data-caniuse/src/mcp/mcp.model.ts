export type MCPFeature = {
  id: string;
  name: string;
  description: string;
  type: 'resource' | 'tool';
  versions: {
    version: number;
    status: 'experimental' | 'preview' | 'stable' | 'deprecated' | 'removed';
  }[];
};
