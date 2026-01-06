/**
 * Calculate P&L for a trade
 * @param {Object} trade - Trade object with entry_price, exit_price, quantity, point_value, fees, trade_type
 * @returns {Object} { profit_loss, profit_loss_gross, profit_loss_percent } or null if incomplete
 */
export function calculateTradePnL(trade) {
  if (!trade || trade.status === 'open' || !trade.entry_price || !trade.exit_price || !trade.quantity) {
    return { profit_loss: null, profit_loss_gross: null, profit_loss_percent: null };
  }

  const entry = parseFloat(trade.entry_price);
  const exit = parseFloat(trade.exit_price);
  const qty = parseFloat(trade.quantity);
  const fees = parseFloat(trade.fees) || 0;
  const point_value = parseFloat(trade.point_value) || 1;

  // Calculate gross P&L (before fees)
  let profit_loss_gross;
  if (trade.trade_type === 'long') {
    profit_loss_gross = (exit - entry) * point_value * qty;
  } else {
    profit_loss_gross = (entry - exit) * point_value * qty;
  }

  // Net P&L (after fees)
  const profit_loss = profit_loss_gross - fees;

  // P&L percentage
  const profit_loss_percent = entry > 0 && qty > 0
    ? (profit_loss_gross / (entry * point_value * qty)) * 100
    : 0;

  return {
    profit_loss,
    profit_loss_gross,
    profit_loss_percent
  };
}

/**
 * Enrich a single trade with calculated P&L values
 */
export function enrichTradeWithPnL(trade) {
  if (!trade) return trade;
  const pnl = calculateTradePnL(trade);
  return { ...trade, ...pnl };
}

/**
 * Enrich an array of trades with calculated P&L values
 */
export function enrichTradesWithPnL(trades) {
  if (!Array.isArray(trades)) return [];
  return trades.map(enrichTradeWithPnL);
}