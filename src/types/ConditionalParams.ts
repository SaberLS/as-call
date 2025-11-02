type ConditionalParams<
  TGetArgs,
  TExtraParams extends unknown[],
  TCallParams extends unknown[],
  TGetParams extends unknown[],
> = TGetArgs extends undefined ? [...TExtraParams, ...TCallParams] : TGetParams

export type { ConditionalParams }
