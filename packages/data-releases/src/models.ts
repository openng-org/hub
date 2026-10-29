/** A major with release insights, as contributed in data/releases.json. */
export interface Release {
  major: number;
  /** The blog post announcing the major. */
  announcementUrl: string | null;
  /** The release video on YouTube. */
  youtubeVideoId: string | null;
}

/** A GitHub release of angular/angular or angular/angular-cli (data/github-releases.json). */
export interface GithubRelease {
  /** "22.1.0", "22.2.0-next.3", "22.1.0-rc.1"… */
  version: string;
  link: string;
  /** ISO timestamp. */
  releaseDate: string;
  repository: string;
}

/**
 * A conventional commit shipped in a stable release (data/commits.json), collected from the
 * GitHub changelogs of angular/angular and angular/angular-cli.
 */
export interface ReleaseCommit {
  sha: string;
  /** The conventional-commit subject. */
  description: string;
  /** Stable release that shipped it ("22.1.0"). */
  version: string;
  /** "feat", "fix", "perf"… */
  type: string;
  /** "core", "compiler", "@angular/build"… */
  package: string;
  /** "angular" or "angular-cli": the GitHub repository under angular/. */
  repository: string;
}
