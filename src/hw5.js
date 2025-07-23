

// Shani White 
// Daphne Messing 

import {OrbitControls} from './OrbitControls.js'
let basketballMesh;

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
const basketballSpeed = 0.1;  // Movement speed

let shotPower = 50;             // Starting power at 50%
let score = 0;
let shotAttempts = 0;
let shotsMade = 0;
let shotEvaluated = false;

let isBallMoving = false;
let velocity = new THREE.Vector3(0, 0, 0);
const gravity = -0.02; // adjust for realism
const restitution = 0.6; // Energy loss (0.6 = 60% of velocity retained after bounce)
const minPower = 0;
const maxPower = 100;

const keysPressed = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false
};

const courtBounds = {
  minX: -14,
  maxX: 14,
  minZ: -7,
  maxZ: 7
};

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

function createBasketballCourt() {
  // Court base
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xc68642, shininess: 50 
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);

  //  Center Line
  const centerLinePoints = [
    new THREE.Vector3(0, 0.11, -7.5),
    new THREE.Vector3(0, 0.11, 7.5)
  ];
  const centerLineGeom = new THREE.BufferGeometry().setFromPoints(centerLinePoints);
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  scene.add(new THREE.Line(centerLineGeom, lineMat));

  //  Center Circle
  const circlePoints = [];
  const circleRadius = 2;
  const circleSegments = 64;
  for (let i = 0; i <= circleSegments; i++) {
    const angle = (i / circleSegments) * Math.PI * 2;
    circlePoints.push(new THREE.Vector3(
      Math.cos(angle) * circleRadius, 0.11, Math.sin(angle) * circleRadius
    ));
  }
  const circleGeom = new THREE.BufferGeometry().setFromPoints(circlePoints);
  scene.add(new THREE.LineLoop(circleGeom, lineMat));

  //  Three-Point Arcs
  const arcSegments = 64;

  const drawArc = (centerZ, centerX, radius = 8, flip = false) => {
    const arcPoints = [];
    const startAngle = Math.PI / 2;
    const endAngle = (3 * Math.PI) / 2;

    for (let i = 0; i <= arcSegments; i++) {
      const t = i / arcSegments;
      const angle = startAngle + (endAngle - startAngle) * t;

      const xOffset = Math.cos(angle) * radius;
      const zOffset = Math.sin(angle) * radius;

      const x = flip ? centerX - xOffset : centerX + xOffset;
      const z = centerZ + zOffset;

      arcPoints.push(new THREE.Vector3(x, 0.11, z));
    }

    const arcGeom = new THREE.BufferGeometry().setFromPoints(arcPoints);
    scene.add(new THREE.Line(arcGeom, lineMat));
  };

  // Match your exact original calls:
  drawArc(0, 11, 5, false);  // Right side
  drawArc(0, -11, 5, true);  // Left side

  // Add blue hash/block lines on both sides of the court
  const lineLength = 4;
  const offsetX = 13;
  const offsetZ = -5;
  const y = 0.11;
  const color = 0xffffff;

  const positions = [
    [-offsetX, offsetZ],  // left side, top half
    [offsetX, offsetZ],   // right side, top half
    [-offsetX, -offsetZ], // left side, bottom half
    [offsetX, -offsetZ]   // right side, bottom half
  ];

  for (const [x, z] of positions) {
    const lineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x - lineLength / 2, y, z),
      new THREE.Vector3(x + lineLength / 2, y, z)
    ]);
    const line = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color }));
    scene.add(line);
  }


}

function createHoopSide(x, z) {
  const isLeftSide = x < 0;

  //  Rim
  const rimRadius = 0.45;
  const rimTube = 0.05;
  const rimHeight = 3.05;

  const rimGeometry = new THREE.TorusGeometry(rimRadius, rimTube, 16, 100);
  const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xff6600 });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.position.set(x, rimHeight, z);
  rim.rotation.x = Math.PI / 2;
  rim.castShadow = true;
  scene.add(rim);

  //  Backboard
  const boardWidth = 1.8;
  const boardHeight = 1.05;
  const boardDepth = 0.05;
  const boardY = 3.35;
  const backOffset = 0.5;
  const adjustedX = isLeftSide ? x - backOffset : x + backOffset;

  const boardGeometry = new THREE.BoxGeometry(boardWidth, boardHeight, boardDepth);
  const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
  });
  const backboard = new THREE.Mesh(boardGeometry, boardMaterial);
  backboard.position.set(adjustedX, boardY, z);
  backboard.rotation.y = isLeftSide ? Math.PI / 2 : -Math.PI / 2;
  backboard.castShadow = true;
  scene.add(backboard);

  //  Support Pole + Arm
  const poleHeight = 3.0;
  const poleWidth = 0.2;
  const poleOffset = isLeftSide ? -1.2 : 1.2;
  const poleX = x + poleOffset;
  const poleY = poleHeight / 2;

  // Base pad
  const baseGeometry = new THREE.BoxGeometry(0.3, 1.2, 0.3);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.set(poleX, 0.6, z);
  scene.add(base);

  // Vertical pole
  const poleGeometry = new THREE.BoxGeometry(poleWidth, poleHeight, poleWidth);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(poleX, poleY, z);
  pole.castShadow = true;
  scene.add(pole);

  // Arm
  const armRadius = 0.04;
  const armLength = 0.8;
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });

  const start = new THREE.Vector3(poleX, poleHeight, z);
  const target = new THREE.Vector3(x, 3.05, z);
  const direction = new THREE.Vector3().subVectors(target, start).normalize();
  const end = new THREE.Vector3().addVectors(start, direction.clone().multiplyScalar(armLength));
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

  const armGeometry = new THREE.CylinderGeometry(armRadius, armRadius, armLength, 16);
  const arm = new THREE.Mesh(armGeometry, armMaterial);
  arm.position.copy(mid);
  const up = new THREE.Vector3(0, 1, 0);
  const axis = up.clone().cross(direction).normalize();
  const angle = Math.acos(up.clone().dot(direction));
  arm.quaternion.setFromAxisAngle(axis, angle);
  scene.add(arm);

  // Net
  const segments = 12;
  const depth = 0.7;
  const taper = 0.6;
  const rings = 3;
  const netMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const netGeometry = new THREE.BufferGeometry();
  const netPoints = [];
  const verticals = [];

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const x0 = x + Math.cos(angle) * rimRadius;
    const z0 = z + Math.sin(angle) * rimRadius;
    const x1 = x + Math.cos(angle) * (rimRadius * taper);
    const z1 = z + Math.sin(angle) * (rimRadius * taper);
    const y1 = rimHeight - depth;

    netPoints.push(new THREE.Vector3(x0, rimHeight, z0));
    netPoints.push(new THREE.Vector3(x1, y1, z1));
    verticals.push({ top: new THREE.Vector3(x0, rimHeight, z0), bottom: new THREE.Vector3(x1, y1, z1) });
  }

  for (let r = 1; r <= rings; r++) {
    const t = r / (rings + 1);
    const loopPoints = [];

    for (let i = 0; i < segments; i++) {
      const p = new THREE.Vector3().lerpVectors(verticals[i].top, verticals[i].bottom, t);
      loopPoints.push(p);
    }

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

// Create basketball with your custom texture
function createBasketball() {
  // Create texture loader
  const textureLoader = new THREE.TextureLoader();
  
  // Basketball geometry (higher segments for smoother appearance with texture)
  const basketballGeometry = new THREE.SphereGeometry(0.5, 64, 64);
  
  // Load your basketball texture
  const basketballTexture = textureLoader.load(
    './src/textures/basketball.png',  // Path to your texture file
    
    // Success callback
    function(texture) {
      console.log('Basketball texture loaded successfully');
      
      // Optional: Adjust texture properties for better appearance
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
    },
    
    // Progress callback
    function(progress) {
      console.log('Loading basketball texture: ' + Math.round(progress.loaded / progress.total * 100) + '%');
    },
    
    // Error callback - fallback to simple orange if texture fails
    function(error) {
      console.error('Failed to load basketball texture:', error);
      console.log('Using fallback orange material');
      
      // Fallback to simple orange material
      basketballMesh.material = new THREE.MeshPhongMaterial({ 
        color: 0xff6600,
        shininess: 30
      });
    }
  );
  
  // Basketball material with your texture
  const basketballMaterial = new THREE.MeshPhongMaterial({ 
    map: basketballTexture,
    shininess: 20,      // Slight shine for realistic basketball appearance
    bumpScale: 0.1      // Optional: adds slight surface bumps for texture
  });
  
  // Create basketball mesh
  basketballMesh = new THREE.Mesh(basketballGeometry, basketballMaterial);
  basketballMesh.castShadow = true;
  basketballMesh.receiveShadow = true;
  
  // Position basketball at center court, slightly above the ground
  basketballMesh.position.set(0, 0.7, 0); // x=0 (center), y=0.25 (above court), z=0 (center)
  
  // Optional: Rotate basketball to get best seam line positioning
  basketballMesh.rotation.y = Math.PI / 4; // Rotate 45 degrees if needed
  
  // Add to scene
  scene.add(basketballMesh);
}


function FreeThrowLine(x, z, width = 6, height = 5, color = 0x5a2d0c) {
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    side: THREE.DoubleSide
  });

  const paint = new THREE.Mesh(geometry, material);
  paint.rotation.x = -Math.PI / 2; // flat on ground

  // ✅ Position rectangle to start at the baseline and go inward
  paint.position.set(x, 0.11, z); // Centered forward from rim

  scene.add(paint);
}

function addFreeThrowArcs(xCenter, zCenter, radius = 1.8, segments = 32) {
  const solidStartAngle = Math.PI / 2;
  const solidEndAngle = -Math.PI / 2;
  const flipX = xCenter > 0;  // flip direction if right side

  // Solid arc (front half - facing basket)
  const solidPoints = [];
  for (let i = 0; i <= segments; i++) {
    const angle = solidStartAngle + (i / segments) * (solidEndAngle - solidStartAngle);
    const xRaw = Math.cos(angle) * radius;
    const z = zCenter + Math.sin(angle) * radius;
    const x = xCenter + (flipX ? -xRaw : xRaw);  // flip solid arc inward if on right
    solidPoints.push(new THREE.Vector3(x, 0.12, z));
  }

  const solidGeometry = new THREE.BufferGeometry().setFromPoints(solidPoints);
  const solidMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  scene.add(new THREE.Line(solidGeometry, solidMaterial));

  // Dashed arc (back half - away from basket)
  const dashedPoints = [];
  for (let i = 0; i <= segments; i++) {
    const angle = solidStartAngle + (i / segments) * (solidEndAngle - solidStartAngle);
    const xRaw = Math.cos(angle) * radius;
    const z = zCenter - Math.sin(angle) * radius;
    const x = xCenter - (flipX ? -xRaw : xRaw);  // flip dashed arc outward if on right
    dashedPoints.push(new THREE.Vector3(x, 0.12, z));
  }

  const dashedGeometry = new THREE.BufferGeometry().setFromPoints(dashedPoints);
  const dashedMaterial = new THREE.LineDashedMaterial({
    color: 0xffffff,
    dashSize: 0.2,
    gapSize: 0.15
  });

  const dashedArc = new THREE.Line(dashedGeometry, dashedMaterial);
  dashedArc.computeLineDistances();
  scene.add(dashedArc);
}


// Create all elements
createBasketballCourt();
createHoopSide(14, 0);   // Right hoop
createHoopSide(-14, 0);  // Left hoop
FreeThrowLine(12, 0);    // Right side
FreeThrowLine(-12, 0);   // Left side 
addFreeThrowArcs(-9, 0);  // Left side hoop
addFreeThrowArcs(9, 0);   // Right side hoop

createBasketball();

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;


// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

document.addEventListener('keydown', (e) => {
  if (e.key in keysPressed) {
    keysPressed[e.key] = true;
  }

  // W/S keys to adjust shot power
  if (e.key === 'w' || e.key === 'W') {
    shotPower = Math.min(maxPower, shotPower + 1);
    updatePowerBar();
  }

  if (e.key === 's' || e.key === 'S') {
    shotPower = Math.max(minPower, shotPower - 1);
    updatePowerBar();
  }

  if (e.key === ' ') {
    if (!isBallMoving) {
      shotEvaluated = false;

      shootBall();
    }
  }

  if (e.key === 'r' || e.key === 'R') {
    // Reset basketball to center court
    basketballMesh.position.set(0, 0.7, 0);

    // Reset velocity
    velocity.set(0, 0, 0);

    // Reset shot power
    shotPower = 50;
    updatePowerBar();

    // Clear physics
    isBallMoving = false;
  }

});


document.addEventListener('keyup', (e) => {
  if (e.key in keysPressed) {
    keysPressed[e.key] = false;
  }
});


// Animation function - Loops at 60fps -Updates camera controls -Re-renders the scene

function animate() {
  requestAnimationFrame(animate);

  // Basketball movement
  if (basketballMesh) {
    let dx = 0, dz = 0;
    if (keysPressed.ArrowLeft) dx -= basketballSpeed;
    if (keysPressed.ArrowRight) dx += basketballSpeed;
    if (keysPressed.ArrowUp) dz -= basketballSpeed;
    if (keysPressed.ArrowDown) dz += basketballSpeed;

    const newX = basketballMesh.position.x + dx;
    const newZ = basketballMesh.position.z + dz;

    // Clamp position within bounds
    if (newX >= courtBounds.minX && newX <= courtBounds.maxX) {
      basketballMesh.position.x = newX;
    }
    if (newZ >= courtBounds.minZ && newZ <= courtBounds.maxZ) {
      basketballMesh.position.z = newZ;
    }
  }

    // Physics update
  if (isBallMoving) {
    // Apply gravity
    velocity.y += gravity;

    // Update position
    basketballMesh.position.add(velocity);

    // Check for scoring
    if (velocity.y < 0) {
      const ballX = basketballMesh.position.x;
      const ballY = basketballMesh.position.y;
      const ballZ = basketballMesh.position.z;

      const hoopX = ballX < 0 ? -14 : 14;
      const hoopZ = 0;
      const rimRadius = 0.45;

      const dx = ballX - hoopX;
      const dz = ballZ - hoopZ;
      const distanceToCenter = Math.sqrt(dx * dx + dz * dz);

      const passedThroughHoop = (distanceToCenter < rimRadius) && (ballY < 3.05) && (ballY > 2.7);

      if (passedThroughHoop) {
        // Count the score
        score += 2;
        shotsMade += 1;
        isBallMoving = false;
        velocity.set(0, 0, 0);
        showPopupMessage('✅ SHOT MADE!', 'green');
        updateScoreboard();
        
      } else if (ballY < 0.71 && !shotEvaluated) {
        // Ball hit ground and missed
        showPopupMessage('❌ MISSED SHOT', 'red');
        shotEvaluated = true;
        updateScoreboard();
      }
    }

    // Ground collision
    if (basketballMesh.position.y <= 0.7) {
      basketballMesh.position.y = 0.7;

      // Apply energy loss to all velocity components
      velocity.y = -velocity.y * restitution;
      velocity.x *= 0.8; // friction-like effect
      velocity.z *= 0.8;

      // Stop ball if it is nearly stationary
      if (Math.abs(velocity.y) < 0.05 && Math.abs(velocity.x) < 0.01 && Math.abs(velocity.z) < 0.01) {
        velocity.set(0, 0, 0);
        isBallMoving = false;
        shotEvaluated = true;
      }
    }

    // Clamp to court bounds
    basketballMesh.position.x = Math.max(courtBounds.minX, Math.min(courtBounds.maxX, basketballMesh.position.x));
    basketballMesh.position.z = Math.max(courtBounds.minZ, Math.min(courtBounds.maxZ, basketballMesh.position.z));
  }

  controls.enabled = isOrbitEnabled;
  controls.update();
  renderer.render(scene, camera);
}

// POWER BAR UI
const powerBarContainer = document.createElement('div');
powerBarContainer.style.position = 'absolute';
powerBarContainer.style.bottom = '20px';
powerBarContainer.style.left = '50%';
powerBarContainer.style.transform = 'translateX(-50%)';
powerBarContainer.style.width = '300px';
powerBarContainer.style.height = '20px';
powerBarContainer.style.border = '2px solid white';
powerBarContainer.style.background = '#333';
powerBarContainer.style.zIndex = 10;
document.body.appendChild(powerBarContainer);

const powerBarFill = document.createElement('div');
powerBarFill.style.height = '100%';
powerBarFill.style.width = `${shotPower}%`;
powerBarFill.style.background = 'limegreen';
powerBarFill.style.transition = 'width 0.1s ease-out';
powerBarContainer.appendChild(powerBarFill);

function updatePowerBar() {
  powerBarFill.style.width = `${shotPower}%`;
}

function updateScoreboard() {
  document.getElementById('score').textContent = score;
  document.getElementById('attempts').textContent = shotAttempts;
  document.getElementById('made').textContent = shotsMade;

  const accuracy = shotAttempts > 0 ? ((shotsMade / shotAttempts) * 100).toFixed(1) : 0;
  document.getElementById('accuracy').textContent = `${accuracy}%`;
}

function showPopupMessage(text, color = 'white') {
  const popup = document.getElementById('popupMessage');
  popup.textContent = text;
  popup.style.display = 'block';
  popup.style.opacity = '1';
  popup.style.backgroundColor = color;

  // Reset animation
  popup.style.animation = 'none';
  void popup.offsetWidth; // trigger reflow
  popup.style.animation = 'fadeOut 2s ease-out forwards';

  // Hide after 2 seconds
  setTimeout(() => {
    popup.style.display = 'none';
  }, 2000);
}



function shootBall() {
  shotAttempts += 1;
  updateScoreboard();

  const ballPos = basketballMesh.position.clone();
  const leftHoop = new THREE.Vector3(-14, 3.05, 0);
  const rightHoop = new THREE.Vector3(14, 3.05, 0);

  // Pick the nearest hoop
  const distLeft = ballPos.distanceTo(leftHoop);
  const distRight = ballPos.distanceTo(rightHoop);
  const target = distLeft < distRight ? leftHoop : rightHoop;

  const dir = new THREE.Vector3().subVectors(target, ballPos).normalize();

  // Apply shot velocity based on power (scaled)
  velocity.copy(dir.multiplyScalar(shotPower * 0.03));  // Tune factor as needed
  velocity.y = shotPower * 0.02;  // Add vertical arc

  isBallMoving = true;

  // Start new shot attempt
  document.getElementById('feedback').textContent = '';
}


animate();