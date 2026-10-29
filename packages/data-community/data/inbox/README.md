# Contribution inbox

Each file here is one contribution — an event, a community or a podcast — opened as a pull request
from the **Add to the hub** form on the site (`/contribute`). CI validates them with the same rules
as the form (`src/validate.ts`).

Before merging such a pull request, a maintainer moves the files into the datasets:

```sh
pnpm --filter @openng/data-community merge-inbox
```

then pushes the result to the pull request's branch. The site only shows an entry once it is in
`events.json`, `organizers.json` or `podcasts.json`.
