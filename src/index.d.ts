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

declare class HorizonTSChart {
  constructor(element: HTMLElement, configOptions?: ConfigOptions);

  width(): number;
  width(width: number): HorizonTSChart;
  height(): number;
  height(height: number): HorizonTSChart;

  data(): Datum[];
  data(data: Datum[]): HorizonTSChart;

  series(): DataAccessor<Series>;
  series(seriesAccessor: DataAccessor<Series>): HorizonTSChart;
  seriesComparator(): CompareFn<Series>;
  seriesComparator(cmpFn: CompareFn<Series>): HorizonTSChart;
  seriesLabelFormatter(): Formatter<Series>;
  seriesLabelFormatter(formatter: Formatter<Series>): HorizonTSChart;

  ts(): DataAccessor<number | Date>;
  ts(tsAccessor: DataAccessor<number | Date>): HorizonTSChart;
  val(): DataAccessor<number>;
  val(tsAccessor: DataAccessor<number>): HorizonTSChart;
  useUtc(): boolean;
  useUtc(utc: boolean): HorizonTSChart;
  use24h(): boolean;
  use24h(use24h: boolean): HorizonTSChart;

  horizonBands(): number;
  horizonBands(bands?: number): HorizonTSChart;
  horizonMode(): HorizonMode;
  horizonMode(mode: HorizonMode): HorizonTSChart;
  yNormalize(): boolean;
  yNormalize(normalize: boolean): HorizonTSChart;

  yExtent(): SeriesAccessor<number | undefined>;
  yExtent(extentAccessor: SeriesAccessor<number | undefined>): HorizonTSChart;
  yScaleExp(): SeriesAccessor<number>;
  yScaleExp(exponentAccessor: SeriesAccessor<number>): HorizonTSChart;
  yAggregation(): AggregationFn<number>;
  yAggregation(aggFn: AggregationFn<number>): HorizonTSChart;

  positiveColors(): SeriesAccessor<string[]>;
  positiveColors(colorsAccessor: SeriesAccessor<string[]>): HorizonTSChart;
  positiveColorStops(): SeriesAccessor<number[]>;
  positiveColorStops(colorStopsAccessor: SeriesAccessor<number[]>): HorizonTSChart;
  negativeColors(): SeriesAccessor<string[]>;
  negativeColors(colorsAccessor: SeriesAccessor<string[]>): HorizonTSChart;
  negativeColorStops(): SeriesAccessor<number[]>;
  negativeColorStops(colorStopsAccessor: SeriesAccessor<number[]>): HorizonTSChart;

  interpolationCurve(): InterpolationCurveFn;
  interpolationCurve(fn: InterpolationCurveFn | false): HorizonTSChart;

  showRuler(): boolean;
  showRuler(show: boolean): HorizonTSChart;
  enableZoom(): boolean;
  enableZoom(enable: boolean): HorizonTSChart;
  transitionDuration(): number;
  transitionDuration(ms: number): HorizonTSChart;

  tooltipContent(): TooltipAccessorFn;
  tooltipContent(contentAccessor: TooltipAccessorFn): HorizonTSChart;
  onClick(cb: InteractionFn): HorizonTSChart;
  onHover(cb: InteractionFn): HorizonTSChart;
}

export default HorizonTSChart;
