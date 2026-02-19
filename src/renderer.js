export class Renderer {
    constructor(canvas, fluid) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.fluid = fluid;
        this.imageData = this.ctx.createImageData(canvas.width, canvas.height);
    }

    render() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const data = this.imageData.data;

        // Ensure we don't go out of bounds if fluid size mismatches canvas size
        const limit = Math.min(width * height, this.fluid.size * this.fluid.size);

        for (let i = 0; i < limit; i++) {
            const r = this.fluid.densityR[i];
            const g = this.fluid.densityG[i];
            const b = this.fluid.densityB[i];

            const index = i * 4;

            data[index] = Math.min(255, r * 255);
            data[index + 1] = Math.min(255, g * 255);
            data[index + 2] = Math.min(255, b * 255);
            data[index + 3] = 255; // Alpha
        }

        this.ctx.putImageData(this.imageData, 0, 0);
    }
}
