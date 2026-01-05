import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

const PLATFORM_CONFIGS = {
  tradingview: {
    name: 'TradingView',
    columns: {
      symbol: ['Symbol', 'Ticker'],
      type: ['Type', 'Side', 'Direction'],
      entry_price: ['Entry Price', 'Open Price', 'Entry'],
      exit_price: ['Exit Price', 'Close Price', 'Exit'],
      quantity: ['Quantity', 'Qty', 'Size', 'Shares'],
      entry_date: ['Entry Date', 'Open Date', 'Entry Time', 'Date'],
      exit_date: ['Exit Date', 'Close Date', 'Exit Time'],
      pnl: ['P&L', 'Profit', 'PnL', 'Net P&L', 'Net Profit']
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
  const [platform, setPlatform] = useState('tradingview');
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
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
      source: platform === 'tradingview' ? 'csv_import' : 'csv_import'
    };
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
  };

  const handleImport = async () => {
    if (!parsedData?.trades?.length) return;

    setIsProcessing(true);
    
    try {
      const validTrades = parsedData.trades.filter(t => t.symbol && t.entry_price);
      
      await base44.entities.Trade.bulkCreate(validTrades);
      
      await base44.entities.ImportLog.create({
        source: platform === 'tradingview' ? 'tradingview_csv' : 'tradestation_csv',
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
        source: platform === 'tradingview' ? 'tradingview_csv' : 'tradestation_csv',
        status: 'failed',
        file_name: file.name,
        trades_imported: 0,
        trades_failed: parsedData.trades.length,
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
                  {importResult.failed > 0 && `, ${importResult.failed} skipped`}
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
          disabled={!parsedData?.trades?.length || isProcessing || importResult?.success}
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