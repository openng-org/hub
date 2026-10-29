import { mcpFeatures } from '@openng/data-caniuse/mcp';
import { getEslintCaniuseList } from '@openng/data-caniuse/eslint';

import type {
  EslintList,
  EslintQuery,
  EslintRow,
  EslintRuleType,
  McpList,
  McpRow,
} from '../../app/features/caniuse/caniuse.model';
import { MCP_MAJORS } from './majors';
import { matrixCells } from './matrix';
import { matches, normalizeTerm } from '../text';

const mcpRows: McpRow[] = mcpFeatures.map((feature) => ({
  id: feature.id,
  name: feature.name,
  type: feature.type,
  description: feature.description,
  cells: matrixCells(feature.versions, MCP_MAJORS),
}));

export function listMcp(search = ''): McpList {
  const term = normalizeTerm(search);
  const items = mcpRows.filter((row) => matches(term, row.name));
  return { items, total: items.length, majors: MCP_MAJORS };
}

const eslintRows: EslintRow[] = getEslintCaniuseList().map((rule) => {
  const type: EslintRuleType = rule.type === 'eslint-plugin' ? 'typescript' : 'html';
  return {
    name: rule.name,
    description: rule.description,
    type,
    typeLabel: type === 'typescript' ? 'TypeScript' : 'HTML',
    version: rule.version,
    url: rule.url,
  };
});

export function listEslint(query: EslintQuery = {}): EslintList {
  const term = normalizeTerm(query.search);
  const items = eslintRows.filter(
    (row) => matches(term, row.name, row.description) && (!query.type || row.type === query.type),
  );
  return { items, total: items.length };
}
