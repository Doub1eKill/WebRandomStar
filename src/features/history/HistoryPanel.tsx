import React, { useState, useMemo } from 'react';
import { HistoryRecord } from '@/types/history.ts';
import { exportHistoryToCSV, exportHistoryToJSON, filterHistory } from './historyManager.ts';
import { Download, Search, Filter, Trash2, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryRecord[];
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClearHistory }) => {
  const [search, setSearch] = useState('');
  const [selectedRound, setSelectedRound] = useState('all');
  const [selectedResult, setSelectedResult] = useState('all');

  const roundsList = useMemo(() => {
    return Array.from(new Set(history.map(h => h.round)));
  }, [history]);

  const filtered = useMemo(() => {
    let list = filterHistory(history, { round: selectedRound, search });
    if (selectedResult !== 'all') {
      list = list.filter(h => h.result === selectedResult);
    }
    return list;
  }, [history, selectedRound, selectedResult, search]);

  const stats = useMemo(() => {
    const total = history.length;
    const completed = history.filter(h => h.result === 'completed').length;
    const timeouts = history.filter(h => h.isTimeout || h.result === 'timeout').length;
    const totalTimeUsed = history.reduce((acc, h) => acc + h.timerUsedMs, 0);
    const avgTimeSeconds = total > 0 ? Math.round(totalTimeUsed / total / 1000) : 0;
    return { total, completed, timeouts, avgTimeSeconds };
  }, [history]);

  const handleExportCSV = () => {
    const csv = exportHistoryToCSV(history);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `season_quiz_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonStr = exportHistoryToJSON(history);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `season_quiz_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm('คุณต้องการล้างประวัติการสุ่มและเวลาทั้งหมดในระบบหรือไม่?')) {
      onClearHistory();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>บันทึกทั้งหมด</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>{stats.total}</div>
        </div>
        <div style={{ background: 'rgba(34, 197, 94, 0.06)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: '#86efac' }}>ตอบสำเร็จ (Completed)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{stats.completed}</div>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.06)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>หมดเวลา (Timeouts)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{stats.timeouts}</div>
        </div>
        <div style={{ background: 'rgba(56, 189, 248, 0.06)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: '#7dd3fc' }}>เวลาเฉลี่ย (Avg Time)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>{stats.avgTimeSeconds}s</div>
        </div>
      </div>

      {/* 2. Controls & Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้เข้าแข่งขัน, คำถาม หรือ ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Filter Dropdowns */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
          <Filter size={14} color="#94a3b8" />
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 0.6rem', borderRadius: '6px' }}
          >
            <option value="all">ทุกรอบ</option>
            {roundsList.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
            style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 0.6rem', borderRadius: '6px' }}
          >
            <option value="all">ทุกผลลัพธ์</option>
            <option value="completed">ตอบสำเร็จ</option>
            <option value="timeout">หมดเวลา</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 0.8rem', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 0.8rem', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <FileText size={15} /> Export JSON
          </button>
          <button
            onClick={handleClear}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <Trash2 size={15} /> ล้างประวัติ
          </button>
        </div>
      </div>

      {/* 3. History Table */}
      <div style={{ overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.4)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)', color: '#94a3b8' }}>
              <th style={{ padding: '0.75rem 1rem', width: '110px' }}>เวลา</th>
              <th style={{ padding: '0.75rem 1rem', width: '140px' }}>ผู้เข้าแข่งขัน</th>
              <th style={{ padding: '0.75rem 1rem' }}>คำถาม</th>
              <th style={{ padding: '0.75rem 1rem', width: '90px' }}>หมวดหมู่</th>
              <th style={{ padding: '0.75rem 1rem', width: '100px', textAlign: 'center' }}>เวลาที่ใช้</th>
              <th style={{ padding: '0.75rem 1rem', width: '90px', textAlign: 'center' }}>ผลลัพธ์</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  ยังไม่มีประวัติการตอบคำถามในระบบ
                </td>
              </tr>
            ) : (
              filtered.map(item => {
                const timeFormatted = new Date(item.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const secondsUsed = Math.round(item.timerUsedMs / 1000);
                const secondsConfigured = Math.round(item.timerConfiguredMs / 1000);

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      {timeFormatted}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#f8fafc', fontWeight: 500 }}>
                      <div>{item.contestantName}</div>
                      {item.contestantNumber && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>#{item.contestantNumber}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>{item.questionId}</div>
                      <div style={{ fontSize: '0.85rem' }}>{item.questionText}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>
                      <span style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.75rem' }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontFamily: 'monospace', color: '#f8fafc' }}>
                      {secondsUsed}s / {secondsConfigured}s
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {item.isTimeout || item.result === 'timeout' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.75rem' }}>
                          <AlertTriangle size={12} /> หมดเวลา
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#86efac', fontSize: '0.75rem' }}>
                          <CheckCircle2 size={12} /> สำเร็จ
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
