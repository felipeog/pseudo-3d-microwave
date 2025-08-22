import "./index.css";
import Zdog from "zdog";
import GUI from "lil-gui";

// ==============================================================================
// constants
// ==============================================================================

const DEFAULT = {
  WIDTH: 200,
  HEIGHT: 100,
  DEPTH: 100,
  STROKE: 10,
  ILLUSTRATION_ROTATION: 0,
  DOOR_ROTATION: 0.25,
  ZOOM: 0.5,
  DURATION_IN_MS: 10_000,
  IS_SPINNING: true,
  IS_REVERSE: false,
};

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
  fill: true,
  addTo: illo,
  color: COLOR.insideLight,
  backface: COLOR.outsideDark,
});

const bottomPanel = new Zdog.Rect({
  fill: true,
  addTo: illo,
  color: COLOR.insideLightest,
  backface: COLOR.outsideDark,
  rotate: { x: Math.PI * (1 / 2) },
});

const topPanel = new Zdog.Rect({
  fill: true,
  addTo: illo,
  color: COLOR.outsideLight,
  backface: COLOR.insideDark,
  rotate: { x: Math.PI * (1 / 2) },
});

const leftPanel = new Zdog.Rect({
  fill: true,
  addTo: illo,
  color: COLOR.outsideLight,
  backface: COLOR.insideDark,
  rotate: { y: Math.PI * (1 / 2) },
});

const rightPanel = new Zdog.Rect({
  fill: true,
  addTo: illo,
  color: COLOR.insideLight,
  backface: COLOR.outsideDark,
  rotate: { y: Math.PI * (1 / 2) },
});

const controlPanelGroup = new Zdog.Group({
  addTo: illo,
});

const controlPanel = new Zdog.Rect({
  fill: true,
  addTo: controlPanelGroup,
  color: COLOR.outsideLight,
  backface: false,
});

const buttonTop = new Zdog.Ellipse({
  addTo: controlPanelGroup,
  fill: true,
  color: COLOR.darkDetails,
});

const buttonBottom = new Zdog.Ellipse({
  addTo: controlPanelGroup,
  fill: true,
  color: COLOR.darkDetails,
});

const doorPanelGroup = new Zdog.Group({
  addTo: illo,
  rotate: { y: Math.PI * (1 / 6) },
});

const doorPanel = new Zdog.Rect({
  fill: true,
  addTo: doorPanelGroup,
  color: COLOR.outsideLight,
  backface: COLOR.insideLightest,
});

const doorGlass = new Zdog.Rect({
  fill: true,
  backface: false,
  color: COLOR.darkDetails,
  addTo: doorPanelGroup,
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
    current: {
      x: DEFAULT.ILLUSTRATION_ROTATION,
      y: DEFAULT.ILLUSTRATION_ROTATION,
    },
    target: {
      x: DEFAULT.ILLUSTRATION_ROTATION,
      y: DEFAULT.ILLUSTRATION_ROTATION,
    },
  },
  doorRotation: DEFAULT.DOOR_ROTATION,
  zoom: DEFAULT.ZOOM,
  durationInMs: DEFAULT.DURATION_IN_MS,

  // gui
  width: DEFAULT.WIDTH,
  height: DEFAULT.HEIGHT,
  depth: DEFAULT.DEPTH,
  stroke: DEFAULT.STROKE,
  isSpinning: DEFAULT.IS_SPINNING,
  isReverse: DEFAULT.IS_REVERSE,

  // functions
  reset() {
    state.lastStart = Date.now();

    state.illustrationRotation.current.x = DEFAULT.ILLUSTRATION_ROTATION;
    state.illustrationRotation.current.y = DEFAULT.ILLUSTRATION_ROTATION;
    state.illustrationRotation.target.x = DEFAULT.ILLUSTRATION_ROTATION;
    state.illustrationRotation.target.y = DEFAULT.ILLUSTRATION_ROTATION;

    state.doorRotation = DEFAULT.DOOR_ROTATION;
    state.zoom = DEFAULT.ZOOM;
    state.durationInMs = DEFAULT.DURATION_IN_MS;
    state.width = DEFAULT.WIDTH;
    state.height = DEFAULT.HEIGHT;
    state.depth = DEFAULT.DEPTH;
    state.stroke = DEFAULT.STROKE;
    state.isSpinning = DEFAULT.IS_SPINNING;
    state.isReverse = DEFAULT.IS_REVERSE;

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
  .step(10);
gui
  .add(state, "height")
  .name("height")
  .listen()
  .onChange(resize)
  .min(100)
  .max(400)
  .step(10);
gui
  .add(state, "depth")
  .name("depth")
  .listen()
  .onChange(resize)
  .min(100)
  .max(400)
  .step(10);
gui
  .add(state, "stroke")
  .name("stroke")
  .listen()
  .onChange(resize)
  .min(0)
  .max(20)
  .step(1);
gui
  .add(state, "doorRotation")
  .name("door rotation")
  .listen()
  .min(0)
  .max(1)
  .step(0.01);
gui.add(state, "zoom").name("zoom").listen().min(0.1).max(1).step(0.01);
gui
  .add(state, "durationInMs")
  .name("duration (ms)")
  .listen()
  .onChange(updateLastStart)
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
  backPanel.translate.z = -1 * state.depth * (1 / 2);
  backPanel.updatePath();

  bottomPanel.stroke = state.stroke;
  bottomPanel.width = state.width;
  bottomPanel.height = state.depth;
  bottomPanel.translate.y = state.height * (1 / 2);
  bottomPanel.rotate.x = Math.PI * (1 / 2);
  bottomPanel.updatePath();

  topPanel.stroke = state.stroke;
  topPanel.width = state.width;
  topPanel.height = state.depth;
  topPanel.translate.y = -1 * state.height * (1 / 2);
  topPanel.rotate.x = Math.PI * (1 / 2);
  topPanel.updatePath();

  leftPanel.stroke = state.stroke;
  leftPanel.width = state.depth;
  leftPanel.height = state.height;
  leftPanel.translate.x = -1 * state.width * (1 / 2);
  leftPanel.rotate.y = Math.PI * (1 / 2);
  leftPanel.updatePath();

  rightPanel.stroke = state.stroke;
  rightPanel.width = state.depth;
  rightPanel.height = state.height;
  rightPanel.translate.x = state.width * (1 / 2);
  rightPanel.rotate.y = Math.PI * (1 / 2);
  rightPanel.updatePath();

  controlPanelGroup.translate.x = doorWidth * (1 / 2);
  controlPanelGroup.translate.z = state.depth * (1 / 2);

  controlPanel.stroke = state.stroke;
  controlPanel.width = controlWidth;
  controlPanel.height = controlHeight;
  controlPanel.updatePath();

  buttonTop.diameter = buttonDiameter;
  buttonTop.stroke = state.stroke;
  buttonTop.translate.y = -1 * controlHeight * (1 / 5);
  buttonTop.translate.z = buttonOffset;
  buttonTop.updatePath();

  buttonBottom.diameter = buttonDiameter;
  buttonBottom.stroke = state.stroke;
  buttonBottom.translate.y = controlHeight * (1 / 5);
  buttonBottom.translate.z = buttonOffset;
  buttonBottom.updatePath();

  doorPanelGroup.translate.x = -1 * state.width * (1 / 2);
  doorPanelGroup.translate.z = state.depth * (1 / 2);
  doorPanelGroup.rotate.y = Math.PI * (1 / 6);

  doorPanel.stroke = state.stroke;
  doorPanel.width = doorWidth;
  doorPanel.height = doorHeight;
  doorPanel.translate.x = doorWidth * (1 / 2);
  doorPanel.updatePath();

  doorGlass.stroke = state.stroke;
  doorGlass.width = glassWidth;
  doorGlass.height = glassHeight;
  doorGlass.translate.x = doorWidth * (1 / 2);
  doorGlass.translate.z = glassOffset;
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
  illo.zoom = state.zoom * MAX_ZOOM;

  // door rotation
  doorPanelGroup.rotate.y = state.doorRotation * (Math.PI * (1 / 2));

  // render
  illo.updateRenderGraph();
  requestAnimationFrame(animate);
}

// ==============================================================================
// listeners
// ==============================================================================

window.addEventListener("load", () => {
  resize();
  requestAnimationFrame(animate);
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;

  updateLastStart();
});
