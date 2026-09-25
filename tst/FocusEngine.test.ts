import {
  calculateSpatialDistance,
  findNextFocusTarget,
  FocusNode,
} from '../src/engine/FocusEngine';

describe('FocusEngine - Cartesian Spatial Navigation for Vega TV', () => {
  const nodeCenter: FocusNode = {
    id: 'center',
    rect: { x: 500, y: 500, width: 200, height: 100 },
  };

  const nodeAbove: FocusNode = {
    id: 'above',
    rect: { x: 500, y: 200, width: 200, height: 100 },
  };

  const nodeBelow: FocusNode = {
    id: 'below',
    rect: { x: 500, y: 800, width: 200, height: 100 },
  };

  const nodeRight: FocusNode = {
    id: 'right',
    rect: { x: 800, y: 500, width: 200, height: 100 },
  };

  const nodeLeft: FocusNode = {
    id: 'left',
    rect: { x: 200, y: 500, width: 200, height: 100 },
  };

  const nodes = [nodeCenter, nodeAbove, nodeBelow, nodeRight, nodeLeft];

  it('should correctly select the above node when navigating UP', () => {
    const next = findNextFocusTarget('center', nodes, 'up');
    expect(next).toBe('above');
  });

  it('should correctly select the below node when navigating DOWN', () => {
    const next = findNextFocusTarget('center', nodes, 'down');
    expect(next).toBe('below');
  });

  it('should correctly select the right node when navigating RIGHT', () => {
    const next = findNextFocusTarget('center', nodes, 'right');
    expect(next).toBe('right');
  });

  it('should correctly select the left node when navigating LEFT', () => {
    const next = findNextFocusTarget('center', nodes, 'left');
    expect(next).toBe('left');
  });

  it('should return Infinity if candidate is in opposing direction', () => {
    // nodeBelow is below nodeCenter, so distance looking 'up' must be Infinity
    const dist = calculateSpatialDistance(nodeCenter.rect, nodeBelow.rect, 'up');
    expect(dist).toBe(Infinity);
  });
});
