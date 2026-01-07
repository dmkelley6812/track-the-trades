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
  STACKED: 'stacked',
};

// Widget dimension constraints
export const WIDGET_CONSTRAINTS = {
  KPI: { minW: 1, maxW: 2, minH: 1, maxH: 2, stackable: true },
  CHART: { minW: 1, maxW: 4, minH: 1, maxH: 4, stackable: false },
  LIST: { minW: 1, maxW: 4, minH: 1, maxH: 4, stackable: false },
  CALENDAR: { minW: 2, maxW: 4, minH: 2, maxH: 4, stackable: false },
};

export const WIDGET_CONFIG = {
  [WIDGET_TYPES.TOTAL_PNL]: {
    label: 'Total P&L',
    category: 'KPI',
    defaultSize: { w: 1, h: 1 },
    constraints: WIDGET_CONSTRAINTS.KPI,
    stackable: true,
  },
  [WIDGET_TYPES.WIN_RATE]: {
    label: 'Win Rate',
    category: 'KPI',
    defaultSize: { w: 1, h: 1 },
    constraints: WIDGET_CONSTRAINTS.KPI,
    stackable: true,
  },
  [WIDGET_TYPES.PROFIT_FACTOR]: {
    label: 'Profit Factor',
    category: 'KPI',
    defaultSize: { w: 1, h: 1 },
    constraints: WIDGET_CONSTRAINTS.KPI,
    stackable: true,
  },
  [WIDGET_TYPES.EXPECTANCY]: {
    label: 'Expectancy',
    category: 'KPI',
    defaultSize: { w: 1, h: 1 },
    constraints: WIDGET_CONSTRAINTS.KPI,
    stackable: true,
  },
  [WIDGET_TYPES.TOTAL_TRADES]: {
    label: 'Total Trades',
    category: 'KPI',
    defaultSize: { w: 1, h: 1 },
    constraints: WIDGET_CONSTRAINTS.KPI,
  },
  [WIDGET_TYPES.AVG_WIN]: {
    label: 'Average Win',
    category: 'KPI',
    defaultSize: { w: 1, h: 1 },
    constraints: WIDGET_CONSTRAINTS.KPI,
    stackable: true,
  },
  [WIDGET_TYPES.AVG_LOSS]: {
    label: 'Average Loss',
    category: 'KPI',
    defaultSize: { w: 1, h: 1 },
    constraints: WIDGET_CONSTRAINTS.KPI,
  },
  [WIDGET_TYPES.BEST_DAY]: {
    label: 'Best Day',
    category: 'KPI',
    defaultSize: { w: 1, h: 1 },
    constraints: WIDGET_CONSTRAINTS.KPI,
  },
  [WIDGET_TYPES.WORST_DAY]: {
    label: 'Worst Day',
    category: 'KPI',
    defaultSize: { w: 1, h: 1 },
    constraints: WIDGET_CONSTRAINTS.KPI,
  },
  [WIDGET_TYPES.LARGEST_DRAWDOWN]: {
    label: 'Largest Drawdown',
    category: 'KPI',
    defaultSize: { w: 1, h: 1 },
    constraints: WIDGET_CONSTRAINTS.KPI,
  },
  [WIDGET_TYPES.PNL_CHART]: {
    label: 'Cumulative P&L Chart',
    category: 'Chart',
    defaultSize: { w: 4, h: 4 },
    constraints: WIDGET_CONSTRAINTS.CHART,
  },
  [WIDGET_TYPES.WIN_RATE_GAUGE]: {
    label: 'Win Rate Gauge',
    category: 'Chart',
    defaultSize: { w: 2, h: 2 },
    constraints: WIDGET_CONSTRAINTS.CHART,
  },
  [WIDGET_TYPES.RECENT_TRADES]: {
    label: 'Recent Trades',
    category: 'List',
    defaultSize: { w: 4, h: 4 },
    constraints: WIDGET_CONSTRAINTS.LIST,
  },
  [WIDGET_TYPES.TRADE_CALENDAR]: {
    label: 'Trade Calendar',
    category: 'Chart',
    defaultSize: { w: 4, h: 4 },
    constraints: WIDGET_CONSTRAINTS.CALENDAR,
  },
  [WIDGET_TYPES.PNL_BY_DAY_OF_WEEK]: {
    label: 'P&L by Day of Week',
    category: 'Chart',
    defaultSize: { w: 2, h: 2 },
    constraints: WIDGET_CONSTRAINTS.CHART,
  },
  [WIDGET_TYPES.TRADE_COUNT_BY_DAY]: {
    label: 'Trade Count by Day',
    category: 'Chart',
    defaultSize: { w: 2, h: 2 },
    constraints: WIDGET_CONSTRAINTS.CHART,
  },
  [WIDGET_TYPES.PNL_BY_STRATEGY]: {
    label: 'P&L by Strategy',
    category: 'Chart',
    defaultSize: { w: 2, h: 2 },
    constraints: WIDGET_CONSTRAINTS.CHART,
  },
  [WIDGET_TYPES.STACKED]: {
    label: 'Stacked',
    category: 'Container',
    defaultSize: { w: 1, h: 1 },
    constraints: { minW: 1, maxW: 1, minH: 1, maxH: 1 },
    stackable: false,
  },
};

export const DEFAULT_LAYOUT = [
  { id: '1', type: WIDGET_TYPES.TOTAL_PNL, w: 1, h: 1, visible: true, x: 0, y: 0 },
  { id: '2', type: WIDGET_TYPES.WIN_RATE, w: 1, h: 1, visible: true, x: 1, y: 0 },
  { id: '3', type: WIDGET_TYPES.PROFIT_FACTOR, w: 1, h: 1, visible: true, x: 2, y: 0 },
  { id: '4', type: WIDGET_TYPES.EXPECTANCY, w: 1, h: 1, visible: true, x: 3, y: 0 },
  { id: '5', type: WIDGET_TYPES.TOTAL_TRADES, w: 1, h: 1, visible: true, x: 0, y: 1 },
  { id: '6', type: WIDGET_TYPES.PNL_CHART, w: 4, h: 4, visible: true, x: 0, y: 2 },
  { id: '7', type: WIDGET_TYPES.WIN_RATE_GAUGE, w: 2, h: 2, visible: true, x: 1, y: 1 },
  { id: '8', type: WIDGET_TYPES.RECENT_TRADES, w: 4, h: 4, visible: true, x: 0, y: 6 },
  { id: '9', type: WIDGET_TYPES.TRADE_CALENDAR, w: 4, h: 4, visible: true, x: 0, y: 10 },
];

// Generate react-grid-layout compatible layout from widget config
export function generateGridLayout(widgets) {
  return widgets
    .filter(w => w.visible && !w.stacked)
    .map(widget => {
      const config = WIDGET_CONFIG[widget.type];
      const constraints = config?.constraints || WIDGET_CONSTRAINTS.KPI;
      
      const w = widget.w ?? config.defaultSize.w;
      const h = widget.h ?? config.defaultSize.h;
      
      return {
        i: widget.id,
        x: widget.x ?? 0,
        y: widget.y ?? 0,
        w: Math.min(Math.max(w, constraints.minW), constraints.maxW),
        h: Math.min(Math.max(h, constraints.minH), constraints.maxH),
        minW: constraints.minW,
        maxW: constraints.maxW,
        minH: constraints.minH,
        maxH: constraints.maxH,
        static: false,
      };
    });
}

// Validate widget dimensions
export function validateWidgetDimensions(widgetType, dimensions) {
  const config = WIDGET_CONFIG[widgetType];
  if (!config) return { w: 1, h: 1 };
  
  const constraints = config.constraints;
  return {
    w: Math.min(Math.max(dimensions.w, constraints.minW), constraints.maxW),
    h: Math.min(Math.max(dimensions.h, constraints.minH), constraints.maxH),
  };
}