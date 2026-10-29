/** Every Angular major shipped so far. Add a version here; everything else derives from it. */
export const ANGULAR_VERSIONS = [
  2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
];

/** Latest major in ANGULAR_VERSIONS. */
export const LATEST_MAJOR = Math.max(...ANGULAR_VERSIONS);

/** Majors, newest first. */
export const ANGULAR_MAJORS_DESC = [...ANGULAR_VERSIONS].sort((a, b) => b - a);
