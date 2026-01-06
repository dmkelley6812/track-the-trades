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
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
};

export const WIDGET_CONFIG = {
  [WIDGET_TYPES.TOTAL_PNL]: {
    label: 'Total P&L',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.WIN_RATE]: {
    label: 'Win Rate',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.PROFIT_FACTOR]: {
    label: 'Profit Factor',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.EXPECTANCY]: {
    label: 'Expectancy',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.TOTAL_TRADES]: {
    label: 'Total Trades',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.AVG_WIN]: {
    label: 'Average Win',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.AVG_LOSS]: {
    label: 'Average Loss',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.BEST_DAY]: {
    label: 'Best Day',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.WORST_DAY]: {
    label: 'Worst Day',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.LARGEST_DRAWDOWN]: {
    label: 'Largest Drawdown',
    category: 'KPI',
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM],
    defaultSize: WIDGET_SIZES.SMALL,
  },
  [WIDGET_TYPES.PNL_CHART]: {
    label: 'Cumulative P&L Chart',
    category: 'Chart',
    allowedSizes: [WIDGET_SIZES.MEDIUM, WIDGET_SIZES.LARGE],
    defaultSize: WIDGET_SIZES.LARGE,
  },
  [WIDGET_TYPES.WIN_RATE_GAUGE]: {
    label: 'Win Rate Gauge',
    category: 'Chart',
    allowedSizes: [WIDGET_SIZES.MEDIUM],
    defaultSize: WIDGET_SIZES.MEDIUM,
  },
  [WIDGET_TYPES.RECENT_TRADES]: {
    label: 'Recent Trades',
    category: 'List',
    allowedSizes: [WIDGET_SIZES.MEDIUM, WIDGET_SIZES.LARGE],
    defaultSize: WIDGET_SIZES.MEDIUM,
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
    allowedSizes: [WIDGET_SIZES.MEDIUM, WIDGET_SIZES.LARGE],
    defaultSize: WIDGET_SIZES.MEDIUM,
  },
  [WIDGET_TYPES.TRADE_COUNT_BY_DAY]: {
    label: 'Trade Count by Day',
    category: 'Chart',
    allowedSizes: [WIDGET_SIZES.MEDIUM],
    defaultSize: WIDGET_SIZES.MEDIUM,
  },
  [WIDGET_TYPES.PNL_BY_STRATEGY]: {
    label: 'P&L by Strategy',
    category: 'Chart',
    allowedSizes: [WIDGET_SIZES.MEDIUM, WIDGET_SIZES.LARGE],
    defaultSize: WIDGET_SIZES.MEDIUM,
  },
};

export const DEFAULT_LAYOUT = [
  { id: '1', type: WIDGET_TYPES.TOTAL_PNL, size: WIDGET_SIZES.SMALL, visible: true },
  { id: '2', type: WIDGET_TYPES.WIN_RATE, size: WIDGET_SIZES.SMALL, visible: true },
  { id: '3', type: WIDGET_TYPES.PROFIT_FACTOR, size: WIDGET_SIZES.SMALL, visible: true },
  { id: '4', type: WIDGET_TYPES.EXPECTANCY, size: WIDGET_SIZES.SMALL, visible: true },
  { id: '5', type: WIDGET_TYPES.TOTAL_TRADES, size: WIDGET_SIZES.SMALL, visible: true },
  { id: '6', type: WIDGET_TYPES.PNL_CHART, size: WIDGET_SIZES.LARGE, visible: true },
  { id: '7', type: WIDGET_TYPES.WIN_RATE_GAUGE, size: WIDGET_SIZES.MEDIUM, visible: true },
  { id: '8', type: WIDGET_TYPES.RECENT_TRADES, size: WIDGET_SIZES.MEDIUM, visible: true },
  { id: '9', type: WIDGET_TYPES.TRADE_CALENDAR, size: WIDGET_SIZES.LARGE, visible: true },
];

export function getWidgetSizeClass(size) {
  switch (size) {
    case WIDGET_SIZES.SMALL:
      return 'col-span-1';
    case WIDGET_SIZES.MEDIUM:
      return 'col-span-2';
    case WIDGET_SIZES.LARGE:
      return 'col-span-4';
    default:
      return 'col-span-2';
  }
}