if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor() {}
    multiply() { return this; }
    translate() { return this; }
    scale() { return this; }
    rotate() { return this; }
    inverse() { return this; }
    transformPoint() { return { x: 0, y: 0, z: 0, w: 1 }; }
    toFloat32Array() { return new Float32Array(16); }
    toFloat64Array() { return new Float64Array(16); }
  };
}

if (typeof globalThis.DOMPoint === 'undefined') {
  globalThis.DOMPoint = class DOMPoint {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.x = x; this.y = y; this.z = z; this.w = w;
    }
  };
}
