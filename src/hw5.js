
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

function createHoopSupport(x, z) {
  const isLeftSide = x < 0;

  // Main vertical pole
  const poleHeight = 3.0;
  const poleWidth = 0.2;
  const poleOffset = isLeftSide ? -1.2 : 1.2;
  const poleX = x + poleOffset;
  const poleY = poleHeight / 2;

  // Bottom padded base
  const baseGeometry = new THREE.BoxGeometry(0.3, 1.2, 0.3);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.set(poleX, 0.6, z);
  scene.add(base);


  const poleGeometry = new THREE.BoxGeometry(poleWidth, poleHeight, poleWidth);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(poleX, poleY, z);
  pole.castShadow = true;
  scene.add(pole);

  // Diagonal support arm
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
  const armRadius = 0.04;
  const armLength = 0.8;  

  //(top of pole)
  const start = new THREE.Vector3(poleX, poleHeight, z);
  const target = new THREE.Vector3(x, 3.05, z);
  const direction = new THREE.Vector3().subVectors(target, start).normalize();

  const end = new THREE.Vector3().addVectors(start, direction.clone().multiplyScalar(armLength));

  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

  // Create arm 
  const armGeometry = new THREE.CylinderGeometry(armRadius, armRadius, armLength, 16);
  const arm = new THREE.Mesh(armGeometry, armMaterial);
  arm.position.copy(mid);

  const up = new THREE.Vector3(0, 1, 0);
  const axis = up.clone().cross(direction).normalize();
  const angle = Math.acos(up.clone().dot(direction));
  arm.quaternion.setFromAxisAngle(axis, angle);

  scene.add(arm);
}

function addNet(x, y, z, radius = 0.45, segments = 12, depth = 0.7,taper = 0.6) {
  const netMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const netGeometry = new THREE.BufferGeometry();
  const netPoints = [];

  const rings = 3; // number of horizontal loops
  const verticals = []; 

  // vertical strands
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;

    const x0 = x + Math.cos(angle) * radius;
    const z0 = z + Math.sin(angle) * radius;
    
    const x1 = x + Math.cos(angle) * (radius * taper);  // inward taper
    const z1 = z + Math.sin(angle) * (radius * taper);
    const y1 = y - depth;

    netPoints.push(new THREE.Vector3(x0, y, z0));      // rim point
    netPoints.push(new THREE.Vector3(x1, y1, z1));     // tapered end
    verticals.push({ top: new THREE.Vector3(x0, y, z0), bottom: new THREE.Vector3(x1, y1, z1) });
  }

  // Horizontal loops (between vertical lines)
  for (let r = 1; r <= rings; r++) {
    const t = r / (rings + 1);
    const loopPoints = [];

    for (let i = 0; i < segments; i++) {
      const a = verticals[i].top;
      const b = verticals[i].bottom;

      const p = new THREE.Vector3().lerpVectors(a, b, t);
      loopPoints.push(p);
    }

    // connect points in a ring
    for (let i = 0; i < segments; i++) {
      const current = loopPoints[i];
      const next = loopPoints[(i + 1) % segments];

      netPoints.push(current);
      netPoints.push(next);
    }
  }

  netGeometry.setFromPoints(netPoints);
  const net = new THREE.LineSegments(netGeometry, netMaterial);
  scene.add(net);
}

function createBasketball() {
  const ballRadius = 0.7;
  const segments = 32;

  const ballGeometry = new THREE.SphereGeometry(ballRadius, segments, segments);
  const ballMaterial = new THREE.MeshStandardMaterial({
    color: 0xff8c00,
    metalness: 0.2,
    roughness: 0.6
  });

  const ball = new THREE.Mesh(ballGeometry, ballMaterial);
  ball.position.set(0, ballRadius*2 + 0.01, 0);  // center court
  ball.castShadow = true;
  scene.add(ball);

  addSeamLines(ball.position, ballRadius);
}


function addSeamLines(center, radius) {
  const seamMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  const segments = 100;

  const horizontalPoints = [];
  const verticalPoints = [];
  const diagonal1Points = [];
  const diagonal2Points = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;

    // Horizontal ring (XZ plane)
    horizontalPoints.push(new THREE.Vector3(
      center.x + Math.cos(angle) * radius,
      center.y,
      center.z + Math.sin(angle) * radius
    ));

    // Vertical ring (YZ plane)
    verticalPoints.push(new THREE.Vector3(
      center.x,
      center.y + Math.cos(angle) * radius,
      center.z + Math.sin(angle) * radius
    ));

    // Diagonal ring 1 (front-to-back curve, wrapping diagonally)
    diagonal1Points.push(new THREE.Vector3(
      center.x + Math.sin(angle) * radius ,
      center.y + Math.cos(angle) * radius*0.2,
      center.z + Math.cos(angle) * radius 
    ));

    diagonal2Points.push(new THREE.Vector3(
      center.x - Math.sin(angle) * radius * 0.8,
      center.y + Math.cos(angle) * radius*0.2 ,
      center.z - Math.cos(angle) * radius * 0.8
    ));

  }

  const line = (points) =>
    new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), seamMaterial);

  scene.add(line(horizontalPoints));  // equator
  scene.add(line(verticalPoints));    // vertical ring
  scene.add(line(diagonal1Points));   // side seam 1 ✅
  scene.add(line(diagonal2Points));   // side seam 2 ✅
}



// Create all elements
createBasketballCourt();
addCenterLine();
addCenterCircle();
//right arc
addThreePointArc(0, 15, 6, false);
//left arc
addThreePointArc(0, -15, 6, true);
//right rim and backboard
createRim(14, 0);   
createBackboard(14, 0);
//left rim and backboard
createRim(-14, 0);
createBackboard(-14, 0);
createHoopSupport(-14, 0);  // Left hoop support
createHoopSupport(14, 0); // Right hoop support
addNet(14, 3.05, 0);   // right hoop
addNet(-14, 3.05, 0);    // left hoop
createBasketball();






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