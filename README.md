# Horizon Time-series Chart

<p align="center">
     <a href="https://vasturiano.github.io/horizon-timeseries-chart/example/basic/"><img width="80%" src="https://vasturiano.github.io/horizon-timeseries-chart/example/basic/screenshot.png"></a>
</p>

An interactive vertically stacked horizon chart to represent time-series data.

For more information on the Horizon visual representation method, please see [`d3-horizon`](https://github.com/vasturiano/d3-horizon).

[![NPM](https://nodei.co/npm/horizon-timeseries-chart.png?compact=true)](https://nodei.co/npm/horizon-timeseries-chart/)

Check out the examples:
* [Basic multi-series with random generated data](https://vasturiano.github.io/horizon-timeseries-chart/example/basic/) ([source](https://github.com/vasturiano/horizon-timeseries-chart/blob/master/example/basic/index.html))
* [Zoom interaction on large data set](https://vasturiano.github.io/horizon-timeseries-chart/example/large-zoom/) ([source](https://github.com/vasturiano/horizon-timeseries-chart/blob/master/example/large-zoom/index.html))
* [Live-updating data insertion](https://vasturiano.github.io/horizon-timeseries-chart/example/live-update/) ([source](https://github.com/vasturiano/horizon-timeseries-chart/blob/master/example/live-update/index.html))

## Quick start

```
import HorizonTSChart from 'horizon-timeseries-chart';
```
or
```
HorizonTSChart = require('horizon-timeseries-chart');
```
or even
```
<script src="//unpkg.com/horizon-timeseries-chart"></script>
```
then
```
const myChart = HorizonTSChart();
myChart
    .data(<myData>)
    (<myDOMElement>);
```

## API reference

| Method | Description | Default |
|---|---|:---:|
| <b>width</b>([<i>px</i>]) | Getter/setter for the chart width. | *&lt;window width&gt;* |
| <b>height</b>([<i>px</i>]) | Getter/setter for the chart height. This height will be divided equally between all the vertically stacked series. | *&lt;window height&gt;* |
| <b>data</b>([<i>array</i>]) | Getter/setter for the chart data, as an array of data points. The syntax of each item is defined by the `series`, `ts` and `val` accessor methods. | `[]` |
| <b>series</b>([<i>string</i> or <i>fn</i>]) | Getter/setter for the data point accessor function to extract the `series`. A `function` receives the data point as input and should return the unique series identifier. A string indicates the object attribute to use. | |
| <b>seriesComparator</b>([<i>fn(a, b)</i>]) | Getter/setter for the comparator function used to sort the series from top to bottom. The function should follow the signature `function(seriesA, seriesB)` and return a numeric value. | `(a, b) => a.localeCompare(b)` |
| <b>seriesLabelFormatter</b>([<i>fn(series)</i>]) | Getter/setter for the series label formatter function, used to show labels on the left-hand side of each series. The formatter should receive a series ID, as present in the data, and return a string. | `series => series` |
| <b>ts</b>([<i>string</i> or <i>fn</i>]) | Getter/setter for the data point accessor function to extract the x-axis timestamp. A `function` receives the data point as input and should return a number or a [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object indicating the point time. A string indicates the object attribute to use. The default accessor assumes the data points are formatted as arrays: `[<timestamp>, <value>]`. | `d => d[0]` |
| <b>val</b>([<i>string</i> or <i>fn</i>]) | Getter/setter for the data point accessor function to extract the y-axis numeric value. A `function` receives the data point as input and should return a number. A string indicates the object attribute to use. The default accessor assumes the data points are formatted as arrays: `[<timestamp>, <value>]` | `d => d[1]` |
| <b>horizonBands</b>([<i>number</i>]) | Getter/setter for the number of horizon bands to use. | 4 |
| <b>horizonMode</b>([<i>'offset'</i> or <i>'mirror'</i>]) | Getter/setter for the mode used to represent negative values. `offset` renders the negative values from the top of the chart downwards, while `mirror` represents them upwards as if they were positive values, albeit with a different color. | `offset` |
| <b>yExtent</b>([<i>number</i> or <i>fn</i>]) | Getter/setter for the series accessor function to set the y-axis maximum absolute value. By default (`undefined`), the max Y is calculated dynamically from the data. A `function` receives the series ID as input and should return a numeric value. A `number` sets the same extent for all the series. | `undefined` |
| <b>yScaleExp</b>([<i>number</i> or <i>fn</i>]) | Getter/setter for the series accessor function to set the y-axis scale exponent. Only values `> 0` are supported. An exponent of `1` (default) represents a linear Y scale. A `function` receives the series ID as input and should return a numeric value. A `number` sets the same scale exponent for all the series. | 1 |
| <b>positiveColorRange</b>([<i>[&lt;minColor&gt;, &lt;maxColor&gt;]</i>]) | Getter/setter for the color range to use for the positive value bands. The top band gets assigned the max color, and the other bands are colored according to a linear interpolation of the color range. | `['white', 'midnightBlue']` |
| <b>negativeColorRange</b>([<i>[&lt;minColor&gt;, &lt;maxColor&gt;]</i>]) | Getter/setter for the color range to use for the negative value bands. The top band gets assigned the max color, and the other bands are colored according to a linear interpolation of the color range. | `['white', 'crimson']` |
| <b>showRuler</b>([<i>boolean</i>]) | Getter/setter for whether to show a vertical ruler highlighting the closest time point across all series. | `true` |
| <b>enableZoom</b>([<i>boolean</i>]) | Getter/setter for whether to enable pointer-based zoom interactions on the chart, along the time (x-axis) dimension. | `false` |
| <b>transitionDuration</b>([<i>ms</i>]) | Getter/setter for the duration (in milliseconds) of the transitions between data states. | 250 |
| <b>tooltipContent</b>([<i>fn({series, ts, val, points})</i>]) | Getter/setter for the tooltip content accessor function. Accepts plain-text or HTML. A value of `null` will permanently hide the tooltip. | ```({ series, ts, val }) => `${series}<br>${ts}: ${val}` ``` |
