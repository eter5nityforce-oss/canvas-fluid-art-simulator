export class Interaction {
    constructor(canvas, fluid) {
        this.canvas = canvas;
        this.fluid = fluid;

        this.isDragging = false;
        this.prevX = 0;
        this.prevY = 0;

        this.currentColor = { r: 1, g: 0, b: 0 }; // default red
        this.currentTool = 'brush'; // 'brush' or 'eraser'
        this.brushSize = 5;

        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

        // Touch support
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), {passive: false});
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), {passive: false});
        this.canvas.addEventListener('touchend', this.handleMouseUp.bind(this));
    }

    setFluid(fluid) {
        this.fluid = fluid;
    }

    setColor(hex) {
        // Convert hex to rgb (0-1)
        const bigint = parseInt(hex.substring(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        this.currentColor = { r: r/255, g: g/255, b: b/255 };
    }

    setTool(tool) {
        this.currentTool = tool;
    }

    setBrushSize(size) {
        this.brushSize = parseInt(size);
    }

    handleMouseDown(e) {
        if (this.onStart) this.onStart();
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        this.prevX = e.clientX - rect.left;
        this.prevY = e.clientY - rect.top;
        this.applyInteraction(this.prevX, this.prevY, 0, 0);
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.handleMove(x, y);
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (this.onStart) this.onStart();
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        this.prevX = e.touches[0].clientX - rect.left;
        this.prevY = e.touches[0].clientY - rect.top;
        this.applyInteraction(this.prevX, this.prevY, 0, 0);
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isDragging) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        this.handleMove(x, y);
    }

    handleMove(x, y) {
        const dx = x - this.prevX;
        const dy = y - this.prevY;

        this.applyInteraction(x, y, dx, dy);

        this.prevX = x;
        this.prevY = y;
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    applyInteraction(x, y, dx, dy) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.fluid.size / rect.width;
        const scaleY = this.fluid.size / rect.height;

        const fluidX = Math.floor(x * scaleX);
        const fluidY = Math.floor(y * scaleY);

        if (fluidX < 0 || fluidX >= this.fluid.size || fluidY < 0 || fluidY >= this.fluid.size) return;

        // Apply Force (Velocity)
        // Add velocity to the center point
        const forceMult = 100; // Increased force multiplier
        this.fluid.addVelocity(fluidX, fluidY, dx * forceMult, dy * forceMult);

        // Also add velocity to neighbors for smoother feel? Maybe not needed.

        // Apply Density (Paint)
        const radius = Math.max(1, Math.floor(this.brushSize * scaleX)); // Adjust brush size to grid scale

        if (this.currentTool === 'brush') {
             for (let j = -radius; j <= radius; j++) {
                for (let i = -radius; i <= radius; i++) {
                    if (i*i + j*j <= radius * radius) {
                         const fx = fluidX + i;
                         const fy = fluidY + j;
                         if (fx >= 0 && fx < this.fluid.size && fy >= 0 && fy < this.fluid.size) {
                             const amount = 2.0; // Density amount
                             this.fluid.addDensity(fx, fy, this.currentColor.r * amount, this.currentColor.g * amount, this.currentColor.b * amount);
                         }
                    }
                }
             }
        } else if (this.currentTool === 'eraser') {
             for (let j = -radius; j <= radius; j++) {
                for (let i = -radius; i <= radius; i++) {
                    if (i*i + j*j <= radius * radius) {
                         const fx = fluidX + i;
                         const fy = fluidY + j;
                         if (fx >= 0 && fx < this.fluid.size && fy >= 0 && fy < this.fluid.size) {
                             const index = this.fluid.IX(fx, fy);
                             // Fade out
                             this.fluid.densityR[index] *= 0.5;
                             this.fluid.densityG[index] *= 0.5;
                             this.fluid.densityB[index] *= 0.5;
                         }
                    }
                }
             }
        }
    }
}
