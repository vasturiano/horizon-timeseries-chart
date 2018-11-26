import { select as d3Select, event as d3Event } from 'd3-selection';
import { transition as d3Transition } from 'd3-transition';
import { zoom as d3Zoom, zoomTransform as d3ZoomTransform } from 'd3-zoom';
import { axisBottom as d3AxisBottom } from 'd3-axis';
import { scaleTime as d3ScaleTime } from 'd3-scale';
import { timeFormat as d3TimeFormat } from 'd3-time-format';
import { extent as d3Extent } from 'd3-array';
import d3Horizon from 'd3-horizon';
import Kapsule from 'kapsule';
import accessorFn from 'accessor-fn';
import indexBy from 'index-array-by';
import memo from 'lodash.memoize';

const AXIS_HEIGHT = 20;
const MAX_FONT_SIZE = 13;
const MIN_SERIES_HEIGHT_WITH_BORDER = 20;
const MAX_ZOOM_SCALE = 5000;

const timeFormat = d3TimeFormat('%Y-%m-%d %-I:%M:%S %p');

export default Kapsule({
  props: {
    width: { default: window.innerWidth },
    height: { default: window.innerHeight },
    data: { default: [] },
    ts: { default: d => d[0] },
    val: { default: d => d[1] },
    series: {},
    seriesComparator: { default: (a, b) => a.localeCompare(b) },
    horizonBands: { default: 4 },
    horizonMode: { default: 'offset' }, // or mirror
    yExtent: {}, // undefined means it will be derived dynamically from the data
    yScaleExp: { default: 1 },
    positiveColorRange: { default: ['white', 'midnightblue'] },
    negativeColorRange: { default: ['white', 'crimson'] },
    seriesLabelFormatter: { default: series => series },
    showRuler: {
      default: true,
      triggerUpdate: false,
      onChange: (show, state) => state.ruler && state.ruler.style('visibility', show ? 'visible' : 'hidden')
    },
    enableZoom: { default: false },
    tooltipContent: { default: ({ series, ts, val }) => `<b>${series}</b><br>${timeFormat(ts)}: <b>${val}</b>` },
    transitionDuration: { default: 250 }
  },

  stateInit() {
    return {
      timeScale: d3ScaleTime(),
      horizonLayouts: {}, // per series
      zoomedInteraction: false
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
      .scaleExtent([1, MAX_ZOOM_SCALE])
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

    // memoize to prevent calling timeAccessor multiple times
    const tsMemo = memo(accessorFn(state.ts));

    const times = state.data.map(tsMemo);
    state.timeScale
      .domain(d3Extent(times))
      .range([0, state.width]);

    if (state.enableZoom) {
      state.zoom.translateExtent([[0, 0], [state.width, 0]]);

      // apply zoom
      const zoomTransform = d3ZoomTransform(state.zoom.__baseElem.node());
      const zoomedTimeLength = (state.timeScale.domain()[1] - state.timeScale.domain()[0]) / zoomTransform.k;
      const zoomedStartTime = state.timeScale.invert(-zoomTransform.x / zoomTransform.k);
      state.timeScale.domain([zoomedStartTime, new Date(+zoomedStartTime + zoomedTimeLength)]);
    }

    const bySeries = indexBy(state.data, state.series);
    const seriesData = Object.keys(bySeries)
      .sort(state.seriesComparator)
      .map(series => ({
        series,
        data: bySeries[series]
      }));

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
        // instantiate d3-horizon for each new series
        state.horizonLayouts[series] = d3Horizon()(this);
      });
    newHorizons.append('span')
      .attr('class', 'label')
      .style('font-size', 0);

    const allHorizons = horizons.merge(newHorizons);

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
        .yExtent(yExtentAccessor(series))
        .yScaleExp(yScaleExpAccessor(series))
        .xMin(state.timeScale.domain()[0])
        .xMax(state.timeScale.domain()[1])
        .positiveColorRange(state.positiveColorRange)
        .negativeColorRange(state.negativeColorRange)
        .duration(state.transitionDuration)
        .tooltipContent(state.tooltipContent && (({ x, y, ...rest }) => state.tooltipContent({ series, ts: x, val: y, ...rest })))
        .onHover(d => {
          d && state.ruler.style('left', `${state.timeScale(d.x)}px`);
          state.ruler.style('opacity', d ? 0.2 : 0);
        })
      );

    allHorizons.select('.label')
      .transition(tr)
        .style('font-size', `${fontSize}px`)
        .text(d => state.seriesLabelFormatter(d.series));

    state.axisEl
      .transition(tr)
        .attr('width', state.width)
        .call(d3AxisBottom(state.timeScale));

    state.zoomedInteraction = false;
  }
});