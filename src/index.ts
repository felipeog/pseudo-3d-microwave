import "./index.css";
import Zdog from "zdog";
import GUI from "lil-gui";

// ==============================================================================
// constants
// ==============================================================================

const WIDTH = 200;
const HEIGHT = 100;
const DEPTH = 100;
const STROKE = 10;
const CONTROL_WIDTH = WIDTH * (1 / 5);
const DOOR_WIDTH = WIDTH - CONTROL_WIDTH;
const MAX_ZOOM = 2;
const COLOR = {
  outsideLight: "#ffffff",
  outsideDark: "#dddddf",
  insideLightest: "#cccccf",
  insideLight: "#bbbbbf",
  insideDark: "#99999f",
  darkDetails: "#00000f",
};

// ==============================================================================
// state
// ==============================================================================

const gui = new GUI({ title: "pseudo 3d microwave" });

const state = {
  // non-gui
  isDragging: false,
  lastStart: Date.now(),
  illustrationRotation: {
    current: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
  },
  doorRotation: {
    current: 0.25,
    target: 0.25,
  },
  zoom: {
    current: 0.5,
    target: 0.5,
  },
  durationInMs: 10_000,

  // gui
  isSpinning: true,
  stagedDoorRotation: 0.25,
  stagedZoom: 0.5,
  stagedDurationInMs: 10_000,
  reset() {
    state.lastStart = Date.now();

    state.illustrationRotation.current.x = 0;
    state.illustrationRotation.current.y = 0;
    state.illustrationRotation.target.x = 0;
    state.illustrationRotation.target.y = 0;

    state.doorRotation.current = 0.25;
    state.doorRotation.target = 0.25;

    state.zoom.current = 0.5;
    state.zoom.target = 0.5;

    state.durationInMs = 10_000;
    state.isSpinning = true;
    state.stagedDoorRotation = 0.25;
    state.stagedZoom = 0.5;
    state.stagedDurationInMs = 10_000;
  },
};

gui
  .add(state, "isSpinning")
  .name("spin")
  .listen()
  .onChange(() => {
    if (!state.isSpinning) return;

    const angle = state.illustrationRotation.target.y;
    const newMs = Date.now() - (angle / (2 * Math.PI)) * state.durationInMs;

    state.lastStart = newMs;
  });
gui
  .add(state, "stagedDoorRotation")
  .name("door rotation (%)")
  .listen()
  .onFinishChange((value: number) => {
    state.doorRotation.target = value;
  })
  .min(0)
  .max(1)
  .step(0.01);
gui
  .add(state, "stagedZoom")
  .name("zoom")
  .listen()
  .onFinishChange((value: number) => {
    state.zoom.target = value;
  })
  .min(0.1)
  .max(1)
  .step(0.01);
gui
  .add(state, "stagedDurationInMs")
  .name("duration (ms)")
  .listen()
  .onFinishChange((value: number) => {
    const angle = state.illustrationRotation.target.y;
    const oldMs = (angle / (2 * Math.PI)) * state.durationInMs;
    const newMs = Date.now() - (oldMs / state.durationInMs) * value;

    state.durationInMs = value;
    state.lastStart = newMs;
  })
  .min(1_000)
  .max(30_000)
  .step(1_000);
gui.add(state, "reset").name("reset");

// ==============================================================================
// illustration
// ==============================================================================

const illo = new Zdog.Illustration({
  element: "#zdog-canvas",
  dragRotate: true,
  onDragStart() {
    state.isDragging = true;
  },
  onDragMove() {
    state.isDragging = true;
    state.illustrationRotation.target = { x: illo.rotate.x, y: illo.rotate.y };
  },
  onDragEnd() {
    state.isDragging = false;

    const angle = state.illustrationRotation.target.y;
    const newMs = Date.now() - (angle / (2 * Math.PI)) * state.durationInMs;

    state.lastStart = newMs;
  },
});

// back panel
new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  addTo: illo,
  width: WIDTH,
  height: HEIGHT,
  color: COLOR.insideLight,
  backface: COLOR.outsideDark,
  translate: { z: -1 * DEPTH * (1 / 2) },
});

// bottom panel
new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  addTo: illo,
  width: WIDTH,
  height: HEIGHT,
  color: COLOR.insideLightest,
  backface: COLOR.outsideDark,
  translate: { y: DEPTH * (1 / 2) },
  rotate: { x: Math.PI * (1 / 2) },
});

// top panel
new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  addTo: illo,
  width: WIDTH,
  height: HEIGHT,
  color: COLOR.outsideLight,
  backface: COLOR.insideDark,
  translate: { y: -1 * DEPTH * (1 / 2) },
  rotate: { x: Math.PI * (1 / 2) },
});

// left panel
new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  addTo: illo,
  width: DEPTH,
  height: HEIGHT,
  color: COLOR.outsideLight,
  backface: COLOR.insideDark,
  translate: { x: -1 * WIDTH * (1 / 2) },
  rotate: { y: Math.PI * (1 / 2) },
});

// right panel
new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  addTo: illo,
  width: DEPTH,
  height: HEIGHT,
  color: COLOR.insideLight,
  backface: COLOR.outsideDark,
  translate: { x: WIDTH * (1 / 2) },
  rotate: { y: Math.PI * (1 / 2) },
});

// control panel
const controlPanelGroup = new Zdog.Group({
  addTo: illo,
  translate: { x: (WIDTH - CONTROL_WIDTH) * (1 / 2), z: DEPTH * (1 / 2) },
});
new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  addTo: controlPanelGroup,
  width: CONTROL_WIDTH,
  height: HEIGHT,
  color: COLOR.outsideLight,
  backface: false,
});

// control buttons
new Zdog.Ellipse({
  addTo: controlPanelGroup,
  diameter: 10,
  stroke: 10,
  color: COLOR.darkDetails,
  translate: { y: -1 * HEIGHT * (1 / 5), z: 5 },
});
new Zdog.Ellipse({
  addTo: controlPanelGroup,
  diameter: 10,
  stroke: 10,
  color: COLOR.darkDetails,
  translate: { y: HEIGHT * (1 / 5), z: 5 },
});

// door panel
const doorPanelGroup = new Zdog.Group({
  addTo: illo,
  translate: { x: -1 * WIDTH * (1 / 2), z: DEPTH * (1 / 2) },
  rotate: { y: Math.PI * (1 / 6) },
});
new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  addTo: doorPanelGroup,
  width: DOOR_WIDTH,
  height: HEIGHT,
  translate: { x: DOOR_WIDTH * (1 / 2) },
  color: COLOR.outsideLight,
  backface: COLOR.insideLightest,
});

// door glass
new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  backface: false,
  color: COLOR.darkDetails,
  addTo: doorPanelGroup,
  width: DOOR_WIDTH - 40,
  height: HEIGHT - 40,
  translate: { x: DOOR_WIDTH * (1 / 2), z: 2 },
});

// ==============================================================================
// animation
// ==============================================================================

function animate() {
  // illustration rotation
  if (state.isSpinning && !state.isDragging) {
    const currentMilliseconds = Date.now() - state.lastStart;
    const animationProgress = currentMilliseconds / state.durationInMs;
    const angle = animationProgress * 2 * Math.PI;

    state.illustrationRotation.target = {
      x: Math.sin(angle),
      y: angle,
    };
  }

  const illustrationDistance = {
    x:
      state.illustrationRotation.target.x -
      state.illustrationRotation.current.x,
    y:
      state.illustrationRotation.target.y -
      state.illustrationRotation.current.y,
  };

  state.illustrationRotation.current = {
    x: state.illustrationRotation.current.x + illustrationDistance.x * 0.1,
    y: state.illustrationRotation.current.y + illustrationDistance.y * 0.1,
  };
  illo.rotate.x = state.illustrationRotation.current.x;
  illo.rotate.y = state.illustrationRotation.current.y;

  // illustration zoom
  const zoomDistance = state.zoom.target - state.zoom.current;

  state.zoom.current = state.zoom.current + zoomDistance * 0.1;
  illo.zoom = state.zoom.current * MAX_ZOOM;

  // door rotation
  const doorDistance = state.doorRotation.target - state.doorRotation.current;

  state.doorRotation.current = state.doorRotation.current + doorDistance * 0.1;
  doorPanelGroup.rotate.y = state.doorRotation.current * (Math.PI * (1 / 2));

  // render
  illo.updateRenderGraph();
  requestAnimationFrame(animate);
}

// ==============================================================================
// listeners
// ==============================================================================

window.addEventListener("load", () => {
  requestAnimationFrame(animate);
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;

  const angle = state.illustrationRotation.target.y;
  const newMs = Date.now() - (angle / (2 * Math.PI)) * state.durationInMs;

  state.lastStart = newMs;
});
