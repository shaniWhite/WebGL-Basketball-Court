
import {OrbitControls} from './OrbitControls.js'

// initialize the 3D scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// render setup 
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set background color to black
scene.background = new THREE.Color(0x000000);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Create basketball court
function createBasketballCourt() {
  // Court floor - just a simple brown surface
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xc68642,  // Brown wood color
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);
  
  // Note: All court lines, hoops, and other elements have been removed
  // Students will need to implement these features
}
function addCenterLine() {
  const points = [
    new THREE.Vector3(0, 0.11, -7.5),  // slightly above court to avoid z-fighting
    new THREE.Vector3(0, 0.11, 7.5)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  const centerLine = new THREE.Line(geometry, material);
  scene.add(centerLine);
}

function addCenterCircle(radius = 2, segments = 64) {
  const points = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    points.push(new THREE.Vector3(x, 0.11, z));  // Y = 0.11 to sit above court
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  const circle = new THREE.LineLoop(geometry, material);
  scene.add(circle);
}

// function addThreePointArc(centerZ, radius = 6.75, flip = false, segments = 64) {
//   const points = [];
//   const startAngle = Math.PI / 2;       // 90 deg
//   const endAngle = (3 * Math.PI) / 2;   // 270 deg

//   for (let i = 0; i <= segments; i++) {
//     const t = i / segments;
//     const angle = startAngle + (endAngle - startAngle) * t;

//     const x = Math.cos(angle) * radius;
//     const zOffset = Math.sin(angle) * radius;

//     const z = flip ? centerZ + zOffset : centerZ - zOffset;
//     points.push(new THREE.Vector3(x, 0.11, z));
//   }

//   const geometry = new THREE.BufferGeometry().setFromPoints(points);
//   const material = new THREE.LineBasicMaterial({ color: 0xffffff });
//   const arc = new THREE.Line(geometry, material);
//   scene.add(arc);
// }

function addThreePointArc(centerZ, centerX = 0, radius = 6.75, flip = false, segments = 64) {
  const points = [];
  const startAngle = Math.PI / 2;
  const endAngle = (3 * Math.PI) / 2;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = startAngle + (endAngle - startAngle) * t;

    const xOffset = Math.cos(angle) * radius;
    const zOffset = Math.sin(angle) * radius;

    const z = centerZ + zOffset;  // keep Z centered or offset normally
    const x = flip ? centerX - xOffset : centerX + xOffset;  // flip X side


    points.push(new THREE.Vector3(x, 0.11, z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  const arc = new THREE.Line(geometry, material);
  scene.add(arc);
}

function createRim(x, z) {
  const rimRadius = 0.45;  // standard rim radius
  const rimTube = 0.05;    // thickness
  const rimHeight = 3.05;  // 10 feet

  const geometry = new THREE.TorusGeometry(rimRadius, rimTube, 16, 100);
  const material = new THREE.MeshStandardMaterial({ color: 0xff6600 });
  const rim = new THREE.Mesh(geometry, material);

  rim.position.set(x, rimHeight, z);
  rim.rotation.x = Math.PI / 2;  // rotate to face forward
  rim.castShadow = true;

  scene.add(rim);
}

// function createBackboard(x, z, isLeftSide = true) {
//   const boardWidth = 1.8;
//   const boardHeight = 1.05;
//   const boardDepth = 0.05;
//   const boardY = 3.35;
//   const backOffset = 0.5;

//   const geometry = new THREE.BoxGeometry(boardWidth, boardHeight, boardDepth);
//   const material = new THREE.MeshStandardMaterial({
//     color: 0xffffff,
//     transparent: true,
//     opacity: 0.5
//   });

//   const backboard = new THREE.Mesh(geometry, material);

//   const adjustedX = isLeftSide ? x - backOffset : x + backOffset;
//   backboard.position.set(adjustedX, boardY, z);

//   // 🛠 Rotate it to face center
//   backboard.rotation.y = isLeftSide ? Math.PI / 2 : -Math.PI / 2;

//   backboard.castShadow = true;
//   scene.add(backboard);
// }

function createBackboard(x, z) {
  const boardWidth = 1.8;
  const boardHeight = 1.05;
  const boardDepth = 0.05;
  const boardY = 3.35;
  const backOffset = 0.5;

  const geometry = new THREE.BoxGeometry(boardWidth, boardHeight, boardDepth);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
  });

  const backboard = new THREE.Mesh(geometry, material);

  // Automatically flip based on side of court
  const isLeftSide = x < 0;
  const adjustedX = isLeftSide ? x - backOffset : x + backOffset;

  backboard.position.set(adjustedX, boardY, z);
  backboard.rotation.y = isLeftSide ? Math.PI / 2 : -Math.PI / 2;

  backboard.castShadow = true;
  scene.add(backboard);
}

// Create all elements
createBasketballCourt();
addCenterLine();
addCenterCircle();
addThreePointArc(0, 15, 6, false);
addThreePointArc(0, -15, 6, true);

// Right side hoop
createRim(14, 0);        // X is near edge of court, Z = 0 for center
createBackboard(14, 0);

// Left side hoop
createRim(-14, 0);
createBackboard(-14, 0);


// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Instructions display
const instructionsElement = document.createElement('div');
instructionsElement.style.position = 'absolute';
instructionsElement.style.bottom = '20px';
instructionsElement.style.left = '20px';
instructionsElement.style.color = 'white';
instructionsElement.style.fontSize = '16px';
instructionsElement.style.fontFamily = 'Arial, sans-serif';
instructionsElement.style.textAlign = 'left';
instructionsElement.innerHTML = `
  <h3>Controls:</h3>
  <p>O - Toggle orbit camera</p>
`;
document.body.appendChild(instructionsElement);

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation function - Loops at 60fps -Updates camera controls -Re-renders the scene

function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);
}

animate();