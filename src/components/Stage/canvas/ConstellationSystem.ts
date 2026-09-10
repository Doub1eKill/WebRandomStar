import { StarNode } from '../../../types/session.ts';

export class ConstellationSystem {
  private nodes: StarNode[] = [];
  public opacity: number = 0.0;
  private pulsePhase: number = 0;

  public setNodes(nodes: StarNode[]): void {
    this.nodes = nodes;
  }

  public update(): void {
    if (this.opacity <= 0.01) return;
    this.pulsePhase += 0.04;
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
      const pulse = 1 + 0.15 * Math.sin(this.pulsePhase + i * 1.2);
      const radius = node.radius * pulse;

      // Outer golden/cyan aura
      const aura = ctx.createRadialGradient(
        node.x, node.y, radius * 0.4,
        node.x, node.y, radius * 3.5
      );
      aura.addColorStop(0, `rgba(253, 224, 71, ${0.65 * this.opacity})`);
      aura.addColorStop(0.5, `rgba(56, 189, 248, ${0.35 * this.opacity})`);
      aura.addColorStop(1, 'rgba(15, 23, 42, 0)');

      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // White-hot star core
      ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * this.opacity})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Cross flare shimmer
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * this.opacity * pulse})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(node.x - radius * 2.2, node.y);
      ctx.lineTo(node.x + radius * 2.2, node.y);
      ctx.moveTo(node.x, node.y - radius * 2.2);
      ctx.lineTo(node.x, node.y + radius * 2.2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
