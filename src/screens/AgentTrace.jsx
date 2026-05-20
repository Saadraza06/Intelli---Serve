import React from 'react';
import { ActivitySquare, Zap, Clock, Box } from 'lucide-react';
import { useIntent } from '../context/IntentContext';

const LEVEL_STYLES = {
  DECISION: { bg: 'rgba(22,163,74,0.10)',   border: 'rgba(22,163,74,0.30)',   color: '#16a34a' },
  WARNING:  { bg: 'rgba(217,119,6,0.10)',   border: 'rgba(217,119,6,0.30)',   color: '#d97706' },
  ERROR:    { bg: 'rgba(220,38,38,0.10)',   border: 'rgba(220,38,38,0.30)',   color: '#dc2626' },
  INFO:     { bg: 'rgba(255,85,0,0.08)',    border: 'rgba(255,85,0,0.25)',    color: '#cc5500' },
};

const BAR_COLORS = ['#ff5500', '#ff8533', '#d97706', '#16a34a', '#cc5500'];

export default function AgentTrace() {
  const { logs } = useIntent();
  const totalTime = logs.reduce((sum, log) => sum + (log.executionTime || 0), 0);

  return (
    <div className="flex flex-col h-full relative pb-20" style={{ background: 'transparent', fontFamily: 'inherit' }}>
      {/* Header */}
      <div className="p-4 shrink-0 flex items-center justify-between" style={{ borderBottom: '1.5px solid #ffe5cc' }}>
        <div className="flex items-center">
          <ActivitySquare size={20} className="mr-2" style={{ color: '#ff5500' }} />
          <h2 className="text-xl" style={{ fontWeight: 800, color: '#1a0f00' }}>Agent Trace</h2>
        </div>
        {logs.length > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full flex items-center space-x-1"
            style={{ background: 'rgba(255,85,0,0.10)', border: '1.5px solid #ffd5b0', color: '#cc5500', fontWeight: 700 }}>
            <Clock size={11} />
            <span>{totalTime}ms total</span>
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,85,0,0.08)', border: '1.5px solid #ffd5b0' }}>
              <Box size={28} style={{ color: '#ffb380' }} />
            </div>
            <p style={{ fontWeight: 700, color: '#1a0f00' }}>No agent logs yet</p>
            <p className="text-xs mt-1" style={{ color: '#c09070' }}>Run a flow from Home to see the trace.</p>
          </div>
        ) : (
          <>
            {/* Pipeline timing bar */}
            <div className="warm-card p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm" style={{ fontWeight: 700, color: '#1a0f00' }}>Pipeline Summary</span>
                <span className="text-xs" style={{ color: '#ff5500', fontWeight: 700 }}>{totalTime}ms</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden" style={{ background: '#ffeedd' }}>
                {logs.map((log, i) => {
                  const pct = totalTime > 0 ? (log.executionTime / totalTime) * 100 : 0;
                  return (
                    <div key={i} style={{ width: `${pct}%`, background: BAR_COLORS[i % BAR_COLORS.length], borderRight: '2px solid #fdf6ee' }}
                      title={`${log.agent}: ${log.executionTime}ms`} />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {logs.map((log, i) => (
                  <div key={i} className="flex items-center space-x-1.5 text-[10px]" style={{ color: '#7a4020', fontWeight: 600 }}>
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: BAR_COLORS[i % BAR_COLORS.length] }} />
                    <span>{log.agent} ({log.executionTime}ms)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Log cards */}
            <div className="space-y-4">
              {logs.map((log, i) => {
                const lvl = LEVEL_STYLES[log.level] || LEVEL_STYLES.INFO;
                return (
                  <div key={i} className="warm-card overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                    {/* Card header */}
                    <div className="px-4 py-3 flex justify-between items-center"
                      style={{ borderBottom: '1.5px solid #ffe5cc', background: 'rgba(255,245,238,0.60)' }}>
                      <span className="flex items-center text-sm" style={{ fontWeight: 700, color: '#1a0f00' }}>
                        <Zap size={14} className="mr-2 animate-bolt-pulse" style={{ color: '#ff5500' }} />
                        {log.agent}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,85,0,0.08)', color: '#cc5500', fontWeight: 700 }}>
                        {log.executionTime}ms
                      </span>
                    </div>

                    {/* Card body */}
                    <div className="p-4 space-y-3">
                      {/* Inputs */}
                      <div>
                        <span className="text-[10px] uppercase tracking-widest block mb-1" style={{ color: '#c09070', fontWeight: 700 }}>Inputs</span>
                        <div className="p-2.5 rounded-xl text-xs font-mono break-words" style={{ background: 'rgba(255,245,238,0.80)', border: '1px solid #ffe5cc', color: '#7a4020' }}>
                          {JSON.stringify(log.inputs)}
                        </div>
                      </div>

                      {/* Prompt snippet */}
                      <div>
                        <span className="text-[10px] uppercase tracking-widest block mb-1" style={{ color: '#c09070', fontWeight: 700 }}>System Prompt Snippet</span>
                        <div className="p-2.5 rounded-xl text-xs font-mono" style={{ background: 'rgba(255,85,0,0.05)', border: '1px solid #ffd5b0', color: '#cc5500' }}>
                          {log.prompt_snippet}
                        </div>
                      </div>

                      {/* JSON output */}
                      <div>
                        <span className="text-[10px] uppercase tracking-widest block mb-1" style={{ color: '#c09070', fontWeight: 700 }}>Gemini Output (JSON)</span>
                        <div className="p-2.5 rounded-xl text-xs font-mono overflow-x-auto" style={{ background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.25)', color: '#15803d' }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(log.response, null, 2)}</pre>
                        </div>
                      </div>

                      {/* Decision badge */}
                      <div className="p-2.5 rounded-xl text-xs" style={{ background: lvl.bg, border: `1px solid ${lvl.border}`, color: lvl.color }}>
                        <span style={{ fontWeight: 700 }}>[{log.level}]</span> {log.decision}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
