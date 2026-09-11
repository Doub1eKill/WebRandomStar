import { StarNode } from '../../../types/session.ts';

export class ConstellationSystem {
  private nodes: StarNode[] = [];
  public opacity: number = 0.0;
  private pulsePhase: number = 0;
  public targetX: number | null = null;
  public targetY: number | null = null;
  public isLockedOn: boolean = false;
  private targetNodeIndex: number = -1;
  private rouletteIndex: number = 0;
  private rouletteTimer: number = 0;

  public setNodes(nodes: StarNode[]): void {
    this.nodes = nodes;
  }

  public setTargetNode(targetX: number, targetY: number): void {
    this.targetX = targetX;
    this.targetY = targetY;
    this.isLockedOn = false;
    this.rouletteTimer = 0;
    this.rouletteIndex = 0;

    let bestDist = Infinity;
    let bestIdx = 0;
    this.nodes.forEach((n, idx) => {
      const d = Math.hypot(n.x - targetX, n.y - targetY);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = idx;
      }
    });
    this.targetNodeIndex = bestIdx;
  }

  public lockOn(): void {
    this.isLockedOn = true;
    if (this.targetNodeIndex >= 0) {
      this.rouletteIndex = this.targetNodeIndex;
    }
  }

  public reset(): void {
    this.targetX = null;
    this.targetY = null;
    this.isLockedOn = false;
    this.targetNodeIndex = -1;
    this.rouletteIndex = 0;
    this.rouletteTimer = 0;
  }

  public update(): void {
    if (this.opacity <= 0.01) return;
    this.pulsePhase += 0.04;

    if (this.nodes.length > 0) {
      if (!this.isLockedOn) {
        this.rouletteTimer++;
        if (this.rouletteTimer % 4 === 0) { // Cycle every ~66ms
          this.rouletteIndex = (this.rouletteIndex + 1) % this.nodes.length;
        }
      } else if (this.targetNodeIndex >= 0) {
        this.rouletteIndex = this.targetNodeIndex;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (this.opacity <= 0.01 || this.nodes.length === 0) return;

    ctx.save();

    // 1. Draw glowing constellation connection lines between adjacent nodes
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = `rgba(147, 197, 253, ${0.45 * this.opacity})`;
    ctx.beginPath();
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const a = this.nodes[i];
      const b = this.nodes[i + 1];
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    // Connect back to first node if >= 4 nodes for a majestic constellation shape
    if (this.nodes.length >= 4) {
      const first = this.nodes[0];
      const last = this.nodes[this.nodes.length - 1];
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(first.x, first.y);
    }
    ctx.stroke();

    // 2. Draw each star node with glowing halo
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const isSelected = i === this.rouletteIndex;
      const pulse = (1 + 0.15 * Math.sin(this.pulsePhase + i * 1.2)) * (isSelected ? 1.3 : 1.0);
      const radius = node.radius * pulse;

      // Outer golden/cyan aura
      const aura = ctx.createRadialGradient(
        node.x, node.y, radius * 0.4,
        node.x, node.y, radius * (isSelected ? 4.5 : 3.5)
      );
      aura.addColorStop(0, `rgba(253, 224, 71, ${(isSelected ? 0.95 : 0.65) * this.opacity})`);
      aura.addColorStop(0.5, `rgba(56, 189, 248, ${(isSelected ? 0.65 : 0.35) * this.opacity})`);
      aura.addColorStop(1, 'rgba(15, 23, 42, 0)');

      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius * (isSelected ? 4.5 : 3.5), 0, Math.PI * 2);
      ctx.fill();

      // White-hot star core
      ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * this.opacity})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Cross flare shimmer
      ctx.strokeStyle = `rgba(255, 255, 255, ${(isSelected ? 0.85 : 0.5) * this.opacity * pulse})`;
      ctx.lineWidth = isSelected ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(node.x - radius * 2.5, node.y);
      ctx.lineTo(node.x + radius * 2.5, node.y);
      ctx.moveTo(node.x, node.y - radius * 2.5);
      ctx.lineTo(node.x, node.y + radius * 2.5);
      ctx.stroke();

      // Active roulette cycling ring
      if (isSelected && !this.isLockedOn) {
        ctx.save();
        ctx.strokeStyle = `rgba(253, 224, 71, ${0.85 * this.opacity})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 3.0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 3. Draw targeting reticle when locked on
    if (this.isLockedOn && this.targetNodeIndex >= 0 && this.nodes[this.targetNodeIndex]) {
      const lockedNode = this.nodes[this.targetNodeIndex];
      const reticlePulse = 1 + 0.1 * Math.sin(this.pulsePhase * 3);
      const reticleSize = lockedNode.radius * 3.8 * reticlePulse;
      const bracketLen = reticleSize * 0.45;

      ctx.save();
      ctx.strokeStyle = `rgba(253, 224, 71, ${0.95 * this.opacity})`;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 14;

      // 4 Corner Brackets:
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(lockedNode.x - reticleSize, lockedNode.y - reticleSize + bracketLen);
      ctx.lineTo(lockedNode.x - reticleSize, lockedNode.y - reticleSize);
      ctx.lineTo(lockedNode.x - reticleSize + bracketLen, lockedNode.y - reticleSize);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(lockedNode.x + reticleSize - bracketLen, lockedNode.y - reticleSize);
      ctx.lineTo(lockedNode.x + reticleSize, lockedNode.y - reticleSize);
      ctx.lineTo(lockedNode.x + reticleSize, lockedNode.y - reticleSize + bracketLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(lockedNode.x - reticleSize, lockedNode.y + reticleSize - bracketLen);
      ctx.lineTo(lockedNode.x - reticleSize, lockedNode.y + reticleSize);
      ctx.lineTo(lockedNode.x - reticleSize + bracketLen, lockedNode.y + reticleSize);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(lockedNode.x + reticleSize - bracketLen, lockedNode.y + reticleSize);
      ctx.lineTo(lockedNode.x + reticleSize, lockedNode.y + reticleSize);
      ctx.lineTo(lockedNode.x + reticleSize, lockedNode.y + reticleSize - bracketLen);
      ctx.stroke();

      // Inner pulsating neon ring
      ctx.beginPath();
      ctx.arc(lockedNode.x, lockedNode.y, reticleSize * 0.72, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.85 * this.opacity * reticlePulse})`;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }
}
