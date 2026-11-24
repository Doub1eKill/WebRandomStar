import React, { useEffect, useRef, useState } from 'react';
import { frame, init, surface } from 'vgpu';
import type { Frame, FramePass, Gpu } from 'vgpu';
import './AeroShards.css';
import { advanceFormation, advanceFrameDeadline, advanceHold, advancePointer, advanceRipples, createFormation, createHold, createRipples, mixColor, resetPointerMotion, resolveFrameInterval, resolvePathLength, startRipple } from './motion.ts';
import { FRAME_STATES, INTERACTIONS, QUALITY_PRESETS, RUNTIME_QUALITY } from './presets.ts';
import { resolveAeroSettings, AeroSettings } from './settings.ts';
import { createRenderGraph, prepareRenderGraph, resolveBloomSize, resolveDpr, resolveQuality } from './renderGraph.ts';

/** navigator.gpu is not in TypeScript's DOM lib yet; only the parts used here (A5). */
type WebGpuNavigator = Navigator & { gpu?: { getPreferredCanvasFormat(): string } };
type FrameState = (typeof FRAME_STATES)[keyof typeof FRAME_STATES];

export interface AeroShardsProps {
  backgroundColor?: string;
  shardColor?: string;
  accentColor?: string;
  placement?: 'right' | 'left' | 'center' | 'full';
  flow?: 'stream' | 'vortex' | 'ribbon';
  material?: 'pearl' | 'chrome' | 'satin';
  detail?: 'bold' | 'balanced' | 'fine';
  effect?: 'none' | 'dither' | 'ascii';
  scale?: number;
  spread?: number;
  depth?: number;
  speed?: number;
  spin?: number;
  interaction?: 'none' | 'repel' | 'attract';
  density?: number;
  shardSize?: number;
  stretch?: number;
  turbulence?: number;
  glow?: number;
  edgeSoftness?: number;
  bloom?: number;
  grain?: number;
  chromaticAberration?: number;
  transitionDuration?: number;
  interactionRadius?: number;
  interactionStrength?: number;
  rippleIntensity?: number;
  holdToGather?: boolean;
  paused?: boolean;
  className?: string;
  onError?: (error: Error) => void;
}


export const AeroShards: React.FC<AeroShardsProps> = ({
  backgroundColor = '#060919',
  shardColor = '#C084FC',
  accentColor = '#38BDF8',
  placement = 'full',
  flow = 'stream',
  material = 'pearl',
  detail = 'balanced',
  scale = 1,
  spread = 1,
  depth = 1,
  speed = 1,
  spin = 1,
  interaction = 'repel',
  density = 1.2,
  shardSize = 1.1,
  stretch = 1,
  turbulence = 1,
  glow = 1.2,
  edgeSoftness = 2,
  bloom = 0.6,
  grain = 0.04,
  chromaticAberration = 0.006,
  transitionDuration = 1,
  interactionRadius = 1.5,
  interactionStrength = 0.5,
  rippleIntensity = 1,
  holdToGather = true,
  paused = false,
  className = '',
  onError
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onErrorRef = useRef(onError);
  const settingsRef = useRef<AeroSettings>(null as unknown as AeroSettings);
  const wakeRef = useRef<() => void>(() => {});
  const pointerRef = useRef({
    raw: [0.5, 0.5],
    position: [0.5, 0.5],
    velocity: [0, 0],
    active: 0,
    presence: 0,
    presenceVelocity: 0,
    initialized: false
  });
  const ripplesRef = useRef(createRipples());
  const holdRef = useRef(createHold());
  const [ready, setReady] = useState(false);

  settingsRef.current = resolveAeroSettings({
    backgroundColor, shardColor, accentColor, placement, flow, material, detail, scale, spread, depth,
    speed, spin, interaction, density, shardSize, stretch, turbulence, glow, edgeSoftness, bloom, grain,
    chromaticAberration, transitionDuration, interactionRadius, interactionStrength, rippleIntensity,
    holdToGather, paused
  });
  const settingsSignature = settingsRef.current.signature;
  onErrorRef.current = onError;

  useEffect(() => {
    wakeRef.current();
  }, [settingsSignature]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    // Check WebGPU browser support
    if (typeof navigator === 'undefined' || !(navigator as WebGpuNavigator).gpu) {
      onErrorRef.current?.(new Error('WebGPU is not supported in this browser environment'));
      return;
    }

    resetPointerMotion(pointerRef.current);
    ripplesRef.current = createRipples();
    holdRef.current = createHold();

    let disposed = false;
    let runtimeFailed = false;
    let gpu: Gpu | undefined;
    let animationFrameId = 0;
    let timeoutId = 0;
    let unsubscribeResize: (() => void) | undefined;
    let unsubscribeGpuError: (() => void) | undefined;
    // Assigned later in this effect but read by cleanup closures declared above that point.
    // eslint-disable-next-line prefer-const
    let visibilityObserver: IntersectionObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let visible = true;
    let visibilityRatio = 1;
    let needsRender = true;
    let interactionDeadline = 0;
    let settlingDeadline = 0;
    let bounds = root.getBoundingClientRect();
    let boundsDirty = false;
    let resumePending = true;
    let wakeRenderer = () => {
      needsRender = true;
    };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const reportFailure = (error: unknown) => {
      if (disposed || runtimeFailed) return;
      runtimeFailed = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (timeoutId) window.clearTimeout(timeoutId);
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      unsubscribeResize?.();
      unsubscribeGpuError?.();
      const failedGpu = gpu;
      gpu = undefined;
      failedGpu?.dispose?.();
      const resolved = error instanceof Error ? error : new Error(String(error));
      onErrorRef.current?.(resolved);
    };

    const updateBounds = () => {
      bounds = root.getBoundingClientRect();
      boundsDirty = false;
    };

    const pointFromClient = (clientX: number, clientY: number) => {
      if (boundsDirty) updateBounds();
      if (bounds.width <= 0 || bounds.height <= 0) return null;
      const x = (clientX - bounds.left) / bounds.width;
      const y = (clientY - bounds.top) / bounds.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return null;
      return [x, y];
    };

    const updatePointerTarget = (next: number[]) => {
      const pointer = pointerRef.current;
      if (!pointer.initialized || (!pointer.active && pointer.presence === 0)) {
        pointer.raw = [...next];
        pointer.position = [...next];
        pointer.presence = 0;
        resetPointerMotion(pointer);
        pointer.initialized = true;
      } else {
        pointer.raw[0] = next[0];
        pointer.raw[1] = next[1];
      }
      pointer.active = 1;
    };

    const deactivatePointer = () => {
      pointerRef.current.active = 0;
      holdRef.current.pointerId = null;
      const now = performance.now();
      interactionDeadline = now + 140;
      settlingDeadline = now + 680;
      wakeRenderer();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const settings = settingsRef.current;
      if (!event.isPrimary || !visible || settings.interaction === INTERACTIONS.none) return;
      const next = pointFromClient(event.clientX, event.clientY);
      if (!next) {
        const pointer = pointerRef.current;
        if (pointer.active || pointer.presence > 0) deactivatePointer();
        return;
      }
      updatePointerTarget(next);
      const now = performance.now();
      interactionDeadline = now + 140;
      settlingDeadline = now + 680;
      wakeRenderer();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const settings = settingsRef.current;
      if (!event.isPrimary || event.button !== 0 || !visible || settings.interaction === INTERACTIONS.none) return;
      if (
        event.target instanceof Element &&
        event.target.closest('a, button, input, textarea, select, [role="button"], [contenteditable="true"]')
      )
        return;
      const next = pointFromClient(event.clientX, event.clientY);
      if (!next) return;
      if (!settings.paused && !reduceMotion.matches && settings.speed > 0.0001) {
        startRipple(ripplesRef.current, next, bounds.width / Math.max(bounds.height, 1));
        if (settings.holdToGather) {
          holdRef.current.pointerId = event.pointerId;
          holdRef.current.elapsed = 0;
        }
      }
      updatePointerTarget(next);
      const now = performance.now();
      interactionDeadline = now + 220;
      settlingDeadline = now + 800;
      wakeRenderer();
    };

    const handlePointerEnd = (event: PointerEvent) => {
      const hold = holdRef.current;
      if (hold.pointerId === event.pointerId) {
        hold.pointerId = null;
        const settings = settingsRef.current;
        if (
          hold.amount > 0.1 &&
          !settings.paused &&
          !reduceMotion.matches &&
          settings.interaction !== INTERACTIONS.none
        ) {
          startRipple(
            ripplesRef.current,
            pointerRef.current.raw,
            bounds.width / Math.max(bounds.height, 1),
            1 + hold.amount * 0.8
          );
        }
        wakeRenderer();
      }
      if (event.pointerType !== 'mouse') deactivatePointer();
    };

    const markBoundsDirty = () => {
      boundsDirty = true;
    };

    const handleVisibilityChange = () => {
      resumePending = true;
      holdRef.current.pointerId = null;
      resetPointerMotion(pointerRef.current);
      wakeRenderer();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerEnd, { passive: true });
    window.addEventListener('pointercancel', deactivatePointer, { passive: true });
    window.addEventListener('blur', deactivatePointer);
    window.addEventListener('scroll', markBoundsDirty, { passive: true, capture: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    reduceMotion.addEventListener('change', handleVisibilityChange);

    visibilityObserver = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        visibilityRatio = entry?.intersectionRatio ?? 1;
        visible = entry ? entry.isIntersecting && visibilityRatio >= 0.02 : true;
        if (visible) {
          resumePending = true;
        } else {
          interactionDeadline = 0;
          settlingDeadline = 0;
          const pointer = pointerRef.current;
          pointer.active = 0;
          pointer.presence = 0;
          holdRef.current.pointerId = null;
          resetPointerMotion(pointer);
        }
        wakeRenderer();
      },
      { threshold: [0, 0.02, 0.25] }
    );
    visibilityObserver.observe(root);

    void (async () => {
      try {
        setReady(false);
        const resolvedQuality = resolveQuality(canvas);
        const preset = QUALITY_PRESETS[resolvedQuality as keyof typeof QUALITY_PRESETS] || QUALITY_PRESETS.medium;
        gpu = await init({ powerPreference: 'low-power' });
        if (disposed) return gpu.dispose();
        unsubscribeGpuError = gpu.onError(reportFailure);

        const outputFormat = (navigator as WebGpuNavigator).gpu!.getPreferredCanvasFormat();
        const output = surface(gpu, canvas, {
          dpr: resolveDpr(preset, canvas),
          autoResize: false,
          format: outputFormat
        });
        const graph = createRenderGraph(gpu, output.size, resolveBloomSize([canvas.clientWidth, canvas.clientHeight]));
        await prepareRenderGraph(graph, outputFormat);
        if (disposed) return;

        let lastSettingsSignature = '';
        let previousRenderTimestamp = 0;
        let lastPresentationTimestamp = 0;
        let nextPresentationTimestamp = 0;
        let flowDistance = 0;
        let travelPhase = 0;
        let grainTime = 0;
        let firstFrame = true;
        const placementMotion = createFormation(settingsRef.current.composition);
        let layoutWeights = placementMotion.weights;
        let layoutTransitioning = false;
        const formation = createFormation(settingsRef.current.flow);
        let renderScale = settingsRef.current.scale;
        let runtimeQualityLevel = 0;
        let appliedBloomLevel = 0;
        let pendingBloomResize = false;
        let pressureStartedAt = 0;
        let stableStartedAt = performance.now();
        let lastQualityChange = 0;
        let encodeAverage = 0;
        let renderTimestamp = 0;
        let previousRafTimestamp = 0;
        let refreshInterval = 1000 / 60;
        const refreshSamples = new Float32Array(30);
        let refreshSampleCount = 0;
        let refreshSampleIndex = 0;

        const resolveFrameState = (now: number) => {
          const pointer = pointerRef.current;
          const pointerTransitioning = Math.abs(pointer.presence - pointer.active) > 0.004;
          if (
            now < interactionDeadline ||
            pointerTransitioning ||
            ripplesRef.current.some(ripple => ripple.strength > 0) ||
            layoutTransitioning ||
            holdRef.current.pointerId !== null ||
            holdRef.current.amount > 0 ||
            formation.weights[settingsRef.current.flow] < 1 ||
            Math.abs(settingsRef.current.scale - renderScale) > 0.001
          ) {
            return FRAME_STATES.interactive;
          }
          if (now < settlingDeadline) return FRAME_STATES.settling;
          if (visibilityRatio < 0.25) return FRAME_STATES.partial;
          return FRAME_STATES.ambient;
        };

        const resizePostTargets = (qualityLevel = appliedBloomLevel) => {
          const width = Math.max(1, output.size[0]);
          const height = Math.max(1, output.size[1]);
          const bloomSize = resolveBloomSize([canvas.clientWidth, canvas.clientHeight], qualityLevel);
          graph.sceneTarget.resize([width, height]);
          graph.bloomTarget.resize(bloomSize);
          graph.bloomScratchTarget.resize(bloomSize);
          graph.blurParamsX.set({ direction: [1 / bloomSize[0], 0, 0, 0] });
          graph.blurParamsY.set({ direction: [0, 1 / bloomSize[1], 0, 0] });
          graph.postParams.set({
            viewport: [width, height, 1 / width, 1 / height],
            bloomInfo: [1 / bloomSize[0], 1 / bloomSize[1], 0.2, 0.12]
          });
        };

        const resizeOutput = () => {
          updateBounds();
          const dpr = resolveDpr(preset, canvas);
          const nextSize: [number, number] = [
            Math.max(1, Math.round(canvas.clientWidth * dpr)),
            Math.max(1, Math.round(canvas.clientHeight * dpr))
          ];
          if (nextSize[0] !== output.size[0] || nextSize[1] !== output.size[1]) output.resize(nextSize);
          resizePostTargets();
        };

        unsubscribeResize = output.onResize(() => {
          resizePostTargets();
          needsRender = true;
          wakeRenderer();
        });
        resizeObserver = new ResizeObserver(() => {
          resizeOutput();
          wakeRenderer();
        });
        resizeObserver.observe(canvas);

        const setRuntimeQuality = (nextLevel: number, now: number, frameState: FrameState) => {
          const clampedLevel = Math.max(0, Math.min(RUNTIME_QUALITY.length - 1, nextLevel));
          if (clampedLevel === runtimeQualityLevel) return;
          runtimeQualityLevel = clampedLevel;
          pressureStartedAt = 0;
          stableStartedAt = now;
          lastQualityChange = now;
          if (frameState === FRAME_STATES.interactive || frameState === FRAME_STATES.settling) {
            pendingBloomResize = true;
          } else {
            appliedBloomLevel = runtimeQualityLevel;
            pendingBloomResize = false;
            resizePostTargets();
          }
        };

        const renderFrame = (currentFrame: Frame) => {
          const settings = settingsRef.current;
          const frozen = settings.paused || reduceMotion.matches || settings.speed <= 0.0001;
          const elapsed =
            resumePending || !previousRenderTimestamp
              ? 0
              : Math.min(0.05, Math.max(0, (renderTimestamp - previousRenderTimestamp) / 1000));
          resumePending = false;
          previousRenderTimestamp = renderTimestamp;
          lastSettingsSignature = settings.signature;
          needsRender = false;

          if (!frozen) {
            flowDistance += elapsed * settings.speed * 0.34;
            grainTime += elapsed;
          }
          if (frozen) {
            renderScale = settings.scale;
          } else {
            renderScale += (settings.scale - renderScale) * (1 - Math.exp(-elapsed * 12));
          }

          advanceFormation(placementMotion, settings.composition, elapsed, settings.transitionDuration, frozen);
          layoutWeights = placementMotion.weights;
          layoutTransitioning = layoutWeights[settings.composition] !== 1;
          if (!frozen) {
            const travelAspect = output.size[0] / Math.max(output.size[1], 1);
            travelPhase =
              (travelPhase + (elapsed * settings.speed * 0.34) / resolvePathLength(travelAspect, layoutWeights)) % 1;
          }

          const pointer = pointerRef.current;
          advanceFormation(formation, settings.flow, elapsed, settings.transitionDuration, frozen);
          advanceHold(
            holdRef.current,
            elapsed,
            frozen || !settings.holdToGather || settings.interaction === INTERACTIONS.none
          );
          if (settings.interaction === INTERACTIONS.none) {
            pointer.active = 0;
            pointer.presence = 0;
            resetPointerMotion(pointer);
          } else if (frozen) {
            pointer.position = [...pointer.raw];
            pointer.presence = pointer.active;
            resetPointerMotion(pointer);
          } else if (pointer.initialized) {
            advancePointer(pointer, elapsed);
          }

          advanceRipples(ripplesRef.current, elapsed, frozen || settings.interaction === INTERACTIONS.none);

          const runtimeQuality = RUNTIME_QUALITY[runtimeQualityLevel];
          const activeCount = Math.max(
            700,
            Math.round(preset.count * settings.detailCount * runtimeQuality.countScale)
          );
          const densityCompensation = Math.pow(1 / runtimeQuality.countScale, 0.2);
          const shardWorldSize = 0.0125 * settings.shardSize * densityCompensation;
          const aspect = output.size[0] / Math.max(output.size[1], 1);
          const lightPresence = settings.interaction === INTERACTIONS.none ? 0 : pointer.presence;
          const pointerShiftX = (pointer.position[0] - 0.5) * 0.38 * lightPresence;
          const pointerShiftY = (pointer.position[1] - 0.5) * -0.24 * lightPresence;
          const lightX = -0.38 + pointerShiftX;
          const lightY = 0.58 + pointerShiftY;
          const lightLength = Math.hypot(lightX, lightY, 1);
          const interactionSign = settings.interaction === INTERACTIONS.attract ? 1 : -1;
          const interactionPresence =
            settings.interaction === INTERACTIONS.none
              ? 0
              : pointer.presence * settings.interactionStrength * interactionSign * (1 - holdRef.current.amount);
          const pointerWorldX = ((pointer.position[0] * 2 - 1) * aspect) / renderScale;
          const pointerWorldY = (1 - pointer.position[1] * 2) / renderScale;
          const inverseScale = 1 / renderScale;
          const rippleUniforms = ripplesRef.current.map(ripple => [
            (ripple.origin[0] * 2 - 1) * aspect * inverseScale,
            (1 - ripple.origin[1] * 2) * inverseScale,
            ripple.age,
            ripple.strength * settings.interactionStrength * settings.rippleIntensity * inverseScale
          ]);

          graph.viewParams.set({
            viewport: [aspect, shardWorldSize, renderScale, flowDistance],
            shape: [settings.spread, settings.depth, settings.turbulence, pointerShiftY],
            effects: [settings.spin, settings.edgeSoftness, settings.stretch, settings.exposure],
            composition: layoutWeights,
            transport: [travelPhase, Math.min(1, (1 - Math.max(...layoutWeights)) * 12), 0, 0],
            formation: formation.weights,
            gather: [pointerWorldX, pointerWorldY, holdRef.current.amount, holdRef.current.phase],
            pointer: [
              pointerWorldX,
              pointerWorldY,
              settings.interactionRadius * 2 * inverseScale,
              interactionPresence * inverseScale
            ],
            shock: rippleUniforms[0],
            shockB: rippleUniforms[1],
            shockC: rippleUniforms[2],
            shockD: rippleUniforms[3],
            material: [settings.roughness, settings.material, settings.brightness, settings.glow],
            light: [lightX / lightLength, lightY / lightLength, 1 / lightLength, pointerShiftX],
            environment: [settings.lightSurface, 0, 0, 0],
            baseColor: settings.shard,
            highlightColor: settings.highlight,
            accentColor: settings.accent
          });
          graph.postParams.set({
            finishing: [settings.bloom, settings.grain, settings.chromaticAberration, settings.lightSurface],
            background: settings.background,
            tint: mixColor(settings.shard, settings.accent, 0.4),
            temporal: [grainTime, 0, 0, 0]
          });

          const postEnabled =
            settings.bloom > 0.0001 ||
            settings.grain > 0.0001 ||
            settings.chromaticAberration > 0.000001;

          if (!postEnabled) {
            currentFrame.pass({ target: output, clear: settings.background }, (pass: FramePass) => {
              pass.draw(graph.shardDraw, { instances: activeCount });
            });
          } else {
            currentFrame.pass({ target: graph.sceneTarget, clear: settings.background }, (pass: FramePass) => {
              pass.draw(graph.shardDraw, { instances: activeCount });
            });
            if (settings.bloom > 0.0001) {
              currentFrame.pass({ target: graph.bloomTarget, clear: [0, 0, 0, 0] }, (pass: FramePass) => {
                pass.draw(graph.bloomEffect);
              });
              currentFrame.pass({ target: graph.bloomScratchTarget, clear: [0, 0, 0, 0] }, (pass: FramePass) => {
                pass.draw(graph.bloomBlurX);
              });
              currentFrame.pass({ target: graph.bloomTarget, clear: [0, 0, 0, 0] }, (pass: FramePass) => {
                pass.draw(graph.bloomBlurY);
              });
            }
            currentFrame.pass({ target: output, clear: settings.background }, (pass: FramePass) => {
              pass.draw(graph.finishEffect);
            });
          }

          if (firstFrame) {
            firstFrame = false;
            requestAnimationFrame(() => {
              if (!disposed) setReady(true);
            });
          }
        };

        const scheduleRaf = () => {
          if (disposed || runtimeFailed || animationFrameId || !visible || document.hidden) return;
          animationFrameId = requestAnimationFrame(scheduleFrame);
        };

        const scheduleSleep = (targetTimestamp: number) => {
          if (disposed || runtimeFailed || timeoutId || animationFrameId || !visible || document.hidden) return;
          const delay = Math.max(0, targetTimestamp - performance.now() - 10);
          timeoutId = window.setTimeout(() => {
            timeoutId = 0;
            scheduleRaf();
          }, delay);
        };

        const scheduleFrame = (timestamp: number) => {
          animationFrameId = 0;
          if (disposed || runtimeFailed || !visible || document.hidden) return;

          if (previousRafTimestamp) {
            const refreshSample = timestamp - previousRafTimestamp;
            if (refreshSample > 3 && refreshSample < 35) {
              refreshSamples[refreshSampleIndex] = refreshSample;
              refreshSampleIndex = (refreshSampleIndex + 1) % refreshSamples.length;
              refreshSampleCount = Math.min(refreshSampleCount + 1, refreshSamples.length);
              refreshInterval = refreshSamples[0];
              for (let index = 1; index < refreshSampleCount; index += 1) {
                refreshInterval = Math.min(refreshInterval, refreshSamples[index]);
              }
            }
          }
          previousRafTimestamp = timestamp;

          const settings = settingsRef.current;
          const settingsChanged = settings.signature !== lastSettingsSignature;
          const frozen = settings.paused || reduceMotion.matches || settings.speed <= 0.0001;
          if (frozen && !firstFrame && !settingsChanged && !needsRender) return;

          const forceFrame = firstFrame || settingsChanged || !lastPresentationTimestamp;
          const frameState = resolveFrameState(performance.now());
          const presentationInterval = resolveFrameInterval(frameState, refreshInterval);
          const cadenceDeadline = lastPresentationTimestamp + presentationInterval;
          const dueTimestamp = nextPresentationTimestamp
            ? Math.min(nextPresentationTimestamp, cadenceDeadline)
            : cadenceDeadline;
          if (!forceFrame && timestamp < dueTimestamp - 0.5) {
            if (frameState.continuous) scheduleRaf();
            else scheduleSleep(dueTimestamp);
            return;
          }

          if (pendingBloomResize && frameState !== FRAME_STATES.interactive && frameState !== FRAME_STATES.settling) {
            appliedBloomLevel = runtimeQualityLevel;
            pendingBloomResize = false;
            resizePostTargets();
          }

          const sincePresentation = lastPresentationTimestamp ? timestamp - lastPresentationTimestamp : Infinity;
          renderTimestamp = timestamp;
          const encodeStart = performance.now();
          try {
            // Set before the loop starts; if it was torn down, frame() throws and the catch
            // reports it exactly as before (the variable used to be `any`).
            frame(gpu!, renderFrame);
          } catch (error) {
            reportFailure(error);
            return;
          }
          lastPresentationTimestamp = timestamp;

          const monitorNow = performance.now();
          const encodeDuration = monitorNow - encodeStart;
          encodeAverage = encodeAverage ? encodeAverage * 0.9 + encodeDuration * 0.1 : encodeDuration;
          const missedDeadline = Number.isFinite(sincePresentation) && sincePresentation > presentationInterval * 1.65;
          const underPressure = encodeAverage > 4 || missedDeadline;

          if (underPressure) {
            if (!pressureStartedAt) pressureStartedAt = monitorNow;
          } else {
            pressureStartedAt = 0;
          }
          if (underPressure || frameState !== FRAME_STATES.ambient) stableStartedAt = monitorNow;

          const sustainedPressure = pressureStartedAt > 0 && monitorNow - pressureStartedAt > 1800;
          const qualityCooldownComplete = monitorNow - lastQualityChange > 2200;
          if (runtimeQualityLevel < RUNTIME_QUALITY.length - 1 && qualityCooldownComplete && sustainedPressure) {
            setRuntimeQuality(runtimeQualityLevel + 1, monitorNow, frameState);
          } else if (
            runtimeQualityLevel > 0 &&
            frameState === FRAME_STATES.ambient &&
            !underPressure &&
            monitorNow - stableStartedAt > 15000 &&
            monitorNow - lastQualityChange > 15000
          ) {
            setRuntimeQuality(runtimeQualityLevel - 1, monitorNow, frameState);
          }

          const nextState = resolveFrameState(performance.now());
          nextPresentationTimestamp = advanceFrameDeadline(
            timestamp,
            dueTimestamp,
            resolveFrameInterval(nextState, refreshInterval),
            forceFrame || nextState.continuous !== frameState.continuous
          );
          if (frozen) return;
          if (nextState.continuous) scheduleRaf();
          else scheduleSleep(nextPresentationTimestamp);
        };

        wakeRenderer = () => {
          needsRender = true;
          if (!animationFrameId) nextPresentationTimestamp = 0;
          if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = 0;
          }
          scheduleRaf();
        };
        wakeRef.current = wakeRenderer;
        wakeRenderer();
      } catch (error) {
        reportFailure(error);
      }
    })();

    return () => {
      disposed = true;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', deactivatePointer);
      window.removeEventListener('blur', deactivatePointer);
      window.removeEventListener('scroll', markBoundsDirty, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      reduceMotion.removeEventListener('change', handleVisibilityChange);
      visibilityObserver?.disconnect();
      resizeObserver?.disconnect();
      unsubscribeResize?.();
      unsubscribeGpuError?.();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (timeoutId) window.clearTimeout(timeoutId);
      wakeRef.current = () => {};
      gpu?.dispose?.();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`aero-shards ${className}`}
      data-ready={ready}
      style={{ backgroundColor }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="aero-shards__canvas" />
    </div>
  );
};
