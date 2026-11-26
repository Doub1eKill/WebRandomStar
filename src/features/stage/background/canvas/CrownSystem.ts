import { makeFlareSprite, rgba, STAGE_RGB, Rgb } from './sprites.ts';

type GemKind = 'round' | 'oval' | 'pear' | 'brilliant' | 'pearl';

interface GemSpot {
  x: number; // fraction of the crown width, relative to the base centre
  y: number; // fraction of the crown height (negative = up)
  r: number; // fraction of the crown width
  kind: GemKind;
  color: Rgb;
}

const SAPPHIRE: Rgb = [56, 189, 248];
const AMETHYST: Rgb = [139, 92, 246];
const LAVENDER: Rgb = [192, 132, 252];
const DIAMOND: Rgb = [214, 240, 255];
const PEARL: Rgb = [240, 236, 250];

/** Peak tips of the tiara (x, y as fractions of width / height from the base centre). */
const PEAKS: [number, number][] = [
  [-0.43, -0.5],
  [-0.22, -0.72],
  [0, -0.96],
  [0.22, -0.72],
  [0.43, -0.5]
];
/** Lowest point of the arch between consecutive peaks. */
const VALLEYS = [-0.27, -0.35, -0.35, -0.27];

const GEMS: GemSpot[] = [
  // Peak tops
  { x: 0, y: -0.96, r: 0.06, kind: 'brilliant', color: DIAMOND },
  { x: -0.22, y: -0.72, r: 0.036, kind: 'pear', color: LAVENDER },
  { x: 0.22, y: -0.72, r: 0.036, kind: 'pear', color: LAVENDER },
  { x: -0.43, y: -0.5, r: 0.026, kind: 'pearl', color: PEARL },
  { x: 0.43, y: -0.5, r: 0.026, kind: 'pearl', color: PEARL },
  // Teardrops hanging in the openwork windows
  { x: 0, y: -0.36, r: 0.042, kind: 'pear', color: SAPPHIRE },
  { x: -0.22, y: -0.33, r: 0.03, kind: 'pear', color: AMETHYST },
  { x: 0.22, y: -0.33, r: 0.03, kind: 'pear', color: AMETHYST },
  // Small round stones under the valleys
  { x: -0.325, y: -0.215, r: 0.014, kind: 'round', color: SAPPHIRE },
  { x: -0.11, y: -0.225, r: 0.014, kind: 'round', color: SAPPHIRE },
  { x: 0.11, y: -0.225, r: 0.014, kind: 'round', color: SAPPHIRE },
  { x: 0.325, y: -0.215, r: 0.014, kind: 'round', color: SAPPHIRE },
  // Band: central oval sapphire, amethysts and pearls
  { x: 0, y: -0.075, r: 0.05, kind: 'oval', color: SAPPHIRE },
  { x: -0.17, y: -0.08, r: 0.03, kind: 'round', color: AMETHYST },
  { x: 0.17, y: -0.08, r: 0.03, kind: 'round', color: AMETHYST },
  { x: -0.33, y: -0.085, r: 0.026, kind: 'round', color: LAVENDER },
  { x: 0.33, y: -0.085, r: 0.026, kind: 'round', color: LAVENDER },
  { x: -0.085, y: -0.078, r: 0.013, kind: 'pearl', color: PEARL },
  { x: 0.085, y: -0.078, r: 0.013, kind: 'pearl', color: PEARL },
  { x: -0.25, y: -0.082, r: 0.013, kind: 'pearl', color: PEARL },
  { x: 0.25, y: -0.082, r: 0.013, kind: 'pearl', color: PEARL },
  { x: -0.41, y: -0.088, r: 0.012, kind: 'pearl', color: PEARL },
  { x: 0.41, y: -0.088, r: 0.012, kind: 'pearl', color: PEARL }
];

/** Gems that throw a twinkling four-point flare: index into GEMS. */
const SPARKLE_GEMS = [0, 1, 2, 5, 12, 13, 14, 3, 4];

const shade = (c: Rgb, k: number): Rgb =>
  k >= 0
    ? [c[0] + (255 - c[0]) * k, c[1] + (255 - c[1]) * k, c[2] + (255 - c[2]) * k]
    : [c[0] * (1 + k), c[1] * (1 + k), c[2] * (1 + k)];

/**
 * CrownSystem: the royal crown above the stage, the pageant's centrepiece.
 *
 * A gold openwork tiara with five peaks (a brilliant-cut diamond on the tallest), teardrop
 * sapphires and amethysts hanging in the windows, and a jewelled band. The crown itself is baked
 * once per resize into an offscreen canvas (metal gradients, gems and facets are far too costly
 * to draw every frame). Each frame only adds the live light: a breathing gold/violet halo, slowly
 * rotating light rays, a glint that sweeps across the metal every few seconds, twinkling gem
 * flares and a gentle float.
 */
export class CrownSystem {
  private shimmerTime = 0;
  private sprite: HTMLCanvasElement | null = null;
  private outline: Path2D | null = null;
  private crownW = 0;
  private crownH = 0;
  private padX = 0;
  private padTop = 0;
  private flares = [
    makeFlareSprite(STAGE_RGB.white, 96),
    makeFlareSprite(STAGE_RGB.ice, 96),
    makeFlareSprite(STAGE_RGB.gold, 96)
  ];

  public resize(width: number, height: number): void {
    this.crownW = Math.max(120, Math.min(width * 0.22, height * 0.42, 380));
    this.crownH = this.crownW * 0.6;
    this.outline = this.buildOutline(this.crownW, this.crownH);
    this.sprite = this.bake();
  }

  public update(dt: number): void {
    this.shimmerTime += dt * 0.001;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    opacity: number = 1.0
  ): void {
    if (opacity <= 0.01) return;
    if (!this.sprite || this.crownW <= 0) this.resize(width, height);
    const W = this.crownW;
    const H = this.crownH;
    const t = this.shimmerTime;
    // Light effects follow the phase; the metal itself stays solid so the gold never looks washed out.
    const a = Math.min(1, 0.45 + 0.6 * opacity);
    const solid = Math.min(1, 0.6 + 0.8 * opacity);

    const baseX = width / 2;
    const baseY = height * 0.2 + H * 0.5 + Math.sin(t * 0.8) * H * 0.015;
    const cx = baseX;
    const cy = baseY - H * 0.55;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // 1. Halo behind the crown (breathing gold core, violet rim)
    const breathe = 0.85 + 0.15 * Math.sin(t * 1.3);
    const haloR = W * 0.95;
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloR);
    halo.addColorStop(0, rgba(STAGE_RGB.gold, 0.3 * a * breathe));
    halo.addColorStop(0.35, rgba(STAGE_RGB.lavender, 0.14 * a * breathe));
    halo.addColorStop(1, rgba(STAGE_RGB.violet, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(cx - haloR, cy - haloR, haloR * 2, haloR * 2);

    // 2. Slowly rotating light rays fanning out from the crown
    const rays = ctx.createRadialGradient(cx, cy, W * 0.1, cx, cy, W * 1.25);
    rays.addColorStop(0, rgba(STAGE_RGB.white, 0.2 * a));
    rays.addColorStop(0.3, rgba(STAGE_RGB.gold, 0.09 * a));
    rays.addColorStop(1, rgba(STAGE_RGB.gold, 0));
    ctx.fillStyle = rays;
    ctx.beginPath();
    const rayCount = 16;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + t * 0.06;
      const len = W * (i % 2 === 0 ? 1.25 : 0.85);
      const spread = i % 2 === 0 ? 0.045 : 0.028;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle - spread) * len, cy + Math.sin(angle - spread) * len);
      ctx.lineTo(cx + Math.cos(angle + spread) * len, cy + Math.sin(angle + spread) * len);
      ctx.closePath();
    }
    ctx.fill();

    // 3. The baked crown
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = solid;
    ctx.drawImage(this.sprite!, baseX - W / 2 - this.padX, baseY - H - this.padTop, W + this.padX * 2, H + this.padTop + H * 0.12);

    // 4. Glint sweeping across the metal (clipped to the crown outline)
    const cycle = (t * 0.22) % 1; // one sweep every ~4.5 s
    if (this.outline && cycle < 0.3) {
      const p = cycle / 0.3;
      const sx = -W * 0.75 + p * W * 1.5;
      ctx.save();
      ctx.translate(baseX, baseY);
      ctx.clip(this.outline);
      ctx.globalCompositeOperation = 'lighter';
      const sweep = ctx.createLinearGradient(sx - W * 0.12, -H, sx + W * 0.12, 0);
      sweep.addColorStop(0, 'rgba(255, 255, 255, 0)');
      sweep.addColorStop(0.5, `rgba(255, 250, 225, ${0.55 * a * Math.sin(p * Math.PI)})`);
      sweep.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sweep;
      ctx.fillRect(-W * 0.6, -H * 1.05, W * 1.2, H * 1.15);
      ctx.restore();
    }

    // 5. Twinkling gem flares
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < SPARKLE_GEMS.length; i++) {
      const gem = GEMS[SPARKLE_GEMS[i]];
      const tw = Math.pow(Math.max(0, Math.sin(t * (1.1 + i * 0.17) + i * 2.3)), 10);
      const big = i === 0 ? 1 : 0;
      const strength = big ? 0.35 + 0.65 * tw : tw;
      if (strength < 0.03) continue;
      const sprite = this.flares[i % 3];
      if (!sprite) continue;
      const size = W * (big ? 0.34 : 0.2) * (0.6 + 0.4 * strength);
      ctx.globalAlpha = Math.min(1, a * strength);
      ctx.drawImage(sprite, baseX + gem.x * W - size / 2, baseY + gem.y * H - size / 2, size, size);
    }

    ctx.restore();
  }

  /** Crown silhouette in CSS pixels, origin at the base centre (y up is negative). */
  private buildOutline(W: number, H: number): Path2D {
    const path = new Path2D();
    const P = PEAKS.map(([x, y]) => [x * W, y * H]);
    path.moveTo(-0.47 * W, -0.17 * H);
    path.quadraticCurveTo(-0.5 * W, -0.34 * H, P[0][0], P[0][1]);
    for (let i = 0; i < P.length - 1; i++) {
      const [ax, ay] = P[i];
      const [bx, by] = P[i + 1];
      const v = VALLEYS[i] * H;
      // Quadratic midpoint = (A + 2C + B) / 4, so solve C for the wanted valley depth
      const cyCtrl = (4 * v - ay - by) / 2;
      path.quadraticCurveTo((ax + bx) / 2, cyCtrl, bx, by);
    }
    path.quadraticCurveTo(0.5 * W, -0.34 * H, 0.47 * W, -0.17 * H);
    path.lineTo(0.45 * W, 0);
    path.quadraticCurveTo(0, 0.07 * H, -0.45 * W, 0);
    path.closePath();
    return path;
  }

  private bake(): HTMLCanvasElement | null {
    if (typeof document === 'undefined' || !this.outline) return null;
    const W = this.crownW;
    const H = this.crownH;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.padX = W * 0.08;
    this.padTop = H * 0.14;
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil((W + this.padX * 2) * dpr);
    canvas.height = Math.ceil((H + this.padTop + H * 0.12) * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.scale(dpr, dpr);
    ctx.translate(W / 2 + this.padX, H + this.padTop);
    const outline = this.outline;

    // Soft gold glow around the silhouette
    ctx.save();
    ctx.shadowColor = 'rgba(245, 217, 138, 0.85)';
    ctx.shadowBlur = W * 0.05;
    ctx.fillStyle = '#C9A24B';
    ctx.fill(outline);
    ctx.restore();

    // Polished gold body
    const gold = ctx.createLinearGradient(0, -H, 0, H * 0.05);
    gold.addColorStop(0, '#FFF7DA');
    gold.addColorStop(0.18, '#F5D98A');
    gold.addColorStop(0.42, '#D4A03A');
    gold.addColorStop(0.55, '#9A6A1C');
    gold.addColorStop(0.66, '#F7DC8E');
    gold.addColorStop(0.82, '#C8902E');
    gold.addColorStop(1, '#6E4A12');
    ctx.fillStyle = gold;
    ctx.fill(outline);

    // Vertical metal sheen bands (gives the curved, 3D feel)
    ctx.save();
    ctx.clip(outline);
    ctx.globalCompositeOperation = 'source-atop';
    const sheen = ctx.createLinearGradient(-W / 2, 0, W / 2, 0);
    const bands = [0, 0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88, 1];
    bands.forEach((stop, i) => sheen.addColorStop(stop, i % 2 === 0 ? 'rgba(80, 50, 10, 0.22)' : 'rgba(255, 252, 235, 0.28)'));
    ctx.fillStyle = sheen;
    ctx.fillRect(-W / 2, -H, W, H * 1.1);

    // Band: slightly darker strip with a bright top rim
    const band = new Path2D();
    band.moveTo(-0.47 * W, -0.17 * H);
    band.quadraticCurveTo(0, -0.1 * H, 0.47 * W, -0.17 * H);
    band.lineTo(0.45 * W, 0);
    band.quadraticCurveTo(0, 0.07 * H, -0.45 * W, 0);
    band.closePath();
    const bandGrad = ctx.createLinearGradient(0, -0.17 * H, 0, 0.05 * H);
    bandGrad.addColorStop(0, 'rgba(255, 244, 200, 0.55)');
    bandGrad.addColorStop(0.25, 'rgba(120, 80, 20, 0.25)');
    bandGrad.addColorStop(1, 'rgba(60, 35, 5, 0.45)');
    ctx.fillStyle = bandGrad;
    ctx.fill(band);
    ctx.restore();

    // Openwork windows under the three tall peaks (cut out, then trimmed in light gold)
    const windows = [
      { x: 0, top: -0.8, bottom: -0.25, w: 0.075 },
      { x: -0.22, top: -0.6, bottom: -0.25, w: 0.055 },
      { x: 0.22, top: -0.6, bottom: -0.25, w: 0.055 }
    ];
    for (const win of windows) {
      const path = new Path2D();
      const x = win.x * W;
      const top = win.top * H;
      const bottom = win.bottom * H;
      const ww = win.w * W;
      const shoulder = top + (bottom - top) * 0.5;
      path.moveTo(x, top);
      path.bezierCurveTo(x + ww * 0.9, shoulder - (bottom - top) * 0.1, x + ww, bottom, x, bottom);
      path.bezierCurveTo(x - ww, bottom, x - ww * 0.9, shoulder - (bottom - top) * 0.1, x, top);
      path.closePath();
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill(path);
      ctx.restore();
      // Deep violet backing glimpsed through the window
      ctx.fillStyle = 'rgba(46, 16, 101, 0.35)';
      ctx.fill(path);
      ctx.strokeStyle = '#FFF1C1';
      ctx.lineWidth = Math.max(1, W * 0.006);
      ctx.stroke(path);
    }

    // Filigree: thin scrolls along each arch and a bead line on the band rim
    ctx.strokeStyle = 'rgba(255, 246, 214, 0.75)';
    ctx.lineWidth = Math.max(0.8, W * 0.004);
    for (let i = 0; i < PEAKS.length - 1; i++) {
      const [ax, ay] = PEAKS[i];
      const [bx, by] = PEAKS[i + 1];
      const v = VALLEYS[i] + 0.06;
      const cyCtrl = (4 * v - (ay + 0.08) - (by + 0.08)) / 2;
      ctx.beginPath();
      ctx.moveTo(ax * W, (ay + 0.08) * H);
      ctx.quadraticCurveTo(((ax + bx) / 2) * W, cyCtrl * H, bx * W, (by + 0.08) * H);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255, 248, 225, 0.9)';
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      const x = (-0.46 + u * 0.92) * W;
      const y = (-0.17 + 0.07 * (1 - Math.pow(2 * u - 1, 2))) * H - H * 0.004;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.8, W * 0.0045), 0, Math.PI * 2);
      ctx.fill();
    }

    // Crisp outline
    ctx.strokeStyle = '#FFF3C4';
    ctx.lineWidth = Math.max(1, W * 0.007);
    ctx.lineJoin = 'round';
    ctx.stroke(outline);

    // Gems
    for (const gem of GEMS) this.drawGem(ctx, gem.x * W, gem.y * H, gem.r * W, gem.kind, gem.color);

    return canvas;
  }

  private drawGem(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, kind: GemKind, color: Rgb): void {
    ctx.save();
    ctx.translate(x, y);
    const path = new Path2D();
    if (kind === 'oval') {
      path.ellipse(0, 0, r * 0.72, r, 0, 0, Math.PI * 2);
    } else if (kind === 'pear') {
      path.moveTo(0, -r * 1.25);
      path.bezierCurveTo(r * 0.75, -r * 0.4, r * 0.9, r * 0.75, 0, r * 0.85);
      path.bezierCurveTo(-r * 0.9, r * 0.75, -r * 0.75, -r * 0.4, 0, -r * 1.25);
    } else if (kind === 'brilliant') {
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(ang) * r;
        const py = Math.sin(ang) * r;
        if (i === 0) path.moveTo(px, py);
        else path.lineTo(px, py);
      }
      path.closePath();
    } else {
      path.arc(0, 0, r, 0, Math.PI * 2);
    }

    // Body: lit from the upper left, dark toward the lower right
    const body = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.05, 0, 0, r * 1.15);
    if (kind === 'pearl') {
      body.addColorStop(0, '#FFFFFF');
      body.addColorStop(0.5, rgba(color, 1));
      body.addColorStop(1, '#A99CC4');
    } else {
      body.addColorStop(0, '#FFFFFF');
      body.addColorStop(0.25, rgba(shade(color, 0.45), 1));
      body.addColorStop(0.65, rgba(color, 1));
      body.addColorStop(1, rgba(shade(color, -0.6), 1));
    }
    ctx.fillStyle = body;
    ctx.fill(path);

    if (kind !== 'pearl') {
      // Facets: a table and spokes
      ctx.save();
      ctx.clip(path);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = Math.max(0.6, r * 0.06);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + Math.PI / 8;
        ctx.moveTo(Math.cos(ang) * r * 0.42, Math.sin(ang) * r * 0.42);
        ctx.lineTo(Math.cos(ang) * r * 1.3, Math.sin(ang) * r * 1.3);
      }
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const px = Math.cos(ang) * r * 0.42;
        const py = Math.sin(ang) * r * 0.42;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // Gold setting rim
    ctx.strokeStyle = '#FFE9A8';
    ctx.lineWidth = Math.max(0.8, r * 0.16);
    ctx.stroke(path);

    // Specular highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.32, -r * 0.38, r * 0.22, r * 0.13, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
