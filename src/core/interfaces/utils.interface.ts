export interface Params {
  [key: string]: string;
}

export interface MatchResult {
  matched: boolean;
  params?: Params;
}
