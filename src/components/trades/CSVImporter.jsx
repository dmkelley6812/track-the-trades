import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

// Default point values for common futures contracts
const FUTURES_POINT_VALUES = {
  'NQ': 20,      // E-mini Nasdaq
  'MNQ': 2,      // Micro E-mini Nasdaq
  'ES': 50,      // E-mini S&P 500
  'MES': 5,      // Micro E-mini S&P 500
  'YM': 5,       // E-mini Dow
  'MYM': 0.5,    // Micro E-mini Dow
  'RTY': 50,     // E-mini Russell 2000
  'M2K': 5,      // Micro E-mini Russell 2000
  'CL': 1000,    // Crude Oil
  'MCL': 100,    // Micro Crude Oil
  'GC': 100,     // Gold
  'MGC': 10,     // Micro Gold
  'SI': 5000,    // Silver
  'SIL': 1000    // Micro Silver
};

const PLATFORM_CONFIGS = {
  tradingview_orders: {
    name: 'TradingView Orders',
    description: 'Export from: Paper Trading → More → Export Data → Orders',
    type: 'orders',
    columns: {
      symbol: ['Symbol'],
      side: ['Side'],
      type: ['Type'],
      quantity: ['Qty'],
      fill_price: ['Fill Price'],
      status: ['Status'],
      commission: ['Commission'],
      placing_time: ['Placing Time'],
      closing_time: ['Closing Time']
    }
  },
  tradingview_balance: {
    name: 'TradingView Balance History',
    description: 'Export from: Paper Trading → More → Export Data → Balance History',
    type: 'balance',
    columns: {
      time: ['Time'],
      balance_before: ['Balance Before'],
      balance_after: ['Balance After'],
      realized_pnl_value: ['Realized P&L (value)'],
      realized_pnl_currency: ['Realized P&L (currency)'],
      action: ['Action']
    }
  },
  tradingview: {
    name: 'TradingView Orders (Legacy)',
    description: 'Export from: Paper Trading → More → Export Data → Orders',
    type: 'orders',
    columns: {
      symbol: ['Symbol'],
      side: ['Side'],
      type: ['Type'],
      quantity: ['Qty'],
      fill_price: ['Fill Price'],
      status: ['Status'],
      commission: ['Commission'],
      placing_time: ['Placing Time'],
      closing_time: ['Closing Time']
    }
  },
  tradestation: {
    name: 'TradeStation',
    columns: {
      symbol: ['Symbol'],
      type: ['Action', 'Type'],
      entry_price: ['Filled Price', 'Price'],
      exit_price: ['Exit Price'],
      quantity: ['Filled Qty', 'Quantity'],
      entry_date: ['Filled Date/Time', 'Date'],
      exit_date: ['Exit Date'],
      pnl: ['Realized P/L']
    }
  },
  generic: {
    name: 'Generic CSV',
    columns: {
      symbol: ['symbol', 'ticker', 'Symbol', 'Ticker'],
      type: ['type', 'side', 'direction', 'Type', 'Side'],
      entry_price: ['entry_price', 'entry', 'Entry Price'],
      exit_price: ['exit_price', 'exit', 'Exit Price'],
      quantity: ['quantity', 'qty', 'size', 'Quantity'],
      entry_date: ['entry_date', 'date', 'Entry Date', 'Date'],
      exit_date: ['exit_date', 'Exit Date'],
      pnl: ['pnl', 'profit', 'P&L', 'Profit']
    }
  }
};

export default function CSVImporter({ onImportComplete, onCancel }) {
  const [platform, setPlatform] = useState('tradingview_orders');
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [instrumentMetadata, setInstrumentMetadata] = useState({});
  const fileInputRef = useRef(null);

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return { headers: [], rows: [] };
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      return headers.reduce((obj, header, idx) => {
        obj[header] = values[idx] || '';
        return obj;
      }, {});
    });
    
    return { headers, rows };
  };

  const findColumn = (headers, possibleNames) => {
    for (const name of possibleNames) {
      const found = headers.find(h => h.toLowerCase() === name.toLowerCase());
      if (found) return found;
    }
    return null;
  };

  const mapRowToTrade = (row, headers, config) => {
    const getValue = (field) => {
      const colName = findColumn(headers, config.columns[field] || []);
      return colName ? row[colName] : null;
    };

    // For TradingView Orders format - this is a single order row
    if (platform === 'tradingview') {
      return {
        symbol: getValue('symbol')?.replace(/.*:/, '').replace(/[0-9!]/g, '') || 'UNKNOWN',
        side: getValue('side'),
        quantity: parseFloat(getValue('quantity')) || 0,
        fill_price: parseFloat(getValue('fill_price')) || 0,
        commission: parseFloat(getValue('commission')) || 0,
        time: getValue('closing_time') || getValue('placing_time'),
        status: getValue('status')
      };
    }

    // For other platforms (legacy format)
    const rawType = getValue('type')?.toLowerCase() || '';
    const trade_type = rawType.includes('short') || rawType.includes('sell') ? 'short' : 'long';

    const entry_price = parseFloat(getValue('entry_price')) || 0;
    const exit_price = parseFloat(getValue('exit_price')) || null;
    const quantity = parseFloat(getValue('quantity')) || 0;
    
    let profit_loss = parseFloat(getValue('pnl')) || null;
    if (profit_loss === null && exit_price && entry_price && quantity) {
      if (trade_type === 'long') {
        profit_loss = (exit_price - entry_price) * quantity;
      } else {
        profit_loss = (entry_price - exit_price) * quantity;
      }
    }

    const profit_loss_percent = entry_price && quantity && profit_loss !== null
      ? (profit_loss / (entry_price * quantity)) * 100
      : null;

    return {
      symbol: getValue('symbol')?.toUpperCase() || 'UNKNOWN',
      trade_type,
      entry_price,
      exit_price,
      quantity,
      entry_date: getValue('entry_date') || new Date().toISOString(),
      exit_date: getValue('exit_date') || null,
      status: exit_price ? 'closed' : 'open',
      profit_loss,
      profit_loss_percent,
      source: 'csv_import'
    };
  };

  const getPointValue = (symbol) => {
    // Check if we have metadata for this symbol
    if (instrumentMetadata[symbol]?.point_value) {
      return instrumentMetadata[symbol].point_value;
    }
    
    // Extract base symbol (remove exchange prefix and contract month)
    const baseSymbol = symbol.replace(/.*:/, '').replace(/[0-9!]/g, '');
    
    // Check fallback map
    return FUTURES_POINT_VALUES[baseSymbol] || 1;
  };

  const extractInstrumentMetadata = (rows, headers, config) => {
    const metadata = {};
    
    rows.forEach(row => {
      const action = row[findColumn(headers, config.columns.action)] || '';
      
      // Parse action string for "Close ... position" entries
      // Example: "Close CME_MINI:NQ1! position point value: 20.000000"
      const closeMatch = action.match(/Close\s+([\w:!]+)\s+position.*point value:\s*([\d.]+)/i);
      
      if (closeMatch) {
        const symbol = closeMatch[1];
        const pointValue = parseFloat(closeMatch[2]);
        
        if (symbol && !isNaN(pointValue)) {
          metadata[symbol] = {
            symbol,
            point_value: pointValue,
            currency: 'USD'
          };
        }
      }
    });
    
    return metadata;
  };

  const pairTradingViewOrders = (orders, metadata = {}) => {
    // Filter only filled orders
    const filledOrders = orders.filter(o => o.status === 'Filled');
    
    // Group by symbol
    const bySymbol = filledOrders.reduce((acc, order) => {
      if (!acc[order.symbol]) acc[order.symbol] = [];
      acc[order.symbol].push(order);
      return acc;
    }, {});
    
    const trades = [];
    
    // For each symbol, pair buy/sell orders using position state machine
    Object.entries(bySymbol).forEach(([symbol, orders]) => {
      // Sort by time
      const sorted = orders.sort((a, b) => new Date(a.time) - new Date(b.time));
      
      // Get point value for this symbol
      const pointValue = getPointValue(symbol);
      const isFutures = pointValue !== 1;
      
      let position = null;
      
      sorted.forEach(order => {
        if (!position) {
          // Opening position
          if (order.side === 'Buy' || order.side === 'Sell') {
            position = {
              symbol: order.symbol,
              trade_type: order.side === 'Buy' ? 'long' : 'short',
              entry_price: order.fill_price,
              quantity: order.quantity,
              entry_date: new Date(order.time).toISOString(),
              fees: order.commission,
              source: 'csv_import',
              point_value: isFutures ? pointValue : null,
              instrument_type: isFutures ? 'futures' : 'stock'
            };
          }
        } else {
          // Check if this closes the position
          const isClosing = (position.trade_type === 'long' && order.side === 'Sell') ||
                            (position.trade_type === 'short' && order.side === 'Buy');
          
          if (isClosing) {
            const closeSize = Math.min(position.quantity, order.quantity);
            
            // Calculate P&L with point value
            let realizedPoints;
            if (position.trade_type === 'long') {
              realizedPoints = order.fill_price - position.entry_price;
            } else {
              realizedPoints = position.entry_price - order.fill_price;
            }
            
            // Gross P&L = points * point_value * quantity
            const grossPnL = realizedPoints * pointValue * closeSize;
            const totalCommission = position.fees + order.commission;
            const netPnL = grossPnL - totalCommission;
            
            if (closeSize === position.quantity) {
              // Full close
              position.exit_price = order.fill_price;
              position.exit_date = new Date(order.time).toISOString();
              position.fees = totalCommission;
              position.status = 'closed';
              position.profit_loss_gross = grossPnL;
              position.profit_loss = netPnL;
              position.profit_loss_percent = position.entry_price > 0 
                ? (grossPnL / (position.entry_price * pointValue * position.quantity)) * 100 
                : 0;
              
              trades.push(position);
              position = null;
              
              // If partial fill, create new position with remaining
              if (order.quantity > closeSize) {
                position = {
                  symbol: order.symbol,
                  trade_type: order.side === 'Buy' ? 'long' : 'short',
                  entry_price: order.fill_price,
                  quantity: order.quantity - closeSize,
                  entry_date: new Date(order.time).toISOString(),
                  fees: 0, // Commission already allocated
                  source: 'csv_import',
                  point_value: isFutures ? pointValue : null,
                  instrument_type: isFutures ? 'futures' : 'stock'
                };
              }
            } else {
              // Partial close - split the trade
              const closedTrade = {
                symbol: position.symbol,
                trade_type: position.trade_type,
                entry_price: position.entry_price,
                exit_price: order.fill_price,
                quantity: closeSize,
                entry_date: position.entry_date,
                exit_date: new Date(order.time).toISOString(),
                fees: totalCommission,
                status: 'closed',
                profit_loss_gross: grossPnL,
                profit_loss: netPnL,
                profit_loss_percent: position.entry_price > 0 
                  ? (grossPnL / (position.entry_price * pointValue * closeSize)) * 100 
                  : 0,
                source: 'csv_import',
                point_value: isFutures ? pointValue : null,
                instrument_type: isFutures ? 'futures' : 'stock'
              };
              
              trades.push(closedTrade);
              
              // Keep remaining position open
              position.quantity -= closeSize;
              position.fees = 0; // Commission already allocated to closed trade
            }
          } else {
            // Same side order - could be scaling in, but for now treat as separate
            // In real implementation, could average the entry price
          }
        }
      });
      
      // If position still open, add it as open trade
      if (position) {
        position.status = 'open';
        trades.push(position);
      }
    });
    
    return trades;
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setImportResult(null);

    const text = await selectedFile.text();
    const { headers, rows } = parseCSV(text);
    const config = PLATFORM_CONFIGS[platform];
    
    const parseErrors = [];
    const config = PLATFORM_CONFIGS[platform];
    
    // Check if this is a balance history CSV
    if (config?.type === 'balance') {
      // Extract instrument metadata from balance history
      const metadata = extractInstrumentMetadata(rows, headers, config);
      setInstrumentMetadata(metadata);
      
      // Save metadata to database
      if (Object.keys(metadata).length > 0) {
        // We'll save this after processing
        setParsedData({ 
          headers, 
          trades: [], 
          metadata,
          totalRows: rows.length,
          type: 'balance'
        });
      } else {
        parseErrors.push({ row: 0, error: 'No instrument metadata found in balance history' });
        setParsedData({ headers, trades: [], totalRows: rows.length });
      }
      setErrors(parseErrors);
      return;
    }
    
    if (platform === 'tradingview' || platform === 'tradingview_orders') {
      // Parse as orders first
      const orders = rows.map((row, idx) => {
        try {
          return mapRowToTrade(row, headers, config);
        } catch (err) {
          parseErrors.push({ row: idx + 2, error: err.message });
          return null;
        }
      }).filter(Boolean);
      
      // Pair orders into trades with metadata
      const trades = pairTradingViewOrders(orders, instrumentMetadata);
      
      if (trades.length === 0) {
        parseErrors.push({ row: 0, error: 'No completed trades found. Make sure you have paired Buy/Sell orders.' });
      }
      
      setErrors(parseErrors);
      setParsedData({ headers, trades, totalRows: rows.length, type: 'orders' });
    } else {
      // Legacy format parsing
      const trades = rows.map((row, idx) => {
        try {
          const trade = mapRowToTrade(row, headers, config);
          if (!trade.symbol || trade.symbol === 'UNKNOWN') {
            parseErrors.push({ row: idx + 2, error: 'Missing symbol' });
          }
          if (!trade.entry_price) {
            parseErrors.push({ row: idx + 2, error: 'Missing entry price' });
          }
          return trade;
        } catch (err) {
          parseErrors.push({ row: idx + 2, error: err.message });
          return null;
        }
      }).filter(Boolean);

      setErrors(parseErrors);
      setParsedData({ headers, trades, totalRows: rows.length });
    }
  };

  const handleImport = async () => {
    if (!parsedData) return;

    setIsProcessing(true);
    
    try {
      // If balance history, save metadata
      if (parsedData.type === 'balance' && parsedData.metadata) {
        const metadataEntries = Object.values(parsedData.metadata);
        
        for (const meta of metadataEntries) {
          // Check if exists, update or create
          const existing = await base44.entities.InstrumentMetadata.filter({ symbol: meta.symbol });
          if (existing.length > 0) {
            await base44.entities.InstrumentMetadata.update(existing[0].id, meta);
          } else {
            await base44.entities.InstrumentMetadata.create(meta);
          }
        }
        
        await base44.entities.ImportLog.create({
          source: 'tradingview_balance',
          status: 'success',
          file_name: file.name,
          trades_imported: 0,
          trades_failed: 0
        });

        setImportResult({
          success: true,
          imported: 0,
          metadata: metadataEntries.length,
          message: `Imported metadata for ${metadataEntries.length} instrument(s)`
        });

        setTimeout(() => {
          onImportComplete?.();
        }, 2000);
        
        setIsProcessing(false);
        return;
      }
      
      // Import trades
      if (!parsedData.trades?.length) {
        throw new Error('No trades to import');
      }
      
      const validTrades = parsedData.trades.filter(t => t.symbol && t.entry_price);
      
      await base44.entities.Trade.bulkCreate(validTrades);
      
      await base44.entities.ImportLog.create({
        source: platform.includes('tradingview') ? 'tradingview_csv' : 'tradestation_csv',
        status: errors.length > 0 ? 'partial' : 'success',
        file_name: file.name,
        trades_imported: validTrades.length,
        trades_failed: errors.length,
        errors_list: errors.slice(0, 10)
      });

      setImportResult({
        success: true,
        imported: validTrades.length,
        failed: errors.length
      });

      setTimeout(() => {
        onImportComplete?.();
      }, 2000);

    } catch (err) {
      setImportResult({
        success: false,
        error: err.message
      });
      
      await base44.entities.ImportLog.create({
        source: platform.includes('tradingview') ? 'tradingview_csv' : 'tradestation_csv',
        status: 'failed',
        file_name: file.name,
        trades_imported: 0,
        trades_failed: parsedData.trades?.length || 0,
        error_details: err.message
      });
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-white">Import Trades</h2>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div>
        <label className="text-sm text-slate-300 mb-2 block">Platform</label>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {Object.entries(PLATFORM_CONFIGS).map(([key, config]) => (
              <SelectItem key={key} value={key} className="text-white">
                {config.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {PLATFORM_CONFIGS[platform].description && (
          <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
            <span className="text-emerald-400 font-medium">ℹ</span>
            {PLATFORM_CONFIGS[platform].description}
          </p>
        )}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          file 
            ? "border-emerald-500/50 bg-emerald-500/5" 
            : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/30"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-emerald-400" />
            <div className="text-left">
              <p className="font-medium text-white">{file.name}</p>
              <p className="text-sm text-slate-400">
                {parsedData ? `${parsedData.trades.length} trades found` : 'Processing...'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto text-slate-500 mb-3" />
            <p className="text-white font-medium">Click to upload CSV file</p>
            <p className="text-sm text-slate-500 mt-1">or drag and drop</p>
          </>
        )}
      </div>

      {errors.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="font-medium text-amber-400">{errors.length} rows with issues</span>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {errors.slice(0, 5).map((err, idx) => (
              <p key={idx} className="text-sm text-amber-300/70">
                Row {err.row}: {err.error}
              </p>
            ))}
            {errors.length > 5 && (
              <p className="text-sm text-amber-300/70">...and {errors.length - 5} more</p>
            )}
          </div>
        </div>
      )}

      {importResult && (
        <div className={cn(
          "rounded-xl p-4 flex items-center gap-3",
          importResult.success 
            ? "bg-emerald-500/10 border border-emerald-500/30" 
            : "bg-red-500/10 border border-red-500/30"
        )}>
          {importResult.success ? (
            <>
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="font-medium text-emerald-400">Import Complete!</p>
                <p className="text-sm text-emerald-300/70">
                  {importResult.message || (
                    <>
                      {importResult.imported} trades imported
                      {importResult.failed > 0 && `, ${importResult.failed} skipped`}
                      {importResult.metadata > 0 && ` • ${importResult.metadata} instrument metadata saved`}
                    </>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <p className="font-medium text-red-400">Import Failed</p>
                <p className="text-sm text-red-300/70">{importResult.error}</p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-slate-800">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          disabled={!parsedData || isProcessing || importResult?.success}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Importing...
            </>
          ) : parsedData?.type === 'balance' ? (
            `Import Metadata`
          ) : (
            `Import ${parsedData?.trades?.length || 0} Trades`
          )}
        </Button>
      </div>
    </div>
  );
}