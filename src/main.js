// src/main.js
import { Fluid } from './fluid.js';
import { Renderer } from './renderer.js';
import { Interaction } from './interaction.js';
import { UI } from './ui.js';

let fluid;
let renderer;
let interaction;
let ui;
let canvas;

function init() {
    canvas = document.getElementById('canvas');
    const resolutionSelect = document.getElementById('resolution');

    // Set initial size
    let N = parseInt(resolutionSelect.value) || 128;
    canvas.width = N;
    canvas.height = N;

    // Initialize components
    fluid = new Fluid(N);
    renderer = new Renderer(canvas, fluid);
    interaction = new Interaction(canvas, fluid);
    ui = new UI(fluid, renderer, interaction);

    ui.init();

    resolutionSelect.addEventListener('change', (e) => {
        N = parseInt(e.target.value);
        canvas.width = N;
        canvas.height = N;
        fluid = new Fluid(N);
        renderer = new Renderer(canvas, fluid);
        interaction.setFluid(fluid);
        ui.setFluid(fluid);
        ui.setRenderer(renderer);
    });

    requestAnimationFrame(update);
}

function update(time) {
    if (ui && !ui.isPaused) {
        fluid.step();
        renderer.render();
    }
    requestAnimationFrame(update);
}

document.addEventListener('DOMContentLoaded', init);
