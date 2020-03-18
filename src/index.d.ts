export interface ConfigOptions {}

type Accessor<In, Out> = Out | string | ((obj: In) => Out);
type DataAccessor<T> = Accessor<Datum, T>;
type SeriesAccessor<T> = Accessor<Series, T>;
type Datum = any;
type Series = string;

type Formatter<ItemType> = (item: ItemType) => string;
type CompareFn<ItemType> = (a: ItemType, b: ItemType) => number;
type AggregationFn<ItemType> = (vals: ItemType[]) => ItemType;

type HorizonMode = 'offset' | 'mirror';

type PointD = { ts: number, val: number };
type TooltipAccessorFn = (tooltipData: { series: Series, ts: number, val: number, points: PointD[] }) => string | null;
type InteractionFn = (interactionData: { x: number, y:number, points: PointD[] }) => void;

type InterpolationCurveFn = (canvasCtx?: object) => object;

export interface HorizonTSChartGenericInstance<ChainableInstance> {
  (element: HTMLElement): ChainableInstance;

  width(): number;
  width(width: number): ChainableInstance;
  height(): number;
  height(height: number): ChainableInstance;

  data(): Datum[];
  data(data: Datum[]): ChainableInstance;

  series(): DataAccessor<Series>;
  series(seriesAccessor: DataAccessor<Series>): ChainableInstance;
  seriesComparator(): CompareFn<Series>;
  seriesComparator(cmpFn: CompareFn<Series>): ChainableInstance;
  seriesLabelFormatter(): Formatter<Series>;
  seriesLabelFormatter(formatter: Formatter<Series>): ChainableInstance;

  ts(): DataAccessor<number | Date>;
  ts(tsAccessor: DataAccessor<number | Date>): ChainableInstance;
  val(): DataAccessor<number>;
  val(tsAccessor: DataAccessor<number>): ChainableInstance;
  useUtc(): boolean;
  useUtc(utc: boolean): ChainableInstance;
  use24h(): boolean;
  use24h(use24h: boolean): ChainableInstance;

  horizonBands(): number;
  horizonBands(bands?: number): ChainableInstance;
  horizonMode(): HorizonMode;
  horizonMode(mode: HorizonMode): ChainableInstance;
  yNormalize(): boolean;
  yNormalize(normalize: boolean): ChainableInstance;

  yExtent(): SeriesAccessor<number | undefined>;
  yExtent(extentAccessor: SeriesAccessor<number | undefined>): ChainableInstance;
  yScaleExp(): SeriesAccessor<number>;
  yScaleExp(exponentAccessor: SeriesAccessor<number>): ChainableInstance;
  yAggregation(): AggregationFn<number>;
  yAggregation(aggFn: AggregationFn<number>): ChainableInstance;

  positiveColors(): SeriesAccessor<string[]>;
  positiveColors(colorsAccessor: SeriesAccessor<string[]>): ChainableInstance;
  positiveColorStops(): SeriesAccessor<number[]>;
  positiveColorStops(colorStopsAccessor: SeriesAccessor<number[]>): ChainableInstance;
  negativeColors(): SeriesAccessor<string[]>;
  negativeColors(colorsAccessor: SeriesAccessor<string[]>): ChainableInstance;
  negativeColorStops(): SeriesAccessor<number[]>;
  negativeColorStops(colorStopsAccessor: SeriesAccessor<number[]>): ChainableInstance;

  interpolationCurve(): InterpolationCurveFn;
  interpolationCurve(fn: InterpolationCurveFn | false): ChainableInstance;

  showRuler(): boolean;
  showRuler(show: boolean): ChainableInstance;
  enableZoom(): boolean;
  enableZoom(enable: boolean): ChainableInstance;
  transitionDuration(): number;
  transitionDuration(ms: number): ChainableInstance;

  tooltipContent(): TooltipAccessorFn;
  tooltipContent(contentAccessor: TooltipAccessorFn): ChainableInstance;
  onClick(cb: InteractionFn): ChainableInstance;
  onHover(cb: InteractionFn): ChainableInstance;
}

export type HorizonTSChartInstance = HorizonTSChartGenericInstance<HorizonTSChartInstance>;

declare function HorizonTSChart(configOptions?: ConfigOptions): HorizonTSChartInstance;

export default HorizonTSChart;
