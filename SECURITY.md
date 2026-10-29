# Security policy

Angular Hub follows the [OpenNG security policy](https://github.com/openng-org/.github/blob/main/SECURITY.md).
This file adds what is specific to this repository.

## Scope

- The site at https://hub.openng.org (server-side rendering, the `/api` endpoints, the feeds) and
  its deployment configuration in this repository.
- The workspace packages under `packages/`.

Out of scope: the data itself (a wrong date is a bug, open an issue), third-party services linked
from the site, and vulnerabilities in dependencies that do not affect the site (report those
upstream; tell us if they do affect it).

## Reporting a vulnerability

Please do not open a public issue, pull request or discussion for a security problem.

- Preferred: GitHub's private vulnerability reporting — the **Security** tab of this repository,
  then "Report a vulnerability".
- Otherwise: email openng.foundation@gmail.com with a description, the impact, reproduction steps
  and, if you have them, a proof of concept or logs.

You will get an acknowledgement within a few business days. We prefer coordinated disclosure: give
us time to ship a fix before publishing details, and we will credit you in the advisory if you wish.
