export class Fluid {
    constructor(size, diffusion, viscosity, dt) {
        this.size = size;
        this.dt = dt || 0.1;
        this.diff = diffusion || 0;
        this.visc = viscosity || 0;

        this.s = new Float32Array(size * size);
        this.densityR = new Float32Array(size * size);
        this.densityG = new Float32Array(size * size);
        this.densityB = new Float32Array(size * size);

        this.Vx = new Float32Array(size * size);
        this.Vy = new Float32Array(size * size);

        this.Vx0 = new Float32Array(size * size);
        this.Vy0 = new Float32Array(size * size);
    }

    addDensity(x, y, r, g, b) {
        const index = this.IX(x, y);
        this.densityR[index] += r;
        this.densityG[index] += g;
        this.densityB[index] += b;
    }

    addVelocity(x, y, amountX, amountY) {
        const index = this.IX(x, y);
        this.Vx[index] += amountX;
        this.Vy[index] += amountY;
    }

    step() {
        const N = this.size;
        const visc = this.visc;
        const diff = this.diff;
        const dt = this.dt;
        const Vx = this.Vx;
        const Vy = this.Vy;
        const Vx0 = this.Vx0;
        const Vy0 = this.Vy0;
        const s = this.s;

        this.diffuse(1, Vx0, Vx, visc, dt);
        this.diffuse(2, Vy0, Vy, visc, dt);

        this.project(Vx0, Vy0, Vx, Vy);

        this.advect(1, Vx, Vx0, Vx0, Vy0, dt);
        this.advect(2, Vy, Vy0, Vx0, Vy0, dt);

        this.project(Vx, Vy, Vx0, Vy0);

        // Diffuse and Advect R
        this.diffuse(0, s, this.densityR, diff, dt);
        this.advect(0, this.densityR, s, Vx, Vy, dt);

        // Diffuse and Advect G
        this.diffuse(0, s, this.densityG, diff, dt);
        this.advect(0, this.densityG, s, Vx, Vy, dt);

        // Diffuse and Advect B
        this.diffuse(0, s, this.densityB, diff, dt);
        this.advect(0, this.densityB, s, Vx, Vy, dt);
    }

    IX(x, y) {
        return Math.max(0, Math.min(this.size * this.size - 1, x + y * this.size));
    }

    diffuse(b, x, x0, diff, dt) {
        const a = dt * diff * (this.size - 2) * (this.size - 2);
        this.lin_solve(b, x, x0, a, 1 + 6 * a);
    }

    lin_solve(b, x, x0, a, c) {
        const N = this.size;
        const iter = 4;

        for (let k = 0; k < iter; k++) {
            for (let j = 1; j < N - 1; j++) {
                for (let i = 1; i < N - 1; i++) {
                    x[this.IX(i, j)] =
                        (x0[this.IX(i, j)] +
                            a *
                                (x[this.IX(i + 1, j)] +
                                    x[this.IX(i - 1, j)] +
                                    x[this.IX(i, j + 1)] +
                                    x[this.IX(i, j - 1)])) /
                        c;
                }
            }
            this.set_bnd(b, x);
        }
    }

    project(velocX, velocY, p, div) {
        const N = this.size;

        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                div[this.IX(i, j)] =
                    (-0.5 *
                        (velocX[this.IX(i + 1, j)] -
                            velocX[this.IX(i - 1, j)] +
                            velocY[this.IX(i, j + 1)] -
                            velocY[this.IX(i, j - 1)])) /
                    N;
                p[this.IX(i, j)] = 0;
            }
        }

        this.set_bnd(0, div);
        this.set_bnd(0, p);
        this.lin_solve(0, p, div, 1, 4);

        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                velocX[this.IX(i, j)] -= 0.5 * N * (p[this.IX(i + 1, j)] - p[this.IX(i - 1, j)]);
                velocY[this.IX(i, j)] -= 0.5 * N * (p[this.IX(i, j + 1)] - p[this.IX(i, j - 1)]);
            }
        }

        this.set_bnd(1, velocX);
        this.set_bnd(2, velocY);
    }

    advect(b, d, d0, velocX, velocY, dt) {
        const N = this.size;
        let i0, i1, j0, j1;
        let x, y, s0, t0, s1, t1, dt0;

        dt0 = dt * (N - 2);

        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                x = i - dt0 * velocX[this.IX(i, j)];
                y = j - dt0 * velocY[this.IX(i, j)];

                if (x < 0.5) x = 0.5;
                if (x > N + 0.5) x = N + 0.5;
                i0 = Math.floor(x);
                i1 = i0 + 1;

                if (y < 0.5) y = 0.5;
                if (y > N + 0.5) y = N + 0.5;
                j0 = Math.floor(y);
                j1 = j0 + 1;

                s1 = x - i0;
                s0 = 1.0 - s1;
                t1 = y - j0;
                t0 = 1.0 - t1;

                d[this.IX(i, j)] =
                    s0 * (t0 * d0[this.IX(i0, j0)] + t1 * d0[this.IX(i0, j1)]) +
                    s1 * (t0 * d0[this.IX(i1, j0)] + t1 * d0[this.IX(i1, j1)]);
            }
        }

        this.set_bnd(b, d);
    }

    set_bnd(b, x) {
        const N = this.size;
        for (let i = 1; i < N - 1; i++) {
            x[this.IX(i, 0)] = b == 2 ? -x[this.IX(i, 1)] : x[this.IX(i, 1)];
            x[this.IX(i, N - 1)] = b == 2 ? -x[this.IX(i, N - 2)] : x[this.IX(i, N - 2)];
        }
        for (let j = 1; j < N - 1; j++) {
            x[this.IX(0, j)] = b == 1 ? -x[this.IX(1, j)] : x[this.IX(1, j)];
            x[this.IX(N - 1, j)] = b == 1 ? -x[this.IX(N - 2, j)] : x[this.IX(N - 2, j)];
        }

        x[this.IX(0, 0)] = 0.5 * (x[this.IX(1, 0)] + x[this.IX(0, 1)]);
        x[this.IX(0, N - 1)] = 0.5 * (x[this.IX(1, N - 1)] + x[this.IX(0, N - 2)]);
        x[this.IX(N - 1, 0)] = 0.5 * (x[this.IX(N - 2, 0)] + x[this.IX(N - 1, 1)]);
        x[this.IX(N - 1, N - 1)] = 0.5 * (x[this.IX(N - 2, N - 1)] + x[this.IX(N - 1, N - 2)]);
    }

    saveState() {
        return {
            s: new Float32Array(this.s),
            densityR: new Float32Array(this.densityR),
            densityG: new Float32Array(this.densityG),
            densityB: new Float32Array(this.densityB),
            Vx: new Float32Array(this.Vx),
            Vy: new Float32Array(this.Vy),
            Vx0: new Float32Array(this.Vx0),
            Vy0: new Float32Array(this.Vy0)
        };
    }

    restoreState(state) {
        this.s.set(state.s);
        this.densityR.set(state.densityR);
        this.densityG.set(state.densityG);
        this.densityB.set(state.densityB);
        this.Vx.set(state.Vx);
        this.Vy.set(state.Vy);
        this.Vx0.set(state.Vx0);
        this.Vy0.set(state.Vy0);
    }
}
