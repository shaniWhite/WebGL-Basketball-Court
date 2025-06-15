
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
  const arcRadius = 6;

  const drawArc = (centerZ, centerX, radius = 6, flip = false) => {
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
  drawArc(0, 15, 6, false);  // Right side
  drawArc(0, -15, 6, true);  // Left side

}


// function createRim(x, z) {
//   const rimRadius = 0.45;  // standard rim radius
//   const rimTube = 0.05;    // thickness
//   const rimHeight = 3.05;  // 10 feet

//   const geometry = new THREE.TorusGeometry(rimRadius, rimTube, 16, 100);
//   const material = new THREE.MeshStandardMaterial({ color: 0xff6600 });
//   const rim = new THREE.Mesh(geometry, material);

//   rim.position.set(x, rimHeight, z);
//   rim.rotation.x = Math.PI / 2;  // rotate to face forward
//   rim.castShadow = true;

//   scene.add(rim);
// }


// function createBackboard(x, z) {
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

//   // Automatically flip based on side of court
//   const isLeftSide = x < 0;
//   const adjustedX = isLeftSide ? x - backOffset : x + backOffset;

//   backboard.position.set(adjustedX, boardY, z);
//   backboard.rotation.y = isLeftSide ? Math.PI / 2 : -Math.PI / 2;

//   backboard.castShadow = true;
//   scene.add(backboard);
// }

// function createHoopSupport(x, z) {
//   const isLeftSide = x < 0;

//   // Main vertical pole
//   const poleHeight = 3.0;
//   const poleWidth = 0.2;
//   const poleOffset = isLeftSide ? -1.2 : 1.2;
//   const poleX = x + poleOffset;
//   const poleY = poleHeight / 2;

//   // Bottom padded base
//   const baseGeometry = new THREE.BoxGeometry(0.3, 1.2, 0.3);
//   const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
//   const base = new THREE.Mesh(baseGeometry, baseMaterial);
//   base.position.set(poleX, 0.6, z);
//   scene.add(base);


//   const poleGeometry = new THREE.BoxGeometry(poleWidth, poleHeight, poleWidth);
//   const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
//   const pole = new THREE.Mesh(poleGeometry, poleMaterial);
//   pole.position.set(poleX, poleY, z);
//   pole.castShadow = true;
//   scene.add(pole);

//   // Diagonal support arm
//   const armMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
//   const armRadius = 0.04;
//   const armLength = 0.8;  

//   //(top of pole)
//   const start = new THREE.Vector3(poleX, poleHeight, z);
//   const target = new THREE.Vector3(x, 3.05, z);
//   const direction = new THREE.Vector3().subVectors(target, start).normalize();

//   const end = new THREE.Vector3().addVectors(start, direction.clone().multiplyScalar(armLength));

//   const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

//   // Create arm 
//   const armGeometry = new THREE.CylinderGeometry(armRadius, armRadius, armLength, 16);
//   const arm = new THREE.Mesh(armGeometry, armMaterial);
//   arm.position.copy(mid);

//   const up = new THREE.Vector3(0, 1, 0);
//   const axis = up.clone().cross(direction).normalize();
//   const angle = Math.acos(up.clone().dot(direction));
//   arm.quaternion.setFromAxisAngle(axis, angle);

//   scene.add(arm);
// }

// function addNet(x, y, z, radius = 0.45, segments = 12, depth = 0.7,taper = 0.6) {
//   const netMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
//   const netGeometry = new THREE.BufferGeometry();
//   const netPoints = [];

//   const rings = 3; // number of horizontal loops
//   const verticals = []; 

//   // vertical strands
//   for (let i = 0; i < segments; i++) {
//     const angle = (i / segments) * 2 * Math.PI;

//     const x0 = x + Math.cos(angle) * radius;
//     const z0 = z + Math.sin(angle) * radius;
    
//     const x1 = x + Math.cos(angle) * (radius * taper);  // inward taper
//     const z1 = z + Math.sin(angle) * (radius * taper);
//     const y1 = y - depth;

//     netPoints.push(new THREE.Vector3(x0, y, z0));      // rim point
//     netPoints.push(new THREE.Vector3(x1, y1, z1));     // tapered end
//     verticals.push({ top: new THREE.Vector3(x0, y, z0), bottom: new THREE.Vector3(x1, y1, z1) });
//   }

//   // Horizontal loops (between vertical lines)
//   for (let r = 1; r <= rings; r++) {
//     const t = r / (rings + 1);
//     const loopPoints = [];

//     for (let i = 0; i < segments; i++) {
//       const a = verticals[i].top;
//       const b = verticals[i].bottom;

//       const p = new THREE.Vector3().lerpVectors(a, b, t);
//       loopPoints.push(p);
//     }

//     // connect points in a ring
//     for (let i = 0; i < segments; i++) {
//       const current = loopPoints[i];
//       const next = loopPoints[(i + 1) % segments];

//       netPoints.push(current);
//       netPoints.push(next);
//     }
//   }

//   netGeometry.setFromPoints(netPoints);
//   const net = new THREE.LineSegments(netGeometry, netMaterial);
//   scene.add(net);
// }

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
  const basketballMesh = new THREE.Mesh(basketballGeometry, basketballMaterial);
  basketballMesh.castShadow = true;
  basketballMesh.receiveShadow = true;
  
  // Position basketball at center court, slightly above the ground
  basketballMesh.position.set(0, 0.7, 0); // x=0 (center), y=0.25 (above court), z=0 (center)
  
  // Optional: Rotate basketball to get best seam line positioning
  basketballMesh.rotation.y = Math.PI / 4; // Rotate 45 degrees if needed
  
  // Add to scene
  scene.add(basketballMesh);
}




// Create all elements
createBasketballCourt();
createHoopSide(14, 0);   // Right hoop
createHoopSide(-14, 0);  // Left hoop

createBasketball();




// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Instructions display
// const instructionsElement = document.createElement('div');
// instructionsElement.style.position = 'absolute';
// instructionsElement.style.bottom = '20px';
// instructionsElement.style.left = '20px';
// instructionsElement.style.color = 'white';
// instructionsElement.style.fontSize = '16px';
// instructionsElement.style.fontFamily = 'Arial, sans-serif';
// instructionsElement.style.textAlign = 'left';
// instructionsElement.innerHTML = `
//   <h3>Controls:</h3>
//   <p>O - Toggle orbit camera</p>
// `;
// document.body.appendChild(instructionsElement);

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