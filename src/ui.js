export class UI {
    constructor(fluid, renderer, interaction) {
        this.fluid = fluid;
        this.renderer = renderer;
        this.interaction = interaction;

        this.resetBtn = document.getElementById('reset-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.toolBrush = document.getElementById('tool-brush');
        this.toolEraser = document.getElementById('tool-eraser');
        this.colorPicker = document.getElementById('color-picker');
        this.brushSize = document.getElementById('brush-size');
        this.viscosity = document.getElementById('viscosity');
        this.diffusion = document.getElementById('diffusion');
        this.exportBtn = document.getElementById('export-btn');
        this.undoBtn = document.getElementById('undo-btn');
        this.redoBtn = document.getElementById('redo-btn');
        this.recordBtn = document.getElementById('record-btn');

        this.isPaused = false;

        this.history = [];
        this.redoStack = [];
        this.maxHistory = 10;

        this.mediaRecorder = null;
        this.chunks = [];
    }

    init() {
        this.setupEventListeners();
        // Initialize values from DOM
        this.interaction.setColor(this.colorPicker.value);
        this.interaction.setBrushSize(this.brushSize.value);
        this.fluid.visc = parseFloat(this.viscosity.value);
        this.fluid.diff = parseFloat(this.diffusion.value);

        this.interaction.onStart = () => this.saveToHistory();
    }

    setFluid(fluid) {
        this.fluid = fluid;
        // Re-apply current settings to new fluid instance
        this.fluid.visc = parseFloat(this.viscosity.value);
        this.fluid.diff = parseFloat(this.diffusion.value);
        this.history = []; // Clear history on resolution change
        this.redoStack = [];
    }

    setRenderer(renderer) {
        this.renderer = renderer;
    }

    saveToHistory() {
        if (this.history.length >= this.maxHistory) {
            this.history.shift();
        }
        this.history.push(this.fluid.saveState());
        this.redoStack = []; // Clear redo stack on new action
    }

    setupEventListeners() {
        this.resetBtn.addEventListener('click', () => {
             this.saveToHistory(); // Save before reset
             this.fluid.densityR.fill(0);
             this.fluid.densityG.fill(0);
             this.fluid.densityB.fill(0);
             this.fluid.Vx.fill(0);
             this.fluid.Vy.fill(0);
             this.fluid.Vx0.fill(0);
             this.fluid.Vy0.fill(0);
        });

        this.pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        });

        this.toolBrush.addEventListener('click', () => {
            this.interaction.setTool('brush');
            this.toolBrush.classList.add('active');
            this.toolEraser.classList.remove('active');
        });

        this.toolEraser.addEventListener('click', () => {
            this.interaction.setTool('eraser');
            this.toolEraser.classList.add('active');
            this.toolBrush.classList.remove('active');
        });

        this.colorPicker.addEventListener('input', (e) => {
            this.interaction.setColor(e.target.value);
        });

        this.brushSize.addEventListener('input', (e) => {
            this.interaction.setBrushSize(e.target.value);
        });

        this.viscosity.addEventListener('input', (e) => {
            this.fluid.visc = parseFloat(e.target.value);
        });

        this.diffusion.addEventListener('input', (e) => {
            this.fluid.diff = parseFloat(e.target.value);
        });

        this.exportBtn.addEventListener('click', () => {
             const link = document.createElement('a');
             link.download = 'fluid-art.png';
             link.href = this.renderer.canvas.toDataURL();
             link.click();
        });

        this.undoBtn.addEventListener('click', () => {
             if (this.history.length > 0) {
                 const currentState = this.fluid.saveState();
                 this.redoStack.push(currentState);

                 const previousState = this.history.pop();
                 this.fluid.restoreState(previousState);
             }
        });

        this.redoBtn.addEventListener('click', () => {
             if (this.redoStack.length > 0) {
                 const currentState = this.fluid.saveState();
                 this.history.push(currentState);

                 const nextState = this.redoStack.pop();
                 this.fluid.restoreState(nextState);
             }
        });

        this.recordBtn.addEventListener('click', () => {
             if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                 this.stopRecording();
             } else {
                 this.startRecording();
             }
        });
    }

    startRecording() {
         const stream = this.renderer.canvas.captureStream(30);
         // Try to use webm, fallback if needed or let browser decide default
         let options = { mimeType: 'video/webm' };
         if (!MediaRecorder.isTypeSupported('video/webm')) {
             options = undefined; // Use default
         }

         try {
             this.mediaRecorder = new MediaRecorder(stream, options);
         } catch (e) {
             console.error("MediaRecorder error:", e);
             alert("Screen recording not supported in this browser.");
             return;
         }

         this.chunks = [];

         this.mediaRecorder.ondataavailable = (e) => {
             if (e.data.size > 0) {
                 this.chunks.push(e.data);
             }
         };

         this.mediaRecorder.onstop = (e) => {
             const blob = new Blob(this.chunks, { 'type' : 'video/webm' });
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = 'fluid-art.webm';
             a.click();
         };

         this.mediaRecorder.start();
         this.recordBtn.textContent = "Stop Recording";
         this.recordBtn.style.backgroundColor = "#ff4444";
    }

    stopRecording() {
        this.mediaRecorder.stop();
        this.recordBtn.textContent = "Start Recording";
        this.recordBtn.style.backgroundColor = "";
    }
}
