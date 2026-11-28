import React, { lazy, Suspense, useState } from 'react';
import { SessionState } from '@/types/session.ts';
import { StageCanvas } from '@/features/stage/background/canvas/StageCanvas.tsx';
import { notifyOperator } from '@/shared/notices/operatorNotices.ts';

// PF3: AeroShards pulls in the WebGPU stack (vgpu, ~215 KB). Load it only when that
// background is selected; the Canvas 2D stage is shown while the chunk downloads.
const AeroShards = lazy(() => import('@/features/stage/background/aero-shards/AeroShards.tsx').then(m => ({ default: m.AeroShards })));

interface StageBackgroundProps {
  session: SessionState;
  /** false in OBS mode: the shards stop reacting to the mouse over the captured window. */
  interactive?: boolean;
}

export const StageBackground: React.FC<StageBackgroundProps> = ({ session, interactive = true }) => {
  const [webGpuFailed, setWebGpuFailed] = useState(false);
  const backgroundMode = session.appearanceSettings?.backgroundMode || 'cosmic-canvas';

  // A WebGPU failure only sticks while AeroShards stays selected: switching away and
  // back tries again instead of silently keeping the Canvas 2D fallback until a reload.
  const [lastMode, setLastMode] = useState(backgroundMode);
  if (lastMode !== backgroundMode) {
    setLastMode(backgroundMode);
    setWebGpuFailed(false);
  }

  const canvas = <StageCanvas session={session} />;

  // Appearance sliders also drive AeroShards: density scales the shard count, glow the shard
  // glow plus the backdrop (nebula, stars, beams). Defaults (1.0) give the original 1.2 / 1.2.
  const appearance = session.appearanceSettings;
  const densitySetting = appearance?.particleDensity || 1.0;
  const glowSetting = appearance?.glowIntensity || 1.0;

  // If user selected aero-shards and WebGPU is available without error:
  if (backgroundMode === 'aero-shards' && !webGpuFailed) {
    return (
      <Suspense fallback={canvas}>
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <AeroShards
            backgroundColor="#060919"
            shardColor="#C084FC"
            accentColor="#38BDF8"
            placement="full"
            flow="stream"
            material="pearl"
            detail="balanced"
            scale={1}
            spread={1}
            depth={1}
            speed={0.85}
            spin={1}
            interaction={interactive ? 'repel' : 'none'}
            density={Math.min(1.5, Math.max(0.5, 1.2 * densitySetting))}
            shardSize={1.1}
            stretch={1}
            turbulence={1}
            glow={Math.min(2, 1.2 * glowSetting)}
            edgeSoftness={2}
            bloom={0.6}
            grain={0.04}
            chromaticAberration={0.006}
            transitionDuration={1}
            interactionRadius={1.5}
            interactionStrength={0.5}
            rippleIntensity={1}
            holdToGather={true}
            stageState={session.currentState}
            backdropGlow={glowSetting}
            showLightRays={appearance?.showLightRays !== false}
            showNebulaBand={appearance?.showAurora !== false}
            showHorizon={appearance?.showWaterReflection !== false}
            onError={(err) => {
              console.warn('[StageBackground] AeroShards WebGPU error, falling back to Canvas 2D:', err);
              setWebGpuFailed(true);
              // Tell the operator: otherwise the stage just flips back to Cosmic Canvas
              // and the selection looks like it did nothing.
              notifyOperator(
                'error',
                `พื้นหลัง AeroShards ใช้งานไม่ได้บนจอเวทีนี้ (WebGPU: ${err.message}) จึงกลับไปใช้ Cosmic Canvas แทน`
              );
            }}
          />
        </div>
      </Suspense>
    );
  }

  // Default: Cosmic Canvas 2D Stage with Starry Nebula & Aurora
  return canvas;
};
