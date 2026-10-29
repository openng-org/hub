/**
 * Official Angular version compatibility matrix for Node.js, TypeScript, and RxJS.
 * Older Angular versions (≤8) also include Angular CLI compatibility.
 *
 * @see https://angular.dev/reference/versions
 */
export interface AngularVersionCompatibility {
  /** Angular version range (e.g. "22.0.x", "21.0.x || 21.1.x || 21.2.x") */
  angular: string;
  /** Node.js semver range */
  node: string;
  /** TypeScript semver range */
  typescript: string;
  /** RxJS semver range */
  rxjs: string;
  /** Angular CLI version range (only for Angular ≤8) */
  angularCli?: string;
}

/**
 * Angular version compatibility entries, ordered from newest to oldest.
 */
export const angularVersionCompatibility: AngularVersionCompatibility[] = [
  {
    angular: '22.0.x',
    node: '^22.22.3 || ^24.15.0 || ^26.0.0',
    typescript: '>=6.0.0 <6.1.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '21.0.x || 21.1.x || 21.2.x',
    node: '^20.19.0 || ^22.12.0 || ^24.0.0',
    typescript: '>=5.9.0 <6.0.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '20.2.x || 20.3.x',
    node: '^20.19.0 || ^22.12.0 || ^24.0.0',
    typescript: '>=5.8.0 <6.0.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '20.0.x || 20.1.x',
    node: '^20.19.0 || ^22.12.0 || ^24.0.0',
    typescript: '>=5.8.0 <5.9.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '19.2.x',
    node: '^18.19.1 || ^20.11.1 || ^22.0.0',
    typescript: '>=5.5.0 <5.9.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '19.1.x',
    node: '^18.19.1 || ^20.11.1 || ^22.0.0',
    typescript: '>=5.5.0 <5.8.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '19.0.x',
    node: '^18.19.1 || ^20.11.1 || ^22.0.0',
    typescript: '>=5.5.0 <5.7.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '18.1.x || 18.2.x',
    node: '^18.19.1 || ^20.11.1 || ^22.0.0',
    typescript: '>=5.4.0 <5.6.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '18.0.x',
    node: '^18.19.1 || ^20.11.1 || ^22.0.0',
    typescript: '>=5.4.0 <5.5.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '17.3.x',
    node: '^18.13.0 || ^20.9.0',
    typescript: '>=5.2.0 <5.5.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '17.1.x || 17.2.x',
    node: '^18.13.0 || ^20.9.0',
    typescript: '>=5.2.0 <5.4.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '17.0.x',
    node: '^18.13.0 || ^20.9.0',
    typescript: '>=5.2.0 <5.3.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '16.1.x || 16.2.x',
    node: '^16.14.0 || ^18.10.0',
    typescript: '>=4.9.3 <5.2.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '16.0.x',
    node: '^16.14.0 || ^18.10.0',
    typescript: '>=4.9.3 <5.1.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '15.1.x || 15.2.x',
    node: '^14.20.0 || ^16.13.0 || ^18.10.0',
    typescript: '>=4.8.2 <5.0.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '15.0.x',
    node: '^14.20.0 || ^16.13.0 || ^18.10.0',
    typescript: '~4.8.2',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '14.2.x || 14.3.x',
    node: '^14.15.0 || ^16.10.0',
    typescript: '>=4.6.2 <4.9.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '14.0.x || 14.1.x',
    node: '^14.15.0 || ^16.10.0',
    typescript: '>=4.6.2 <4.8.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '13.3.x || 13.4.x',
    node: '^12.20.0 || ^14.15.0 || ^16.10.0',
    typescript: '>=4.4.3 <4.7.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '13.1.x || 13.2.x',
    node: '^12.20.0 || ^14.15.0 || ^16.10.0',
    typescript: '>=4.4.3 <4.6.0',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '13.0.x',
    node: '^12.20.0 || ^14.15.0 || ^16.10.0',
    typescript: '~4.4.3',
    rxjs: '^6.5.3 || ^7.4.0',
  },
  {
    angular: '12.2.x',
    node: '^12.14.0 || ^14.15.0',
    typescript: '>=4.2.3 <4.4.0',
    rxjs: '^6.5.3 || ^7.0.0',
  },
  {
    angular: '12.1.x',
    node: '^12.14.0 || ^14.15.0',
    typescript: '>=4.2.3 <4.4.0',
    rxjs: '^6.5.3',
  },
  {
    angular: '12.0.x',
    node: '^12.14.0 || ^14.15.0',
    typescript: '~4.2.3',
    rxjs: '^6.5.3',
  },
  {
    angular: '11.2.x',
    node: '^10.13.0 || ^12.11.0',
    typescript: '>=4.0.0 <4.2.0',
    rxjs: '^6.5.3',
  },
  {
    angular: '11.1.x',
    node: '^10.13.0 || ^12.11.0',
    typescript: '>=4.0.0 <4.2.0',
    rxjs: '^6.5.3',
  },
  {
    angular: '11.0.x',
    node: '^10.13.0 || ^12.11.0',
    typescript: '~4.0.0',
    rxjs: '^6.5.3',
  },
  {
    angular: '10.2.x',
    node: '^10.13.0 || ^12.11.0',
    typescript: '>=3.9.0 <4.1.0',
    rxjs: '^6.5.3',
  },
  {
    angular: '10.1.x',
    node: '^10.13.0 || ^12.11.0',
    typescript: '>=3.9.0 <4.1.0',
    rxjs: '^6.5.3',
  },
  {
    angular: '10.0.x',
    node: '^10.13.0 || ^12.11.0',
    typescript: '~3.9.0',
    rxjs: '^6.5.3',
  },
  {
    angular: '9.1.x',
    node: '^10.13.0 || ^12.11.0',
    typescript: '>=3.6.0 <3.9.0',
    rxjs: '^6.5.3',
  },
  {
    angular: '9.0.x',
    node: '^10.13.0 || ^12.11.0',
    typescript: '>=3.6.0 <3.8.0',
    rxjs: '^6.5.3',
  },
  {
    angular: '8.2.x',
    angularCli: '8.2.x || 8.3.x',
    node: '^10.9.0',
    typescript: '>=3.4.2 <3.6.0',
    rxjs: '^6.4.0',
  },
  {
    angular: '8.0.x || 8.1.x',
    angularCli: '8.0.x || 8.1.x',
    node: '^10.9.0',
    typescript: '~3.4.2',
    rxjs: '^6.4.0',
  },
  {
    angular: '7.2.x',
    angularCli: '7.2.x || 7.3.x',
    node: '^8.9.0 || ^10.9.0',
    typescript: '>=3.1.3 <3.3.0',
    rxjs: '^6.0.0',
  },
  {
    angular: '7.0.x || 7.1.x',
    angularCli: '7.0.x || 7.1.x',
    node: '^8.9.0 || ^10.9.0',
    typescript: '~3.1.3',
    rxjs: '^6.0.0',
  },
  {
    angular: '6.1.x',
    angularCli: '6.1.x || 6.2.x',
    node: '^8.9.0',
    typescript: '>=2.7.2 <3.0.0',
    rxjs: '^6.0.0',
  },
  {
    angular: '6.0.x',
    angularCli: '6.0.x',
    node: '^8.9.0',
    typescript: '~2.7.2',
    rxjs: '^6.0.0',
  },
  {
    angular: '5.2.x',
    angularCli: '1.6.x || 1.7.x',
    node: '^6.9.0 || ^8.9.0',
    typescript: '>=2.4.2 <2.7.0',
    rxjs: '^5.5.0',
  },
  {
    angular: '5.0.x || 5.1.x',
    angularCli: '1.5.x',
    node: '^6.9.0 || ^8.9.0',
    typescript: '~2.4.2',
    rxjs: '^5.5.0',
  },
  {
    angular: '4.2.x || 4.3.x || 4.4.x',
    angularCli: '1.4.x',
    node: '^6.9.0 || ^8.9.0',
    typescript: '>=2.1.6 <2.5.0',
    rxjs: '^5.0.1',
  },
  {
    angular: '4.2.x || 4.3.x || 4.4.x',
    angularCli: '1.3.x',
    node: '^6.9.0',
    typescript: '>=2.1.6 <2.5.0',
    rxjs: '^5.0.1',
  },
  {
    angular: '4.0.x || 4.1.x',
    angularCli: '1.0.x || 1.1.x || 1.2.x',
    node: '^6.9.0',
    typescript: '>=2.1.6 <2.4.0',
    rxjs: '^5.0.1',
  },
  {
    angular: '2.x',
    node: '^6.9.0',
    typescript: '>=1.8.0 <2.2.0',
    rxjs: '^5.0.1',
  },
];
