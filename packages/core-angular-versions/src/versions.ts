import majors from '../data/majors.json' with { type: 'json' };

/**
 * Every Angular major shipped so far, oldest first, from data/majors.json. That file is generated
 * (`pnpm data:sync versions`): a new major appears there, and everywhere else, on its release.
 */
export const ANGULAR_VERSIONS: number[] = majors
  .map((release) => release.major)
  .sort((a, b) => a - b);

/** Latest major in ANGULAR_VERSIONS. */
export const LATEST_MAJOR = Math.max(...ANGULAR_VERSIONS);

/** Majors, newest first. */
export const ANGULAR_MAJORS_DESC = [...ANGULAR_VERSIONS].sort((a, b) => b - a);
