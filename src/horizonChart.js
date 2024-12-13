import { select as d3Select } from 'd3-selection';
import { transition as d3Transition } from 'd3-transition';
import { zoom as d3Zoom, zoomTransform as d3ZoomTransform } from 'd3-zoom';
import { axisBottom as d3AxisBottom } from 'd3-axis';
import { scaleTime as d3ScaleTime, scaleUtc as d3ScaleUtc } from 'd3-scale';
import { curveBasis as d3CurveBasis } from 'd3-shape';
import { extent as d3Extent, max as d3Max } from 'd3-array';
import Horizon from 'd3-horizon';
import Kapsule from 'kapsule';
import accessorFn from 'accessor-fn';
import indexBy from 'index-array-by';
import memo from 'lodash.memoize';

import axisTimeFormatter from './axisTimeFormatter';

const AXIS_HEIGHT = 20;
const MAX_FONT_SIZE = 13;
const MIN_SERIES_HEIGHT_WITH_BORDER = 20;
const MAX_ZOOM_SCALE = 5000;

export default Kapsule({
  props: {
    width: { default: window.innerWidth },
    height: { default: window.innerHeight },
    data: { default: [] },
    ts: { default: 'ts' },
    val: { default: 'val' },
    series: {},
    seriesComparator: { default: (a, b) => a.localeCompare(b) },
    horizonBands: { default: 4 },
    horizonMode: { default: 'offset' }, // or mirror
    useUtc: { default: false }, // local timezone vs utc
    use24h: { default: true }, // 24h vs am/pm format
    yExtent: {}, // undefined means it will be derived dynamically from the data
    yNormalize: { default: false },
    yScaleExp: { default: 1 },
    yAggregation: { default: vals => vals.reduce((agg, val) => agg + val) }, // sum reduce
    positiveColors: { default: ['white', 'midnightblue'] },
    negativeColors: { default: ['white', 'crimson'] },
    positiveColorStops: {},
    negativeColorStops: {},
    interpolationCurve: { default: d3CurveBasis },
    seriesLabelFormatter: { default: series => series },
    showRuler: {
      default: true,
      triggerUpdate: false,
      onChange: (show, state) => state.ruler && state.ruler.style('visibility', show ? 'visible' : 'hidden')
    },
    enableZoom: { default: false },
    tooltipContent: { default: ({ series, ts, val, useUtc, use24h }) =>
      `<b>${series}</b><br>
      ${new Date(ts).toLocaleString(undefined, { timeZone: useUtc ? 'UTC' : undefined, hour12: !use24h })}:
      <b>${val}</b>`
    },
    transitionDuration: { default: 250 },
    onHover: { triggerUpdate: false },
    onClick: {}
  },

  stateInit() {
    return {
      horizonLayouts: {}, // per series
      zoomedInteraction: false,
      timeAxis: d3AxisBottom()
    }
  },

  init(el, state) {
    const isD3Selection = !!el && typeof el === 'object' && !!el.node && typeof el.node === 'function';
    const d3El = d3Select(isD3Selection ? el.node() : el);
    d3El.html(null); // wipe DOM

    state.chartsEl = d3El.append('div')
      .style('position', 'relative');

    state.ruler = state.chartsEl.append('div')
      .attr('class', 'horizon-ruler');

    state.axisEl = d3El.append('svg')
      .attr('height', AXIS_HEIGHT)
      .style('display', 'block');

    // Bind zoom
    state.chartsEl.call(state.zoom = d3Zoom());
    state.zoom.__baseElem = state.chartsEl; // Attach controlling elem for easy access
    state.zoom
      .on('zoom', () => {
        if (state.enableZoom) {
          state.zoomedInteraction = true;
          state._rerender();
        }
      });
  },

  update(state) {
    const valAccessor = accessorFn(state.val);
    const yExtentAccessor = accessorFn(state.yExtent);
    const yScaleExpAccessor = accessorFn(state.yScaleExp);
    const positiveColorsAccessor = accessorFn(state.positiveColors);
    const negativeColorsAccessor = accessorFn(state.negativeColors);
    const positiveColorStopsAccessor = accessorFn(state.positiveColorStops);
    const negativeColorStopsAccessor = accessorFn(state.negativeColorStops);

    // memoize to prevent calling timeAccessor multiple times
    const tsMemo = memo(accessorFn(state.ts));

    const times = state.data.map(tsMemo);
    const timeScale = (state.useUtc ? d3ScaleUtc : d3ScaleTime)()
      .domain(d3Extent(times))
      .range([0, state.width]);

    // const timeAxis = d3AxisBottom(timeScale)
    state.timeAxis
      .scale(timeScale)
      .tickFormat(axisTimeFormatter({ useUtc: state.useUtc, use24h: state.use24h }));

    // set scale extent to 1 if zoom is disabled, to allow default wheel events to bubble
    state.zoom.scaleExtent([1, state.enableZoom ? MAX_ZOOM_SCALE : 1]);

    if (state.enableZoom) {
      state.zoom.translateExtent([[0, 0], [state.width, 0]]);

      // apply zoom
      const zoomTransform = d3ZoomTransform(state.zoom.__baseElem.node());
      const zoomedTimeLength = (timeScale.domain()[1] - timeScale.domain()[0]) / zoomTransform.k;
      const zoomedStartTime = timeScale.invert(-zoomTransform.x / zoomTransform.k);
      timeScale.domain([zoomedStartTime, new Date(+zoomedStartTime + zoomedTimeLength)]);
    }

    const bySeries = indexBy(state.data, state.series);
    const seriesData = Object.keys(bySeries)
      .sort(state.seriesComparator)
      .map(series => ({
        series,
        data: bySeries[series]
      }));

    // Calculate global Y max if yNormalize is on
    const normalizedYMax = !state.yNormalize ? null : d3Max(
      indexBy(
        state.data,
        [state.series, d => +tsMemo(d)],
        points => state.yAggregation(points.map(valAccessor)),
        true
      )
      .map(d => d.vals)
      .map(Math.abs) // get max absolute val
    );

    const seriesHeight = (state.height - AXIS_HEIGHT) / seriesData.length;
    const fontSize = Math.min(MAX_FONT_SIZE, Math.round(seriesHeight * 0.9));
    const borderWidth = seriesHeight >= MIN_SERIES_HEIGHT_WITH_BORDER ? 1 : 0;

    const tr = d3Transition().duration(state.zoomedInteraction ? 0 :state.transitionDuration);

    const horizons = state.chartsEl.selectAll('.horizon-series')
      .data(seriesData, d => d.series);

    horizons.exit()
      .each(({ series }) => {
        state.horizonLayouts[series].height(0);
        delete state.horizonLayouts[series];
      })
      .transition(tr)
        .remove();

    const newHorizons = horizons.enter()
      .append('div')
      .attr('class', 'horizon-series');

    newHorizons.append('div')
      .attr('class', 'chart')
      .each(function({ series }) {
        // instantiate horizon for each new series
        state.horizonLayouts[series] = new Horizon(this)
          .width(state.width)
          .height(seriesHeight - borderWidth);
      });
    newHorizons.append('span')
      .attr('class', 'label')
      .style('font-size', 0);

    const allHorizons = horizons.merge(newHorizons).order();

    allHorizons
      .transition(tr)
        .style('width', state.width)
        .style('border-top-width', `${borderWidth}px`);

    allHorizons.select('.chart')
      .each(({ series, data }) => state.horizonLayouts[series]
        .width(state.width)
        .height(seriesHeight - borderWidth)
        .data(data)
        .bands(state.horizonBands)
        .mode(state.horizonMode)
        .x(tsMemo)
        .y(valAccessor)
        .yExtent(yExtentAccessor(series) || normalizedYMax || null) // Use normalizedYMax (if calculated) if yExtent is not explicitly set
        .yScaleExp(yScaleExpAccessor(series))
        .yAggregation(state.yAggregation)
        .xMin(timeScale.domain()[0])
        .xMax(timeScale.domain()[1])
        .positiveColors(positiveColorsAccessor(series))
        .negativeColors(negativeColorsAccessor(series))
        .positiveColorStops(positiveColorStopsAccessor(series))
        .negativeColorStops(negativeColorStopsAccessor(series))
        .interpolationCurve(state.interpolationCurve)
        .duration(state.transitionDuration)
        .tooltipContent(state.tooltipContent && (({ x, y, ...rest }) => state.tooltipContent({ series, ts: x, val: y, ...rest, useUtc: state.useUtc, use24h: state.use24h })))
        .onHover(d => {
          d && state.ruler.style('left', `${timeScale(d.x)}px`);
          state.ruler.style('opacity', d ? 0.2 : 0);

          d && state.onHover && state.onHover({ series, ts: d.x, val: d.y, points: d.points });
        })
        .onClick(state.onClick ? d => d && state.onClick({ series, ts: d.x, val: d.y, points: d.points }) : undefined)
      );

    allHorizons.select('.label')
      .transition(tr)
        .style('font-size', `${fontSize}px`)
        .text(d => state.seriesLabelFormatter(d.series));

    state.axisEl
      .call(state.timeAxis)
      .transition(tr)
        .attr('width', state.width);

    state.zoomedInteraction = false;
  }
});