/** Formation, hold, pointer and ripple motion helpers for AeroShards (Phase 6, A2). */
import { RIPPLE_SPEED, RIPPLE_TAIL } from './presets.ts';

/** Smoothed pointer state (A5: typed, was `any`). */
export interface PointerMotion {
  raw: number[];
  position: number[];
  velocity: number[];
  active: number;
  presence: number;
  presenceVelocity: number;
  initialized: boolean;
}

export interface Ripple {
  origin: number[];
  age: number;
  duration: number;
  strength: number;
}

export const resolveFrameInterval = (frameState: { interval: number; continuous: boolean }, refreshInterval: number) =>
  frameState.continuous ? Math.max(frameState.interval, refreshInterval) : frameState.interval;

export const advanceFrameDeadline = (timestamp: number, deadline: number, interval: number, reset: boolean) => {
  const nextDeadline = deadline + interval;
  return reset || nextDeadline <= timestamp - 0.5 ? timestamp + interval : nextDeadline;
};

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const layoutVector = (placement: number) => [0, 1, 2, 3].map(index => (index === placement ? 1 : 0));

export const createFormation = (flow: number) => ({ weights: layoutVector(flow), velocity: [0, 0, 0, 0] });

export const advanceFormation = (state: { weights: number[]; velocity: number[] }, flow: number, elapsed: number, duration: number, frozen: boolean) => {
  const goal = layoutVector(flow);
  if (frozen) {
    state.weights = goal;
    state.velocity.fill(0);
    return;
  }
  const response = 6 / duration;
  const decay = Math.exp(-response * elapsed);
  for (let i = 0; i < 4; i += 1) {
    const offset = state.weights[i] - goal[i];
    const momentum = state.velocity[i] + response * offset;
    state.weights[i] = goal[i] + (offset + momentum * elapsed) * decay;
    state.velocity[i] = (state.velocity[i] - response * momentum * elapsed) * decay;
  }
  if (state.weights.every((value, i) => Math.abs(value - goal[i]) < 0.0001 && Math.abs(state.velocity[i]) < 0.001)) {
    state.weights = goal;
    state.velocity.fill(0);
  }
};

export const resolvePathLength = (aspect: number, weights: number[]) => {
  const side = 2.65 + 0.61 * aspect + 0.09 * aspect * aspect;
  const center = 2.3 + 2 * aspect + 0.35 * aspect * aspect;
  const full = Math.hypot(2.44 * aspect, Math.sqrt(5));
  const mobile = Math.hypot(2.56 * aspect, 1);
  return aspect < 0.82
    ? mobile * (weights[0] + weights[1] + weights[2]) + full * weights[3]
    : side * (weights[0] + weights[1]) + center * weights[2] + full * weights[3];
};

export const createHold = () => ({ pointerId: null as number | null, elapsed: 0, amount: 0, velocity: 0, phase: 0 });

export const advanceHold = (hold: { pointerId: number | null; elapsed: number; amount: number; velocity: number; phase: number }, elapsed: number, disabled: boolean) => {
  if (disabled) {
    hold.pointerId = null;
    hold.elapsed = 0;
    hold.amount = 0;
    hold.velocity = 0;
    return;
  }
  const previousElapsed = hold.elapsed;
  hold.elapsed = hold.pointerId === null ? 0 : hold.elapsed + elapsed;
  const engaging = hold.pointerId !== null && hold.elapsed > 0.15;
  const step = engaging && previousElapsed < 0.15 ? hold.elapsed - 0.15 : elapsed;
  const targetVal = engaging ? 1 : 0;
  const response = engaging ? 3.8 : 3.2;
  const decay = Math.exp(-response * step);
  const offset = hold.amount - targetVal;
  const momentum = hold.velocity + response * offset;
  hold.amount = targetVal + (offset + momentum * step) * decay;
  hold.velocity = (hold.velocity - response * momentum * step) * decay;
  if (Math.abs(hold.amount - targetVal) < 0.0001 && Math.abs(hold.velocity) < 0.001) {
    hold.amount = targetVal;
    hold.velocity = 0;
  }
  if (hold.amount > 0) hold.phase += elapsed * (0.35 + hold.amount * 0.5);
};

export const resetPointerMotion = (pointer: PointerMotion) => {
  pointer.velocity ??= [0, 0];
  pointer.velocity[0] = 0;
  pointer.velocity[1] = 0;
  pointer.presenceVelocity = 0;
};

export const advancePointer = (pointer: PointerMotion, elapsed: number) => {
  if (elapsed <= 0) return;
  const response = 26;
  const decay = Math.exp(-response * elapsed);
  for (let axis = 0; axis < 2; axis += 1) {
    const offset = pointer.position[axis] - pointer.raw[axis];
    const momentum = pointer.velocity[axis] + response * offset;
    pointer.position[axis] = pointer.raw[axis] + (offset + momentum * elapsed) * decay;
    pointer.velocity[axis] = (pointer.velocity[axis] - response * momentum * elapsed) * decay;
  }
  const presenceTarget = pointer.active ? 1 : 0;
  const presenceResponse = pointer.active ? 24 : 12;
  const presenceDecay = Math.exp(-presenceResponse * elapsed);
  const presenceOffset = pointer.presence - presenceTarget;
  const presenceMomentum = pointer.presenceVelocity + presenceResponse * presenceOffset;
  const nextPresence = presenceTarget + (presenceOffset + presenceMomentum * elapsed) * presenceDecay;
  pointer.presence = clamp(nextPresence, 0, 1);
  pointer.presenceVelocity = (pointer.presenceVelocity - presenceResponse * presenceMomentum * elapsed) * presenceDecay;
  if (nextPresence !== pointer.presence) pointer.presenceVelocity = 0;
  if (Math.abs(pointer.presence - presenceTarget) < 0.001 && Math.abs(pointer.presenceVelocity) < 0.01) {
    pointer.presence = presenceTarget;
    pointer.presenceVelocity = 0;
  }
};

export const createRipples = () => Array.from({ length: 4 }, () => ({ origin: [0.5, 0.5], age: 0, duration: 0, strength: 0 }));

export const startRipple = (ripples: Ripple[], origin: number[], aspect: number, strength = 1) => {
  const ripple = ripples.find(value => value.strength === 0);
  if (!ripple) return false;
  ripple.origin = [...origin];
  ripple.age = 0;
  const farthestX = (1 + Math.abs(origin[0] * 2 - 1)) * aspect;
  const farthestY = 1 + Math.abs(origin[1] * 2 - 1);
  ripple.duration = Math.hypot(farthestX, farthestY) / RIPPLE_SPEED + RIPPLE_TAIL;
  ripple.strength = strength;
  return true;
};

export const advanceRipples = (ripples: Ripple[], elapsed: number, disabled: boolean) => {
  for (const ripple of ripples) {
    if (disabled) ripple.strength = 0;
    if (!ripple.strength) continue;
    ripple.age += elapsed;
    if (ripple.age >= ripple.duration) ripple.strength = 0;
  }
};

export const mixColor = (from: number[], to: number[], amount: number) => [
  from[0] + (to[0] - from[0]) * amount,
  from[1] + (to[1] - from[1]) * amount,
  from[2] + (to[2] - from[2]) * amount,
  1
];
