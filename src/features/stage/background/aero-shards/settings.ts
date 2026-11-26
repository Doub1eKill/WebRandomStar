/** AeroShards: turn component props into the settings object the renderer reads (Phase 6, A2/A5). */
import { DETAIL_PRESETS, FLOWS, INTERACTIONS, MATERIALS, MATERIAL_PRESETS, PLACEMENTS } from './presets.ts';
import { clamp, mixColor } from './motion.ts';
import { parseColor } from './renderGraph.ts';
import type { AeroShardsProps } from './AeroShards.tsx';

/** Props after defaults have been applied (callbacks, className, the unused `effect` prop and the
 * stage-backdrop inputs, which the render loop reads from a ref, excluded). */
export type ResolvedAeroProps = Required<Omit<AeroShardsProps,
  'onError' | 'className' | 'effect' | 'stageState' | 'backdropGlow' | 'showLightRays' | 'showNebulaBand' | 'showHorizon'>>;

export function resolveAeroSettings({
  backgroundColor, shardColor, accentColor, placement, flow, material, detail, scale, spread, depth,
  speed, spin, interaction, density, shardSize, stretch, turbulence, glow, edgeSoftness, bloom, grain,
  chromaticAberration, transitionDuration, interactionRadius, interactionStrength, rippleIntensity,
  holdToGather, paused
}: ResolvedAeroProps) {
  const resolvedMaterial = MATERIAL_PRESETS[material] || MATERIAL_PRESETS.pearl;
  const resolvedDetail = DETAIL_PRESETS[detail] || DETAIL_PRESETS.balanced;
  const resolvedScale = clamp(scale, 0.5, 2.5);
  const resolvedBackground = parseColor(backgroundColor, '#060919');
  const resolvedShardColor = parseColor(shardColor, '#C084FC');
  const resolvedAccentColor = parseColor(accentColor, '#38BDF8');
  const resolvedSpread = clamp(spread, 0.15, 1.1);
  const resolvedDepth = clamp(depth, 0, 1.25);
  const resolvedSpeed = clamp(speed, 0, 2);
  const resolvedSpin = clamp(spin, 0, 2);
  const resolvedInteraction = INTERACTIONS[interaction] ?? INTERACTIONS.repel;
  const resolvedDensity = clamp(density, 0.5, 1.5);
  const resolvedShardSize = clamp(shardSize, 0.5, 1.5);
  const resolvedStretch = clamp(stretch, 0.6, 1.8);
  const resolvedTurbulence = clamp(turbulence, 0, 2);
  const resolvedGlow = clamp(glow, 0, 2);
  const resolvedEdgeSoftness = clamp(edgeSoftness, 0, 2);
  const resolvedBloom = clamp(bloom, 0, 3);
  const resolvedGrain = clamp(grain, 0, 0.12);
  const resolvedChromaticAberration = clamp(chromaticAberration, 0, 0.01);
  const resolvedTransitionDuration = clamp(transitionDuration, 0.2, 2);
  const resolvedInteractionRadius = clamp(interactionRadius, 0.5, 2);
  const resolvedInteractionStrength = clamp(interactionStrength, 0, 2);
  const backgroundLuma =
    resolvedBackground[0] * 0.2126 + resolvedBackground[1] * 0.7152 + resolvedBackground[2] * 0.0722;
  const lightBackground = clamp((backgroundLuma - 0.58) / 0.24, 0, 1);
  const lightSurface = lightBackground * lightBackground * (3 - 2 * lightBackground);


  return {
      background: resolvedBackground,
      shard: resolvedShardColor,
      highlight: mixColor(resolvedAccentColor, [1, 1, 1, 1], resolvedMaterial.highlightMix),
      accent: resolvedAccentColor,
      composition: PLACEMENTS[placement] ?? PLACEMENTS.full,
      flow: FLOWS[flow] ?? FLOWS.stream,
      material: MATERIALS[material] ?? MATERIALS.pearl,
      detailCount: resolvedDetail.count * resolvedDensity,
      shardSize: resolvedDetail.size * resolvedShardSize,
      scale: resolvedScale,
      stretch: resolvedStretch * (1 + Math.min(resolvedSpeed * 0.34, 1.2) * 0.1),
      speed: resolvedSpeed,
      spin: resolvedSpin,
      turbulence: 0.36 * resolvedTurbulence,
      spread: resolvedSpread,
      depth: resolvedDepth,
      roughness: resolvedMaterial.roughness,
      brightness: resolvedMaterial.brightness,
      glow: resolvedMaterial.glow * resolvedGlow,
      edgeSoftness: resolvedEdgeSoftness,
      bloom: resolvedBloom,
      grain: resolvedGrain,
      chromaticAberration: resolvedChromaticAberration,
      exposure: 1.12 + (0.96 - 1.12) * lightSurface,
      lightSurface,
      transitionDuration: resolvedTransitionDuration,
      interaction: resolvedInteraction,
      interactionRadius: (interaction === 'attract' ? 0.27 : 0.18) * resolvedInteractionRadius,
      interactionStrength: resolvedInteractionStrength,
      rippleIntensity: clamp(rippleIntensity, 0, 2),
      holdToGather,
      paused,
      signature: [
        backgroundColor,
        shardColor,
        accentColor,
        placement,
        flow,
        material,
        detail,
        resolvedScale,
        resolvedSpread,
        resolvedDepth,
        resolvedSpeed,
        resolvedSpin,
        interaction,
        resolvedDensity,
        resolvedShardSize,
        resolvedStretch,
        resolvedTurbulence,
        resolvedGlow,
        resolvedEdgeSoftness,
        resolvedBloom,
        resolvedGrain,
        resolvedChromaticAberration,
        resolvedTransitionDuration,
        resolvedInteractionRadius,
        resolvedInteractionStrength,
        rippleIntensity,
        holdToGather,
        paused
      ].join('|')
  };
}

export type AeroSettings = ReturnType<typeof resolveAeroSettings>;
