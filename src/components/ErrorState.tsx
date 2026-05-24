import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="glass rounded-2xl p-10 border border-rose-500/20 flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-rose-400" />
      </div>
      <div>
        <h3 className="text-white font-medium mb-1">Failed to load dashboard</h3>
        <p className="text-sm text-slate-400 max-w-sm">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/15 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
