export class Spring {
  pos: number;
  vel: number;
  target: number;
  private k: number;
  private d: number;
  private m: number;

  constructor(
    initial: number,
    stiffness = 160,
    damping = 22,
    mass = 0.6,
  ) {
    this.pos = initial;
    this.vel = 0;
    this.target = initial;
    this.k = stiffness;
    this.d = damping;
    this.m = mass;
  }

  step(dt: number): number {
    const a =
      (-this.k * (this.pos - this.target) - this.d * this.vel) / this.m;
    this.vel += a * dt;
    this.pos += this.vel * dt;
    return this.pos;
  }

  set(target: number): void {
    this.target = target;
  }
}