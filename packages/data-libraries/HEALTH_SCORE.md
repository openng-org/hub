# The library health score

> **Experimental.** The rules below are being tuned: the site says so on every library page.
> Feedback is welcome in the issues.

A number from 0 to 100 saying how safe it is to pick a library for a project on a given Angular
major. It is computed by `healthScore()` in `src/health-score.ts` from the facts in
`data/health.json` (refreshed every week by `pnpm data:sync libraries`), for every tracked major,
so a library has one score per major; the one for the latest major is the headline. The live
check (`/libraries/check`, any npm package) applies the same function to facts read on request; a
rule whose source did not answer (GitHub, npm's downloads API) is left out rather than scored, and
the page says which.

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

A deprecated or archived library is **not shown a score**: its badge stays empty (grey) and it
sorts last, since the question "is it safe to pick?" has its answer already. The maintenance rule
still applies to the number the API computes.

## Where the facts come from

- **Recommended version per major**: the newest stable version (no pre-release) on npm whose peer
  dependency range on `@angular/core` (or another Angular package — `@angular/common`,
  `@angular/cdk`, `@angular/material`, the CLI and builders — when the library declares none on
  core) accepts the major, and never one older than the version for the major before (an
  old release with an open range such as `>=13.0.0` is not support for Angular 22 when 21.x
  releases exist). A range like `>=16.0.0` accepts every later major, which is how its author
  declared it: the stale-release rule tells a maintained library from one living on that range.
  A library whose latest version declares no Angular peer at all gets its latest version for every
  major, flagged as undeclared, and the support and stale rules do not apply to it.
- **Vulnerabilities**: the [GitHub Advisory Database](https://github.com/advisories) (where npm's
  own advisories come from), the advisories affecting that version of the library itself. Its
  dependencies are not audited. Withdrawn advisories and unrated ones are ignored.
- **Downloads**: npm's weekly download count (the downloads API, or the registry search when it
  cannot be reached).
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
  (archived) make **40** for the API, but the site shows no score (see above).
