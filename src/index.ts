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
const CONTROL_HEIGHT = HEIGHT;
const BUTTON_DIAMETER = CONTROL_WIDTH * (1 / 3);
const BUTTON_OFFSET = STROKE * (1 / 2);

const DOOR_WIDTH = WIDTH - CONTROL_WIDTH;
const DOOR_HEIGHT = HEIGHT;

const GLASS_WIDTH = DOOR_WIDTH * (3 / 4);
const GLASS_HEIGHT = HEIGHT * (2 / 3);
const GLASS_OFFSET = STROKE * (1 / 2);

const COLOR = {
  outsideLight: "#ffffff",
  outsideDark: "#dddddf",
  insideLightest: "#cccccf",
  insideLight: "#bbbbbf",
  insideDark: "#99999f",
  darkDetails: "#00000f",
};

const MAX_ZOOM = 2;

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

    updateLastStart();
  },
});

const backPanel = new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  addTo: illo,
  width: WIDTH,
  height: HEIGHT,
  color: COLOR.insideLight,
  backface: COLOR.outsideDark,
  translate: { z: -1 * DEPTH * (1 / 2) },
});

const bottomPanel = new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  addTo: illo,
  width: WIDTH,
  height: DEPTH,
  color: COLOR.insideLightest,
  backface: COLOR.outsideDark,
  translate: { y: HEIGHT * (1 / 2) },
  rotate: { x: Math.PI * (1 / 2) },
});

const topPanel = new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  addTo: illo,
  width: WIDTH,
  height: DEPTH,
  color: COLOR.outsideLight,
  backface: COLOR.insideDark,
  translate: { y: -1 * HEIGHT * (1 / 2) },
  rotate: { x: Math.PI * (1 / 2) },
});

const leftPanel = new Zdog.Rect({
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

const rightPanel = new Zdog.Rect({
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

const controlPanelGroup = new Zdog.Group({
  addTo: illo,
  translate: { x: DOOR_WIDTH * (1 / 2), z: DEPTH * (1 / 2) },
});

const controlPanel = new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  addTo: controlPanelGroup,
  width: CONTROL_WIDTH,
  height: CONTROL_HEIGHT,
  color: COLOR.outsideLight,
  backface: false,
});

const buttonTop = new Zdog.Ellipse({
  addTo: controlPanelGroup,
  diameter: BUTTON_DIAMETER,
  stroke: STROKE,
  fill: true,
  color: COLOR.darkDetails,
  translate: { y: -1 * CONTROL_HEIGHT * (1 / 5), z: BUTTON_OFFSET },
});

const buttonBottom = new Zdog.Ellipse({
  addTo: controlPanelGroup,
  diameter: BUTTON_DIAMETER,
  stroke: STROKE,
  fill: true,
  color: COLOR.darkDetails,
  translate: { y: CONTROL_HEIGHT * (1 / 5), z: BUTTON_OFFSET },
});

const doorPanelGroup = new Zdog.Group({
  addTo: illo,
  translate: { x: -1 * WIDTH * (1 / 2), z: DEPTH * (1 / 2) },
  rotate: { y: Math.PI * (1 / 6) },
});

const doorPanel = new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  addTo: doorPanelGroup,
  width: DOOR_WIDTH,
  height: DOOR_HEIGHT,
  translate: { x: DOOR_WIDTH * (1 / 2) },
  color: COLOR.outsideLight,
  backface: COLOR.insideLightest,
});

const doorGlass = new Zdog.Rect({
  stroke: STROKE,
  fill: true,
  backface: false,
  color: COLOR.darkDetails,
  addTo: doorPanelGroup,
  width: GLASS_WIDTH,
  height: GLASS_HEIGHT,
  translate: { x: DOOR_WIDTH * (1 / 2), z: GLASS_OFFSET },
});

// ==============================================================================
// state
// ==============================================================================

const gui = new GUI({ title: "Pseudo 3D Microwave" });

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
  width: 200,
  height: 100,
  depth: 100,
  stroke: 10,
  isSpinning: true,
  isReverse: false,
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
    state.width = 200;
    state.height = 100;
    state.depth = 100;
    state.stroke = 10;
    state.isSpinning = true;
    state.isReverse = false;

    state.stagedDoorRotation = 0.25;
    state.stagedZoom = 0.5;
    state.stagedDurationInMs = 10_000;

    resize();
  },
};

gui.add(state, "isSpinning").name("spin").listen().onChange(updateLastStart);
gui
  .add(state, "isReverse")
  .name("reverse spin")
  .listen()
  .onChange(updateLastStart);
gui
  .add(state, "width")
  .name("width")
  .listen()
  .onChange(resize)
  .min(100)
  .max(400)
  .step(50);
gui
  .add(state, "height")
  .name("height")
  .listen()
  .onChange(resize)
  .min(100)
  .max(400)
  .step(50);
gui
  .add(state, "depth")
  .name("depth")
  .listen()
  .onChange(resize)
  .min(100)
  .max(400)
  .step(50);
gui
  .add(state, "stroke")
  .name("stroke")
  .listen()
  .onChange(resize)
  .min(0)
  .max(20)
  .step(1);
gui
  .add(state, "stagedDoorRotation")
  .name("door rotation")
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
    const oldOffset = (angle / (2 * Math.PI)) * state.durationInMs;
    const newOffset = (oldOffset / state.durationInMs) * value;
    const direction = state.isReverse ? 1 : -1;
    const newMs = Date.now() + direction * newOffset;

    state.durationInMs = value;
    state.lastStart = newMs;
  })
  .min(1_000)
  .max(30_000)
  .step(1_000);
gui.add(state, "reset").name("reset");

function updateLastStart() {
  const angle = state.illustrationRotation.target.y;
  const offset = (angle / (2 * Math.PI)) * state.durationInMs;
  const direction = state.isReverse ? 1 : -1;
  const newMs = Date.now() + direction * offset;

  state.lastStart = newMs;
}

function resize() {
  const controlWidth = state.width * (1 / 5);
  const controlHeight = state.height;
  const buttonDiameter = controlWidth * (1 / 3);
  const buttonOffset = state.stroke * (1 / 2);

  const doorWidth = state.width - controlWidth;
  const doorHeight = state.height;

  const glassWidth = doorWidth * (3 / 4);
  const glassHeight = state.height * (2 / 3);
  const glassOffset = state.stroke * (1 / 2);

  backPanel.stroke = state.stroke;
  backPanel.width = state.width;
  backPanel.height = state.height;
  backPanel.translate.set({ z: -1 * state.depth * (1 / 2) });
  backPanel.updatePath();

  bottomPanel.stroke = state.stroke;
  bottomPanel.width = state.width;
  bottomPanel.height = state.depth;
  bottomPanel.translate.set({ y: state.height * (1 / 2) });
  bottomPanel.rotate.set({ x: Math.PI * (1 / 2) });
  bottomPanel.updatePath();

  topPanel.stroke = state.stroke;
  topPanel.width = state.width;
  topPanel.height = state.depth;
  topPanel.translate.set({ y: -1 * state.height * (1 / 2) });
  topPanel.rotate.set({ x: Math.PI * (1 / 2) });
  topPanel.updatePath();

  leftPanel.stroke = state.stroke;
  leftPanel.width = state.depth;
  leftPanel.height = state.height;
  leftPanel.translate.set({ x: -1 * state.width * (1 / 2) });
  leftPanel.rotate.set({ y: Math.PI * (1 / 2) });
  leftPanel.updatePath();

  rightPanel.stroke = state.stroke;
  rightPanel.width = state.depth;
  rightPanel.height = state.height;
  rightPanel.translate.set({ x: state.width * (1 / 2) });
  rightPanel.rotate.set({ y: Math.PI * (1 / 2) });
  rightPanel.updatePath();

  controlPanelGroup.translate.set({
    x: doorWidth * (1 / 2),
    z: state.depth * (1 / 2),
  });

  controlPanel.stroke = state.stroke;
  controlPanel.width = controlWidth;
  controlPanel.height = controlHeight;
  controlPanel.updatePath();

  buttonTop.diameter = buttonDiameter;
  buttonTop.stroke = state.stroke;
  buttonTop.translate.set({
    y: -1 * controlHeight * (1 / 5),
    z: buttonOffset,
  });
  buttonTop.updatePath();

  buttonBottom.diameter = buttonDiameter;
  buttonBottom.stroke = state.stroke;
  buttonBottom.translate.set({ y: controlHeight * (1 / 5), z: buttonOffset });
  buttonBottom.updatePath();

  doorPanelGroup.translate.set({
    x: -1 * state.width * (1 / 2),
    z: state.depth * (1 / 2),
  });
  doorPanelGroup.rotate.set({ y: Math.PI * (1 / 6) });

  doorPanel.stroke = state.stroke;
  doorPanel.width = doorWidth;
  doorPanel.height = doorHeight;
  doorPanel.translate.set({ x: doorWidth * (1 / 2) });
  doorPanel.updatePath();

  doorGlass.stroke = state.stroke;
  doorGlass.width = glassWidth;
  doorGlass.height = glassHeight;
  doorGlass.translate.set({ x: doorWidth * (1 / 2), z: glassOffset });
  doorGlass.updatePath();
}

// ==============================================================================
// animation
// ==============================================================================

function animate() {
  // illustration rotation
  if (state.isSpinning && !state.isDragging) {
    const currentMilliseconds = Date.now() - state.lastStart;
    const animationProgress = currentMilliseconds / state.durationInMs;
    const angle = animationProgress * 2 * Math.PI;
    const direction = state.isReverse ? -1 : 1;

    state.illustrationRotation.target.x = direction * Math.sin(angle);
    state.illustrationRotation.target.y = direction * angle;
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

  updateLastStart();
});
