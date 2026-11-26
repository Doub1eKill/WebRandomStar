/**
 * WGSL for the AeroShards stage backdrop: what the glass sculpture floats in front of.
 *
 * It runs inside the existing finish pass (no extra render targets): a procedural nebula with a
 * diagonal "galactic band", three parallax star layers, a five-beam spotlight rig that sweeps and
 * converges on word-lock, a stage horizon with a reflection shimmer, and the word-lock / Done
 * pulses. Everything is driven by the PostParams uniforms `stage`, `rig` and `scenery`, which
 * AeroShards.tsx fills from the stage state and the appearance settings.
 *
 * Cost: 7 value-noise lookups, 3 star cells and 5 analytic beams per pixel.
 */

/** Fields appended to PostParams in BLOOM_SHADER and FINISH_SHADER (keep the two in sync). */
export const STAGE_POST_FIELDS = `
  stage: vec4f,
  rig: vec4f,
  scenery: vec4f,
`;

export const BACKDROP_WGSL = `
const VIOLET = vec3f(0.486, 0.227, 0.929);
const CYAN = vec3f(0.22, 0.741, 0.973);
const GOLD = vec3f(0.96, 0.85, 0.54);
const ICE = vec3f(0.65, 0.95, 0.99);
const LAVENDER = vec3f(0.75, 0.52, 0.99);
const MAGENTA = vec3f(0.75, 0.15, 0.83);

fn valueNoise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let a = hash12(i);
  let b = hash12(i + vec2f(1.0, 0.0));
  let c = hash12(i + vec2f(0.0, 1.0));
  let d = hash12(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

fn fbm3(p: vec2f) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var q = p;
  for (var octave = 0; octave < 3; octave++) {
    value += amplitude * valueNoise(q);
    q = vec2f(q.x * 1.6 - q.y * 1.2, q.x * 1.2 + q.y * 1.6) + vec2f(1.7, 9.2);
    amplitude *= 0.5;
  }
  return value / 0.875;
}

fn starLayer(p: vec2f, scale: f32, density: f32, time: f32) -> vec3f {
  let g = p * scale;
  let cell = floor(g);
  let local = fract(g) - vec2f(0.5);
  let pick = hash12(cell + vec2f(17.0, 3.0));
  if (pick > density) { return vec3f(0.0); }
  let offset = (vec2f(hash12(cell + vec2f(3.1, 1.7)), hash12(cell + vec2f(7.7, 5.3))) - vec2f(0.5)) * 0.6;
  let d = local - offset;
  let r2 = dot(d, d);
  let sizeSeed = hash12(cell + vec2f(1.3, 9.1));
  let twinkle = 0.55 + 0.45 * sin(time * (0.8 + sizeSeed * 2.4) + pick * 61.0);
  let core = exp(-r2 * mix(900.0, 260.0, sizeSeed));
  var spikes = 0.0;
  if (sizeSeed > 0.86) {
    spikes = (exp(-abs(d.x) * 90.0) * exp(-abs(d.y) * 7.0) + exp(-abs(d.y) * 90.0) * exp(-abs(d.x) * 7.0)) * 0.55;
  }
  let tone = fract(pick * 13.7);
  var tint = vec3f(1.0);
  if (tone < 0.16) { tint = GOLD; } else if (tone < 0.42) { tint = ICE; } else if (tone < 0.52) { tint = LAVENDER; }
  return tint * (core + spikes) * twinkle;
}

fn beamLight(p: vec2f, anchor: vec2f, angle: f32, spread: f32) -> f32 {
  let dir = vec2f(sin(angle), cos(angle));
  let v = p - anchor;
  let along = dot(v, dir);
  if (along <= 0.0) { return 0.0; }
  let across = dot(v, vec2f(-dir.y, dir.x));
  let width = 0.006 + along * spread;
  let x = across / width;
  let x2 = x * x;
  return exp(-x2 * 2.2) * exp(-along * 0.55) * (0.35 + 0.65 * exp(-x2 * 14.0));
}

fn stageBackdrop(pixel: vec2f) -> vec3f {
  let res = post.viewport.xy;
  let aspect = res.x / max(res.y, 1.0);
  let p = pixel / max(res.y, 1.0);
  let time = post.stage.x;
  let pulse = post.stage.z;
  let goldPulse = post.stage.w;
  let glow = post.scenery.w;
  let drift = post.rig.z;
  var color = post.background.rgb;

  // Sky gradient (matches the Cosmic Canvas: #060919 at the top, #120d31 low on the stage)
  color += vec3f(0.035, 0.02, 0.09) * smoothstep(0.1, 0.75, p.y) * (1.0 - smoothstep(0.85, 1.0, p.y));

  // Nebula clouds + diagonal galactic band with a faint gold core
  var bandWisps = 0.0;
  if (post.scenery.y > 0.001) {
    let q = p * 1.7 + vec2f(drift * 0.02, drift * 0.006);
    let warp = valueNoise(q * 0.9 + vec2f(time * 0.01, 0.0));
    let n = fbm3(q + vec2f(warp * 1.3, warp * 0.7));
    let n2 = fbm3(q * 2.2 + vec2f(5.2, 1.3) - vec2f(warp * 0.6));
    let clouds = smoothstep(0.32, 0.78, n);
    let wisps = smoothstep(0.42, 0.8, n2);
    bandWisps = wisps;
    var neb = VIOLET * clouds * 0.24
      + CYAN * wisps * clouds * 0.15
      + MAGENTA * smoothstep(0.5, 0.85, n * n2 * 1.9) * 0.09;
    let center = vec2f(aspect * 0.5, 0.42);
    let bandNormal = normalize(vec2f(0.35, 1.0));
    let across = dot(p - center, bandNormal);
    let alongVec = p - center - bandNormal * across;
    let along2 = dot(alongVec, alongVec);
    let band = exp(-across * across * 30.0) * (0.45 + 0.75 * n2);
    neb += (LAVENDER * 0.13 + ICE * 0.05 * wisps) * band * post.scenery.z;
    neb += GOLD * band * exp(-along2 * 6.0) * 0.08 * post.scenery.z;
    color += neb * post.scenery.y * (0.9 + 0.1 * sin(time * 0.35));
  }

  // Parallax stars: far, mid, near (near drifts fastest)
  var stars = starLayer(p + vec2f(drift * 0.004, 0.0), 42.0, 0.55, time) * 0.55
    + starLayer(p + vec2f(drift * 0.009 + 3.7, 1.9), 24.0, 0.4, time) * 0.8
    + starLayer(p + vec2f(drift * 0.018 + 8.1, 4.4), 11.0, 0.3, time);
  stars *= (1.0 - smoothstep(0.72, 0.95, p.y)) * (1.0 + pulse * 1.2 + bandWisps * 0.3);
  color += stars * (0.6 + 0.4 * min(glow, 1.5));

  // Spotlight rig: five beams from above the frame; they converge on the stage on word-lock
  if (post.scenery.x > 0.001) {
    let focus = vec2f(aspect * 0.5, 0.47);
    let phase = post.rig.x;
    let converge = post.rig.y;
    var light = vec3f(0.0);
    for (var i = 0; i < 5; i++) {
      let fi = f32(i);
      let anchor = vec2f((0.1 + fi * 0.2) * aspect, -0.06);
      let swept = (0.42 - fi * 0.21) + sin(phase * (0.6 + 0.2 * abs(fi - 2.0)) + fi * 1.4) * 0.2;
      let toFocus = atan2(focus.x - anchor.x, focus.y - anchor.y);
      let angle = mix(swept, toFocus, converge);
      var tint = VIOLET;
      if (i == 1 || i == 3) { tint = CYAN; }
      if (i == 2) { tint = GOLD; }
      light += mix(tint, vec3f(1.0), 0.25) * beamLight(p, anchor, angle, 0.11 * (1.0 - converge * 0.35));
    }
    color += light * 0.28 * post.scenery.x;
    let fd = p - focus;
    color += (vec3f(0.12) + GOLD * 0.08) * exp(-dot(fd, fd) * 14.0) * converge * post.scenery.x;
  }

  // Stage horizon: glowing floor pool, lavender rim and a soft reflection shimmer
  if (post.rig.w > 0.001) {
    let hx = (p.x - aspect * 0.5) / (aspect * 0.55);
    let hy = (p.y - 0.9) / 0.14;
    let ellipse = hx * hx + hy * hy;
    let k = (sqrt(ellipse) - 1.0) * 26.0;
    let rim = exp(-k * k) * step(p.y, 0.9);
    color += (vec3f(0.66, 0.33, 0.97) * exp(-ellipse * 1.6) * 0.16 + LAVENDER * rim * 0.22) * post.rig.w;
    let shimmer = 0.5 + 0.5 * sin(p.x * 60.0 + time * 1.5) * sin(p.x * 23.0 - time * 0.9);
    color += vec3f(0.22, 0.6, 0.9) * smoothstep(0.88, 0.95, p.y) * shimmer * 0.04 * post.rig.w;
  }

  // Word-lock: white flash and a gold shock ring racing outward from the stage centre
  if (pulse > 0.001) {
    let d = length((p - vec2f(aspect * 0.5, 0.45)) * vec2f(1.0, 1.4));
    let k = (d - (1.0 - pulse) * 1.1) * 22.0;
    color += (GOLD * exp(-k * k) * 0.55 + vec3f(1.0) * exp(-d * d * 8.0) * pulse * 0.35) * pulse;
  }

  // Done: a band of gold light sweeping down the stage
  if (goldPulse > 0.001) {
    let k = (p.y - ((1.0 - goldPulse) * 1.3 - 0.15)) * 6.0;
    color += GOLD * exp(-k * k) * goldPulse * 0.4;
  }

  // Vignette and a sub-LSB dither so the dark gradients never band on a projector
  let vc = (p - vec2f(aspect * 0.5, 0.45)) / vec2f(aspect, 1.0);
  color *= 1.0 - smoothstep(0.25, 0.85, length(vc) * 1.2) * 0.55;
  color += vec3f((hash12(floor(pixel) + vec2f(time * 7.0)) - 0.5) / 255.0);
  return max(color, vec3f(0.0));
}
`;
