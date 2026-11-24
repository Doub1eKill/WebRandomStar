import { describe, it, expect, vi } from 'vitest';
import { LeafSystem } from '@/features/stage/background/canvas/LeafSystem.ts';

describe('LeafSystem Lifecycle', () => {
  it('should spawn hero leaf with target coordinates', () => {
    const leafSystem = new LeafSystem();
    leafSystem.resize(1920, 1080);
    leafSystem.spawnHeroLeaf(960, 500);

    expect(leafSystem.heroLeaf).toBeDefined();
    expect(leafSystem.heroLeaf?.targetX).toBe(960);
    expect(leafSystem.heroLeaf?.targetY).toBe(500);
    expect(leafSystem.heroLanded).toBe(false);
  });

  it('should navigate hero leaf towards target and trigger onHeroLeafArrived', () => {
    const leafSystem = new LeafSystem();
    leafSystem.resize(1920, 1080);
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

  it('should dissolve hero leaf', () => {
    const leafSystem = new LeafSystem();
    leafSystem.resize(1920, 1080);
    leafSystem.spawnHeroLeaf(960, 500);
    expect(leafSystem.heroLeaf?.opacity).toBe(1);

    leafSystem.dissolveHeroLeaf();
    expect(leafSystem.heroLeaf?.opacity).toBe(0);
  });

  it('should allow sparkles to spawn and update smoothly', () => {
    const leafSystem = new LeafSystem();
    leafSystem.resize(1920, 1080);
    expect(() => leafSystem.spawnSparkles(960, 500, 10)).not.toThrow();

    leafSystem.active = false;
    leafSystem.opacity = 0;
    expect(() => leafSystem.update()).not.toThrow();
  });
});
