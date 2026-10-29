import type { MigrationGuide } from './migration-guide.model';
import { migrationGuide22_1 } from './v22-1';

export * from './migration-guide.model';

/** Every migration guide, one per minor release. Add a file and list it here. */
export const migrationGuides: MigrationGuide[] = [migrationGuide22_1];
