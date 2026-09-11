import { describe, it, expect, vi } from 'vitest';
import { LeafSystem } from '../src/components/Stage/canvas/LeafSystem.ts';

describe('LeafSystem Suspense & Supernova Lifecycle', () => {
  it('should spawn hero leaf with target coordinates', () => {
    const leafSystem = new LeafSystem(1920, 1080);
    leafSystem.spawnHeroLeaf(960, 500);

    expect(leafSystem.heroLeaf).toBeDefined();
    expect(leafSystem.heroLeaf?.targetX).toBe(960);
    expect(leafSystem.heroLeaf?.targetY).toBe(500);
    expect(leafSystem.heroLanded).toBe(false);
  });

  it('should navigate hero leaf towards target and trigger onHeroLeafArrived', () => {
    const leafSystem = new LeafSystem(1920, 1080);
    const onArrived = vi.fn();
    leafSystem.onHeroLeafArrived = onArrived;

    // Spawn close to target to test arrival
    leafSystem.opacity = 1.0;
    leafSystem.spawnHeroLeaf(500, 500);
    if (leafSystem.heroLeaf) {
      leafSystem.heroLeaf.x = 495;
      leafSystem.heroLeaf.y = 498;
    }

    leafSystem.update();

    expect(leafSystem.heroLanded).toBe(true);
    expect(onArrived).toHaveBeenCalledOnce();
  });

  it('should dissolve hero leaf upon supernova detonation', () => {
    const leafSystem = new LeafSystem(1920, 1080);
    leafSystem.spawnHeroLeaf(960, 500);
    expect(leafSystem.heroLeaf?.opacity).toBe(1);

    leafSystem.dissolveHeroLeaf();
    expect(leafSystem.heroLeaf?.opacity).toBe(0);
  });

  it('should allow sparkles to spawn and decay independently', () => {
    const leafSystem = new LeafSystem(1920, 1080);
    leafSystem.spawnSparkles(960, 500, 10);
    expect(leafSystem.sparkles.length).toBe(10);

    // Even if leaf is inactive and leaf.opacity is 0, update should continue updating sparkles
    leafSystem.active = false;
    leafSystem.opacity = 0;

    const initialAlpha = leafSystem.sparkles[0].alpha;
    leafSystem.update();
    expect(leafSystem.sparkles[0].alpha).toBeLessThan(initialAlpha);
  });
});
