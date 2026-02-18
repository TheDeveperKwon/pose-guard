export interface ReleaseEntry {
  version: string;
  date: string;
  items: string[];
}

export const RELEASES: ReleaseEntry[];
export const LATEST_RELEASE: ReleaseEntry;
