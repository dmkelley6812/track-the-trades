import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2, Edit2, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { enrichTradesWithPnL } from '@/components/common/tradeCalculations';

const PLATFORM_CONFIGS = {
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
  }
};

export default function CSVImporter({ onImportComplete, onCancel }) {
  const [platform, setPlatform] = useState('tradingview_balance');
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importedTrades, setImportedTrades] = useState(null);
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

  const parseBalanceHistory = (rows, headers, config) => {
    const trades = [];
    const tradeMap = new Map(); // Track trades by symbol for matching commissions
    
    rows.forEach((row, idx) => {
      const action = row[findColumn(headers, config.columns.action)] || '';
      const time = row[findColumn(headers, config.columns.time)] || '';
      const realizedPnL = parseFloat(row[findColumn(headers, config.columns.realized_pnl_value)]) || 0;
      
      // Check if this is a commission entry
      if (action.includes('Commission for:')) {
        // Skip commission rows - we'll extract commission from the main trade action
        return;
      }
      
      // Parse close position entries
      // Format: "Close long/short position for symbol CME_MINI:NQ1! at price 25643.25 for 50 units. Position AVG Price was 25640.000000, currency: USD, rate: 1.000000, point value: 20.000000"
      const closeMatch = action.match(/Close\s+(long|short)\s+position for symbol\s+([\w:!]+)\s+at price\s+([\d.]+)\s+for\s+([\d.]+)\s+units.*Position AVG Price was\s+([\d.]+).*point value:\s*([\d.]+)/i);
      
      if (closeMatch) {
        const [, direction, symbol, exitPriceStr, quantityStr, entryPriceStr, pointValueStr] = closeMatch;
        
        const trade_type = direction.toLowerCase();
        const entry_price = parseFloat(entryPriceStr);
        const exit_price = parseFloat(exitPriceStr);
        const quantity = parseFloat(quantityStr);
        const point_value = parseFloat(pointValueStr);
        
        // Find commission entries (look for commission rows near this trade)
        let totalCommission = 0;
        
        // Look at the row right before (entry commission) and right after (exit commission)
        if (idx > 0) {
          const prevAction = rows[idx - 1][findColumn(headers, config.columns.action)] || '';
          if (prevAction.includes('Commission for: Close')) {
            totalCommission += Math.abs(parseFloat(rows[idx - 1][findColumn(headers, config.columns.realized_pnl_value)]) || 0);
          }
        }
        
        // Look ahead for entry commission
        for (let i = idx + 1; i < Math.min(idx + 3, rows.length); i++) {
          const nextAction = rows[i][findColumn(headers, config.columns.action)] || '';
          if (nextAction.includes('Commission for: Enter position') && nextAction.includes(symbol)) {
            totalCommission += Math.abs(parseFloat(rows[i][findColumn(headers, config.columns.realized_pnl_value)]) || 0);
            break;
          }
        }
        
        // Store raw trade data - P&L will be calculated dynamically on display
        trades.push({
          symbol,
          trade_type,
          entry_price,
          exit_price,
          quantity,
          entry_date: new Date(time).toISOString(),
          exit_date: new Date(time).toISOString(),
          status: 'closed',
          fees: totalCommission,
          point_value,
          instrument_type: point_value !== 1 ? 'futures' : 'stock',
          source: 'csv_import'
        });
      }
      
      // Parse enter position entries (for open positions)
      const enterMatch = action.match(/Enter position for symbol\s+([\w:!]+)\s+at price\s+([\d.]+)\s+for\s+([\d.]+)\s+units/i);
      if (enterMatch) {
        // This is just an entry, we'll only track it if there's no corresponding close
        // For now, skip open positions unless explicitly needed
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
    
    try {
      // Parse balance history format
      const trades = parseBalanceHistory(rows, headers, config);
      
      if (trades.length === 0) {
        parseErrors.push({ row: 0, error: 'No completed trades found in balance history. Make sure you exported the Balance History CSV from TradingView.' });
      }
      
      setErrors(parseErrors);
      setParsedData({ headers, trades, totalRows: rows.length, type: 'balance' });
    } catch (err) {
      parseErrors.push({ row: 0, error: err.message });
      setErrors(parseErrors);
      setParsedData({ headers, trades: [], totalRows: rows.length, type: 'balance' });
    }
  };

  const handleImport = async () => {
    if (!parsedData?.trades?.length) return;

    setIsProcessing(true);
    
    try {
      const validTrades = parsedData.trades.filter(t => t.symbol && t.entry_price);
      
      // Fetch existing trades to check for duplicates
      const existingTrades = await base44.entities.Trade.list();
      
      // Filter out duplicates (matching entry_date, exit_date, entry_price, exit_price)
      const { newTrades, duplicates } = validTrades.reduce((acc, trade) => {
        const isDuplicate = existingTrades.some(existing => 
          existing.entry_date === trade.entry_date &&
          existing.exit_date === trade.exit_date &&
          existing.entry_price === trade.entry_price &&
          existing.exit_price === trade.exit_price &&
          existing.symbol === trade.symbol
        );
        
        if (isDuplicate) {
          acc.duplicates.push(trade);
        } else {
          acc.newTrades.push(trade);
        }
        
        return acc;
      }, { newTrades: [], duplicates: [] });
      
      // Only import non-duplicate trades and get their IDs
      let createdTrades = [];
      if (newTrades.length > 0) {
        const createResults = await Promise.all(
          newTrades.map(trade => base44.entities.Trade.create(trade))
        );
        createdTrades = createResults;
      }
      
      await base44.entities.ImportLog.create({
        source: 'tradingview_csv',
        status: errors.length > 0 || duplicates.length > 0 ? 'partial' : 'success',
        file_name: file.name,
        trades_imported: newTrades.length,
        trades_failed: errors.length + duplicates.length,
        errors_list: errors.slice(0, 10)
      });

      setImportResult({
        success: true,
        imported: newTrades.length,
        failed: errors.length,
        duplicates: duplicates.length
      });

      // Show imported trades for review/editing
      setImportedTrades(createdTrades);

    } catch (err) {
      setImportResult({
        success: false,
        error: err.message
      });
      
      await base44.entities.ImportLog.create({
        source: 'tradingview_csv',
        status: 'failed',
        file_name: file.name,
        trades_imported: 0,
        trades_failed: parsedData.trades?.length || 0,
        error_details: err.message
      });
    }
    
    setIsProcessing(false);
  };

  // If trades have been imported, show review screen
  if (importedTrades) {
    const enrichedTrades = enrichTradesWithPnL(importedTrades);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Imported Trades Review</h2>
            <p className="text-sm text-slate-400 mt-1">
              {enrichedTrades.length} trades imported successfully. Click any trade to add details.
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          <div>
            <p className="font-medium text-emerald-400">Import Complete!</p>
            <p className="text-sm text-emerald-300/70">
              Review your trades below and click on any to add more details
            </p>
          </div>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {enrichedTrades.map((trade) => (
            <button
              key={trade.id}
              onClick={() => {
                onImportComplete?.(trade);
              }}
              className="w-full flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  trade.trade_type === 'long' ? "bg-emerald-500/20" : "bg-red-500/20"
                )}>
                  {trade.trade_type === 'long' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{trade.symbol}</span>
                    <Badge variant="outline" className={cn(
                      "text-xs capitalize",
                      trade.trade_type === 'long' ? "border-emerald-500/50 text-emerald-400" : "border-red-500/50 text-red-400"
                    )}>
                      {trade.trade_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {format(new Date(trade.entry_date), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={cn(
                    "font-bold text-lg",
                    trade.profit_loss >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss?.toFixed(2)}
                  </p>
                  {trade.profit_loss_percent !== undefined && (
                    <p className={cn(
                      "text-xs",
                      trade.profit_loss >= 0 ? "text-emerald-400/70" : "text-red-400/70"
                    )}>
                      {trade.profit_loss_percent >= 0 ? '+' : ''}{trade.profit_loss_percent?.toFixed(2)}%
                    </p>
                  )}
                </div>
                <Edit2 className="w-5 h-5 text-slate-500" />
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-800">
          <Button
            onClick={() => {
              onImportComplete?.();
            }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-white">Import Trades</h2>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
        <h3 className="text-sm font-medium text-white mb-2">📋 How to Export from TradingView</h3>
        <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
          <li>Go to Paper Trading in TradingView</li>
          <li>Click "More" (three dots menu)</li>
          <li>Select "Export Data"</li>
          <li>Choose <span className="text-emerald-400 font-medium">"Balance History"</span></li>
          <li>Download the CSV file</li>
          <li>Upload it below</li>
        </ol>
        <p className="text-xs text-amber-400 mt-3 flex items-start gap-1">
          <span>⚠️</span>
          <span>Must use Balance History export (not Orders) for accurate P&L calculations</span>
        </p>
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
                  {importResult.imported} trades imported
                  {importResult.duplicates > 0 && `, ${importResult.duplicates} duplicates skipped`}
                  {importResult.failed > 0 && `, ${importResult.failed} errors`}
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
          ) : (
            `Import ${parsedData?.trades?.length || 0} Trades`
          )}
        </Button>
      </div>
    </div>
  );
}