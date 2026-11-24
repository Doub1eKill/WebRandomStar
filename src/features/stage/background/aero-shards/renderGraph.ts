/** GPU render graph (targets, bloom chain, pipelines) for AeroShards (Phase 6, A2). */
import { draw, effect, sampler, target, uniforms } from 'vgpu';
import { BLOOM_SCALES, MATERIALS, MATERIAL_PRESETS } from './presets.ts';
import { SHARD_SHADER, BLOOM_SHADER, BLOOM_BLUR_SHADER, FINISH_SHADER } from './shaders.ts';
import { mixColor } from './motion.ts';

export const parseColor = (value: string | undefined, fallback: string): number[] => {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value || '');
  const source = match || /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(fallback)!;
  return [parseInt(source[1], 16) / 255, parseInt(source[2], 16) / 255, parseInt(source[3], 16) / 255, 1];
};

export const resolveQuality = (canvas: HTMLCanvasElement) => {
  const memory = (navigator as any).deviceMemory || 6;
  const cores = navigator.hardwareConcurrency || 6;
  const cssPixels = Math.max(1, canvas.clientWidth * canvas.clientHeight);
  if (canvas.clientWidth < 640 || memory <= 4 || cores <= 4) return 'low';
  if (cssPixels <= 360000 && memory >= 8 && cores >= 12) return 'high';
  return 'medium';
};

export const resolveDpr = (preset: { dpr: number; supersamplePixels: number }, canvas: HTMLCanvasElement) => {
  const cssPixels = Math.max(1, canvas.clientWidth * canvas.clientHeight);
  const budgetDpr = Math.sqrt(preset.supersamplePixels / cssPixels);
  return Math.max(1, Math.min(window.devicePixelRatio || 1, preset.dpr, budgetDpr));
};

export const resolveBloomSize = (size: readonly [number, number] | [number, number], qualityLevel = 0): [number, number] => {
  const bloomScale = BLOOM_SCALES[qualityLevel] ?? BLOOM_SCALES[0];
  return [Math.max(1, Math.round(size[0] * bloomScale)), Math.max(1, Math.round(size[1] * bloomScale))];
};

export const createRenderGraph = (gpu: any, outputSize: readonly [number, number] | [number, number], bloomSize: [number, number] = resolveBloomSize(outputSize)) => {
  const viewParams = uniforms(gpu, {
    viewport: [1, 0.0132, 1, 0],
    shape: [1, 1, 0.36, 0],
    effects: [1, 2, 1, 1.12],
    composition: [0, 0, 0, 1],
    transport: [0, 0, 0, 0],
    formation: [1, 0, 0, 0],
    gather: [0, 0, 0, 0],
    pointer: [0, 0, 0.54, 0],
    shock: [0, 0, 4, 0],
    shockB: [0, 0, 0, 0],
    shockC: [0, 0, 0, 0],
    shockD: [0, 0, 0, 0],
    material: [0.46, MATERIALS.pearl, 0.92, 0.54],
    light: [-0.321, 0.49, 0.845, 0],
    environment: [0, 0, 0, 0],
    baseColor: [137 / 255, 106 / 255, 189 / 255, 1],
    highlightColor: mixColor([168 / 255, 85 / 255, 247 / 255, 1], [1, 1, 1, 1], MATERIAL_PRESETS.pearl.highlightMix),
    accentColor: [168 / 255, 85 / 255, 247 / 255, 1]
  });
  const postParams = uniforms(gpu, {
    viewport: [outputSize[0], outputSize[1], 1 / outputSize[0], 1 / outputSize[1]],
    bloomInfo: [1 / bloomSize[0], 1 / bloomSize[1], 0.2, 0.12],
    finishing: [0.5, 0.05, 0.0075, 0],
    background: [0.071, 0.059, 0.09, 1],
    temporal: [0, 0, 0, 0],
    tint: [137 / 255, 106 / 255, 189 / 255, 1]
  });
  const shardDraw = draw(gpu, {
    shader: SHARD_SHADER,
    vertices: 6,
    blend: 'premultiplied',
    cull: 'none',
    depth: false,
    label: 'aero-shards-procedural'
  });
  shardDraw.set({ view: viewParams });
  const sceneTarget = target(gpu, {
    size: [outputSize[0], outputSize[1]],
    format: 'rgba8unorm',
    label: 'aero-shards-scene'
  });
  const bloomTarget = target(gpu, {
    size: bloomSize,
    format: 'rgba16float',
    label: 'aero-shards-bloom'
  });
  const bloomScratchTarget = target(gpu, {
    size: bloomSize,
    format: 'rgba16float',
    label: 'aero-shards-bloom-scratch'
  });
  const linearSampler = sampler(gpu, {
    minFilter: 'linear',
    magFilter: 'linear',
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge'
  });
  const bloomEffect = effect(gpu, BLOOM_SHADER, {
    label: 'aero-shards-bloom-prefilter',
    set: {
      sceneTexture: sceneTarget,
      sceneSampler: linearSampler,
      post: postParams
    }
  });
  const blurParamsX = uniforms(gpu, { direction: [1 / bloomSize[0], 0, 0, 0] });
  const blurParamsY = uniforms(gpu, { direction: [0, 1 / bloomSize[1], 0, 0] });
  const bloomBlurX = effect(gpu, BLOOM_BLUR_SHADER, {
    label: 'aero-shards-bloom-horizontal',
    set: { bloomTexture: bloomTarget, linearSampler, blur: blurParamsX }
  });
  const bloomBlurY = effect(gpu, BLOOM_BLUR_SHADER, {
    label: 'aero-shards-bloom-vertical',
    set: { bloomTexture: bloomScratchTarget, linearSampler, blur: blurParamsY }
  });
  const finishEffect = effect(gpu, FINISH_SHADER, {
    label: 'aero-shards-finish',
    set: {
      sceneTexture: sceneTarget,
      bloomTexture: bloomTarget,
      linearSampler,
      post: postParams
    }
  });

  return {
    viewParams,
    postParams,
    shardDraw,
    sceneTarget,
    bloomTarget,
    bloomScratchTarget,
    bloomEffect,
    blurParamsX,
    blurParamsY,
    bloomBlurX,
    bloomBlurY,
    finishEffect
  };
};

export const prepareRenderGraph = async (graph: any, outputFormat: string) => {
  await Promise.all([
    graph.shardDraw.compile({ colors: [outputFormat] }),
    graph.shardDraw.compile(graph.sceneTarget),
    graph.bloomEffect.compile(graph.bloomTarget),
    graph.bloomBlurX.compile(graph.bloomScratchTarget),
    graph.bloomBlurY.compile(graph.bloomTarget),
    graph.finishEffect.compile({ colors: [outputFormat] })
  ]);
};
