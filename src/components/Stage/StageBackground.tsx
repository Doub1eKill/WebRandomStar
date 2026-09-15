import React, { useState } from 'react';
import { SessionState } from '../../types/session.ts';
import { StageCanvas } from './StageCanvas.tsx';
import { AeroShards } from './Background/AeroShards.tsx';

interface StageBackgroundProps {
  session: SessionState;
  onLeafLanded?: () => void;
  onQuestionReady?: () => void;
}

export const StageBackground: React.FC<StageBackgroundProps> = ({
  session,
  onLeafLanded,
  onQuestionReady
}) => {
  const [webGpuFailed, setWebGpuFailed] = useState(false);
  const backgroundMode = session.appearanceSettings?.backgroundMode || 'cosmic-canvas';

  // If user selected aero-shards and WebGPU is available without error:
  if (backgroundMode === 'aero-shards' && !webGpuFailed) {
    return (
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
          interaction="repel"
          density={1.2}
          shardSize={1.1}
          stretch={1}
          turbulence={1}
          glow={1.2}
          edgeSoftness={2}
          bloom={0.6}
          grain={0.04}
          chromaticAberration={0.006}
          transitionDuration={1}
          interactionRadius={1.5}
          interactionStrength={0.5}
          rippleIntensity={1}
          holdToGather={true}
          onError={(err) => {
            console.warn('[StageBackground] AeroShards WebGPU error, falling back to Canvas 2D:', err);
            setWebGpuFailed(true);
          }}
        />
      </div>
    );
  }

  // Default: Cosmic Canvas 2D Stage with Starry Nebula & Aurora
  return (
    <StageCanvas
      session={session}
      onLeafLanded={onLeafLanded}
      onQuestionReady={onQuestionReady}
    />
  );
};
