import { ANGULAR_MAJORS_DESC, LATEST_MAJOR } from '@openng/core-angular-versions';

/** First Angular major the Can I Use matrix tracks. */
const CANIUSE_FIRST_MAJOR = 14;
/** First Angular major with an official development MCP server. */
export const MCP_FIRST_MAJOR = 20;

/** Matrix columns, newest first, as rendered ("22", "21", ...). */
export const FEATURE_MAJORS: string[] = ANGULAR_MAJORS_DESC.filter(
  (major) => major >= CANIUSE_FIRST_MAJOR,
).map(String);

export const MCP_MAJORS: string[] = ANGULAR_MAJORS_DESC.filter(
  (major) => major >= MCP_FIRST_MAJOR,
).map(String);

/** In this major, a feature without a status is "awaiting evolution" rather than unavailable. */
export const LATEST_MAJOR_LABEL = String(LATEST_MAJOR);
