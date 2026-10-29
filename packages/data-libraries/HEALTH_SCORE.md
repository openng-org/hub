# The library health score

A number from 0 to 100 saying how safe it is to pick a library for a project on a given Angular
major. It is computed by `healthScore()` in `src/health-score.ts` from the facts in
`data/health.json` (refreshed every week by `pnpm data:sync libraries`), for every tracked major,
so a library has one score per major; the one for the latest major is the headline.

The score starts at 100. Each rule takes points off; the result is clamped to 0–100.

| Rule            | Check                                                                                     | Points         |
| --------------- | ----------------------------------------------------------------------------------------- | -------------- |
| Vulnerabilities | A critical or high vulnerability in the version recommended for the major                 | score set to 0 |
|                 | Moderate vulnerabilities in that version                                                  | −5 each        |
|                 | Low vulnerabilities in that version                                                       | −2 each        |
| Support         | Each of the 3 most recent majors (the major and the two before it) with no stable version | −10 each       |
| Stale releases  | Each recent major served by the version that already served the major before it           | −5 each        |
| Maturity        | The recommended version is still 0.x                                                      | −20            |
| Popularity      | Fewer than 1,000 weekly downloads on npm                                                  | −10            |
| Maintenance     | Deprecated on npm, or the repository archived on GitHub                                   | −30            |

Grades: **good** from 80, **fair** from 60, **poor** below.

## Where the facts come from

- **Recommended version per major**: the newest stable version (no pre-release) on npm whose peer
  dependency range on `@angular/core` (or another `@angular/*` package when the library declares
  none on core) accepts the major, and never one older than the version for the major before (an
  old release with an open range such as `>=13.0.0` is not support for Angular 22 when 21.x
  releases exist). A range like `>=16.0.0` accepts every later major, which is how its author
  declared it: the stale-release rule tells a maintained library from one living on that range.
- **Vulnerabilities**: [OSV](https://osv.dev) advisories affecting that version of the library
  itself. Its dependencies are not audited.
- **Downloads**: npm's weekly download count.
- **Deprecated / archived**: the `deprecated` flag of the latest version on npm; the `archived`
  flag of the GitHub repository the package declares.

## Reading the examples

- A library with a release for every major, no vulnerability and a healthy user base: **100**.
- The same library whose `latest` is `0.9.0`: **80** (maturity).
- A library whose last release, from before Angular 20 came out, declares `>=19.0.0`: it accepts
  20, 21 and 22, so no support penalty, but −5 for each of 22, 21 and 20 served by that same old
  release: **85** (stale releases). Readers see it is kept alive by an open range, not by releases;
  a release after Angular 22 came out, even with the same open range, clears the penalty.
- An archived library that stopped at Angular 17: −30 (no stable version for 20, 21, 22) and −30
  (archived): **40**.
