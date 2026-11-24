import React from 'react';

import type { AppearanceSettingsModel } from '../useAppearanceSettingsModel.tsx';

export const SpinAudioSection: React.FC<{ m: AppearanceSettingsModel }> = ({ m }) => {
  const { tracks, musicState, onAssignPhaseTrack, onDeleteTrack, onPlayTrack, onStopMusic, spinFileInputRef, selectedSpinTrack, isPlayingSelected, handleSpinFileUpload } = m;
  return (
    <>
      {/* 3.1 Word Spin Audio Track Management Section */}
      <div className="control-section-group">
        <h3 className="group-title">
          <span className="group-icon">🎵</span>
          <span>เพลง/เสียงประกอบช่วงสุ่มคำ (Word Spin Audio Track)</span>
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 12px 0' }}>
          เลือกเพลงหรือเสียงระทึกช่วงสุ่มคำ สามารถอัปโหลดไฟล์เสียงใหม่ (MP3/WAV) หรือทดลองฟังเสียงได้ทันที
        </p>

        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '14px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
                เสียงเพลงประจำช่วงสุ่ม (Spin Phase Audio)
              </label>
              <select
                value={musicState?.phaseTrackMapping.spin || ''}
                onChange={e => onAssignPhaseTrack && onAssignPhaseTrack('spin', e.target.value || null)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#0f172a',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value="">-- ไม่เปิดเพลง (ปิดเสียง) --</option>
                {tracks?.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title} {t.isPreset ? '(เพลงระบบ)' : '(อัปโหลดเอง)'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginTop: '16px' }}>
              {/* Preview Button */}
              {selectedSpinTrack && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                  onClick={() => {
                    if (isPlayingSelected) {
                      onStopMusic?.();
                    } else if (onPlayTrack && selectedSpinTrack) {
                      onPlayTrack(selectedSpinTrack);
                    }
                  }}
                >
                  {isPlayingSelected ? '⏸️ หยุดฟัง' : '▶️ ฟังตัวอย่าง'}
                </button>
              )}

              {/* Upload Button */}
              <input
                type="file"
                ref={spinFileInputRef}
                accept="audio/*"
                onChange={e => handleSpinFileUpload(e.target.files)}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn-primary"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  borderColor: '#f59e0b'
                }}
                onClick={() => spinFileInputRef.current?.click()}
              >
                + อัปโหลดเสียงสุ่ม (MP3/WAV)
              </button>

              {/* Delete Button (for custom uploaded track) */}
              {selectedSpinTrack && !selectedSpinTrack.isPreset && onDeleteTrack && (
                <button
                  type="button"
                  className="btn-secondary btn-danger-soft"
                  style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                  title="ลบเพลงที่อัปโหลดนี้ออกจากระบบ"
                  onClick={() => {
                    if (confirm(`ต้องการลบเพลง "${selectedSpinTrack.title}" ใช่หรือไม่?`)) {
                      onDeleteTrack(selectedSpinTrack.id);
                    }
                  }}
                >
                  🗑️ ลบเพลง
                </button>
              )}
            </div>
          </div>

          {selectedSpinTrack && (
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span>ความยาว: {Math.round(selectedSpinTrack.duration)}s</span>
              <span>•</span>
              <span>สถานะ: {selectedSpinTrack.isPreset ? '✨ เพลงระบบมาตรฐาน' : '📁 ไฟล์เสียงที่อัปโหลดเอง'}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
