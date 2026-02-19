# Fluid Art Simulator (유체 예술 시뮬레이터)

A realistic and interactive fluid art simulation running in the browser using HTML5 Canvas and JavaScript. It implements a grid-based Navier-Stokes solver to simulate fluid dynamics, allowing users to paint, mix colors, and interact with the fluid in real-time.

## Features

- **Physics Engine**: Real-time fluid dynamics simulation (Navier-Stokes) handling velocity, diffusion, and advection.
- **Realistic Rendering**: RGB density field rendering for color mixing.
- **Interactive Tools**:
  - **Brush**: Add colored fluid to the canvas.
  - **Eraser**: Remove fluid density.
  - **Mouse Interaction**: Drag to apply force and add fluid.
- **Customizable Parameters**:
  - **Resolution**: Adjust simulation grid size (64x64, 128x128, 256x256).
  - **Viscosity**: Control how thick the fluid feels.
  - **Diffusion**: Control how fast colors spread.
  - **Brush Size**: Adjust the radius of the tool.
  - **Color**: Pick any color to paint with.
- **Controls**:
  - **Reset**: Clear the canvas and reset velocity.
  - **Pause/Resume**: Stop or start the simulation.
  - **Export**: Save your artwork as a PNG image.

## Demo

To run the project locally, follow these steps:

1.  **Clone the repository** (if applicable) or download the source code.
2.  **Open `index.html`** in a modern web browser (Chrome, Firefox, Safari, Edge).
    *   No build step is required as it uses native ES modules.
    *   *Note: Some browsers might block ES modules when opening `file://` directly due to CORS policy. If so, use a simple local server.*

### Running with a Local Server (Recommended)

If you have Python installed:

```bash
python3 -m http.server
```

Then open `http://localhost:8000` in your browser.

### Usage Instructions

1.  **Painting**: Click and drag on the black canvas to add color and push the fluid.
2.  **Changing Color**: Use the color picker in the UI panel to select a new color.
3.  **Adjusting Physics**:
    *   Increase **Viscosity** to make the fluid flow slower and stickier.
    *   Increase **Diffusion** to make colors blend and spread faster.
4.  **Tools**: Switch between "Brush" and "Eraser" to add or remove fluid.
5.  **Exporting**: Click "Export PNG" to download a snapshot of your current canvas.

## Technical Details

- **Language**: Vanilla JavaScript (ES6+)
- **Rendering**: HTML5 Canvas API (2D Context)
- **Simulation**: Grid-based Stable Fluids (Jos Stam's method)
- **Architecture**: Modular design with separate classes for `Fluid` (physics), `Renderer` (visualization), `Interaction` (input), and `UI` (controls).

## Structure

- `index.html`: Main entry point.
- `style.css`: Styling.
- `src/main.js`: Application logic and loop.
- `src/fluid.js`: Physics engine implementation.
- `src/renderer.js`: Canvas rendering logic.
- `src/interaction.js`: Mouse/Touch handling.
- `src/ui.js`: User Interface management.
