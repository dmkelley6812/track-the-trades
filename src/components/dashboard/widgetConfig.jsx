export const WIDGET_TYPES = {
  TOTAL_PNL: 'total_pnl',
  WIN_RATE: 'win_rate',
  PROFIT_FACTOR: 'profit_factor',
  EXPECTANCY: 'expectancy',
  TOTAL_TRADES: 'total_trades',
  AVG_WIN: 'avg_win',
  AVG_LOSS: 'avg_loss',
  BEST_DAY: 'best_day',
  WORST_DAY: 'worst_day',
  LARGEST_DRAWDOWN: 'largest_drawdown',
  PNL_CHART: 'pnl_chart',
  WIN_RATE_GAUGE: 'win_rate_gauge',
  RECENT_TRADES: 'recent_trades',
  TRADE_CALENDAR: 'trade_calendar',
  PNL_BY_DAY_OF_WEEK: 'pnl_by_day_of_week',
  TRADE_COUNT_BY_DAY: 'trade_count_by_day',
  PNL_BY_STRATEGY: 'pnl_by_strategy',
};

export const WIDGET_SIZES = {
  SMALL: 'SMALL',
  MEDIUM_TALL: 'MEDIUM_TALL',
  MEDIUM_SQUARE: 'MEDIUM_SQUARE',
  LARGE: 'LARGE',
};

export const WIDGET_CONFIG = {
  [WIDGET_TYPES.TOTAL_PNL]: {
    label: 'Total P&L',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM_TALL],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.WIN_RATE]: {
    label: 'Win Rate',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM_TALL],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.PROFIT_FACTOR]: {
    label: 'Profit Factor',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM_TALL],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.EXPECTANCY]: {
    label: 'Expectancy',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM_TALL],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.TOTAL_TRADES]: {
    label: 'Total Trades',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM_TALL],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.AVG_WIN]: {
    label: 'Average Win',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM_TALL],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.AVG_LOSS]: {
    label: 'Average Loss',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM_TALL],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.BEST_DAY]: {
    label: 'Best Day',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM_TALL],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.WORST_DAY]: {
    label: 'Worst Day',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM_TALL],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.LARGEST_DRAWDOWN]: {
    label: 'Largest Drawdown',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM_TALL],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.PNL_CHART]: {
    label: 'Cumulative P&L Chart',
    category: 'Chart',
    allowedSizes: [WIDGET_SIZES.MEDIUM_SQUARE, WIDGET_SIZES.LARGE],
    defaultSize: WIDGET_SIZES.LARGE,
  },
  [WIDGET_TYPES.WIN_RATE_GAUGE]: {
    label: 'Win Rate Gauge',
    category: 'Chart',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM_SQUARE],
    defaultSize: WIDGET_SIZES.MEDIUM_SQUARE,
  },
  [WIDGET_TYPES.RECENT_TRADES]: {
    label: 'Recent Trades',
    category: 'List',
    allowedSizes: [WIDGET_SIZES.LARGE],
    defaultSize: WIDGET_SIZES.LARGE,
  },
  [WIDGET_TYPES.TRADE_CALENDAR]: {
    label: 'Trade Calendar',
    category: 'Chart',
    allowedSizes: [WIDGET_SIZES.LARGE],
    defaultSize: WIDGET_SIZES.LARGE,
  },
  [WIDGET_TYPES.PNL_BY_DAY_OF_WEEK]: {
    label: 'P&L by Day of Week',
    category: 'Chart',
    allowedSizes: [WIDGET_SIZES.MEDIUM_SQUARE, WIDGET_SIZES.LARGE],
    defaultSize: WIDGET_SIZES.MEDIUM_SQUARE,
  },
  [WIDGET_TYPES.TRADE_COUNT_BY_DAY]: {
    label: 'Trade Count by Day',
    category: 'Chart',
    allowedSizes: [WIDGET_SIZES.MEDIUM_SQUARE],
    defaultSize: WIDGET_SIZES.MEDIUM_SQUARE,
  },
  [WIDGET_TYPES.PNL_BY_STRATEGY]: {
    label: 'P&L by Strategy',
    category: 'Chart',
    allowedSizes: [WIDGET_SIZES.MEDIUM_SQUARE, WIDGET_SIZES.LARGE],
    defaultSize: WIDGET_SIZES.MEDIUM_SQUARE,
  },
};

export const DEFAULT_LAYOUT = [
  { id: '1', type: WIDGET_TYPES.TOTAL_PNL, size: WIDGET_SIZES.SMALL, visible: true, x: 0, y: 0 },
  { id: '2', type: WIDGET_TYPES.WIN_RATE, size: WIDGET_SIZES.SMALL, visible: true, x: 1, y: 0 },
  { id: '3', type: WIDGET_TYPES.PROFIT_FACTOR, size: WIDGET_SIZES.SMALL, visible: true, x: 2, y: 0 },
  { id: '4', type: WIDGET_TYPES.EXPECTANCY, size: WIDGET_SIZES.SMALL, visible: true, x: 3, y: 0 },
  { id: '5', type: WIDGET_TYPES.TOTAL_TRADES, size: WIDGET_SIZES.SMALL, visible: true, x: 0, y: 1 },
  { id: '6', type: WIDGET_TYPES.PNL_CHART, size: WIDGET_SIZES.LARGE, visible: true, x: 0, y: 2 },
  { id: '7', type: WIDGET_TYPES.WIN_RATE_GAUGE, size: WIDGET_SIZES.MEDIUM_SQUARE, visible: true, x: 1, y: 1 },
  { id: '8', type: WIDGET_TYPES.RECENT_TRADES, size: WIDGET_SIZES.LARGE, visible: true, x: 0, y: 6 },
  { id: '9', type: WIDGET_TYPES.TRADE_CALENDAR, size: WIDGET_SIZES.LARGE, visible: true, x: 0, y: 10 },
];

// Generate react-grid-layout compatible layout from widget config
export function generateGridLayout(widgets) {
  return widgets
    .filter(w => w.visible)
    .map(widget => {
      const validSize = validateWidgetSize(widget.type, widget.size);
      const dimensions = getWidgetDimensions(validSize);
      
      // Use stored w/h if available and valid, otherwise use dimensions from size
      const w = (widget.w && widget.w === dimensions.w) ? widget.w : dimensions.w;
      const h = (widget.h && widget.h === dimensions.h) ? widget.h : dimensions.h;
      
      return {
        i: widget.id,
        x: widget.x ?? 0,
        y: widget.y ?? 0,
        w,
        h,
        minW: dimensions.w,
        maxW: dimensions.w,
        minH: dimensions.h,
        maxH: dimensions.h,
        static: false, // Allow dragging
      };
    });
}

// Convert widget size to grid dimensions (w, h)
export function getWidgetDimensions(size) {
  switch (size) {
    case WIDGET_SIZES.SMALL:
      return { w: 1, h: 1 }; // 1x1 square
    case WIDGET_SIZES.MEDIUM_TALL:
      return { w: 1, h: 2 }; // 1x2 tall rectangle
    case WIDGET_SIZES.MEDIUM_SQUARE:
      return { w: 2, h: 2 }; // 2x2 square
    case WIDGET_SIZES.LARGE:
      return { w: 4, h: 4 }; // 4x4 full width square
    default:
      return { w: 1, h: 1 };
  }
}

// Validate and coerce widget size to allowed sizes
export function validateWidgetSize(widgetType, size) {
  const config = WIDGET_CONFIG[widgetType];
  if (!config) return WIDGET_SIZES.SMALL;
  
  if (config.allowedSizes.includes(size)) {
    return size;
  }
  
  return config.defaultSize;
}