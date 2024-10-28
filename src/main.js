import * as THREE from 'three';

// Create an array to hold log messages
const logMessages = [];

const html_console_log = function (message) {
  // Add the message to the logMessages array (limit to last 10 logs)
  logMessages.push(message);
  if (logMessages.length > 10) logMessages.shift(); // Keep only the last 10 logs

  // Update the debug window
  document.getElementById('debug-window').innerHTML = logMessages.join('<br>');
};

// helpers
const randomChoice = inputArray => inputArray[Math.floor(Math.random() * inputArray.length)];

const scene = new THREE.Scene();
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);

// const renderer = new THREE.WebGLRenderer();
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let books = [];

// these are "real" metrics aligned to a proper book
const spineWidth = 1;
const frontFaceHeight = 10;
const frontFaceWidth = 7;

// use these for construction of the geometry
const numBooks = 5;
const bookWidth = frontFaceHeight;
const bookHeight = frontFaceWidth;
const bookDepth = spineWidth;
const spacing = 0.5 * 3;

const book_titles = [
  'Hämähäkki, by Maila Talvio',
  'Resend. Friesland, by Jac. P. Thijsse',
  'Presidential addresses and State papers, Vol. 1, by Theodore Roosevelt',
  'Saint Dominique, by Jean Guiraud',
  'Ritari Galahad, by John Erskine',
  'Belinda of the Red Cross, by Robert W. Hamilton',
  'La nave de los locos, by Pío Baroja',
];

const boxGeometryMaterialMaker = (baseMaterial, extras) => {
  const sides = ['right', 'left', 'top', 'bottom', 'front', 'back'];

  return sides.map(side => {
    return extras[side] || baseMaterial;
  });
};

// Create 10 BoxGeometry rectangles representing books
for (let i = 0; i < numBooks; i++) {
  let geometry = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth); // Width, Height, Depth
  // geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
  // geometry = new THREE.TorusGeometry();
  const baseMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

  let title = book_titles[i];
  let title_texture = createTextTexture(title, frontFaceHeight, spineWidth);
  const materials = boxGeometryMaterialMaker(baseMaterial, {
    top: new THREE.MeshBasicMaterial({ map: title_texture }),
  });

  const mesh = new THREE.Mesh(geometry, materials);

  mesh.rotation.x = Math.PI / 2;

  // Stack the books on the Y-axis, with spacing in between
  mesh.position.y = -i * (bookDepth + spacing);

  books.push(mesh);
  scene.add(mesh);
}

camera.position.set(0, 0, 15); // Positioned at (x, y, z)
camera.lookAt(0, 0, 0); // Focus the camera on the center of the stack

function animate() {
  renderer.render(scene, camera);

  // for (const book of books) {
  //   book.rotation.x += 0.02;
  //   book.rotation.y += 0.02;
  // }
}
renderer.setAnimationLoop(animate);

window.addEventListener('wheel', function (event) {
  // Adjust the camera's position based on the wheel delta
  const scrollSpeed = 0.05; // Adjust this value for faster/slower scroll
  const deltaY = event.deltaY;

  // Move the camera's Y position up or down based on the scroll delta
  camera.position.y += deltaY * scrollSpeed;

  // Ensure the camera keeps looking at the center of the scene
  // camera.lookAt(0, 0, 0);

  // Log the new camera Y position for debugging purposes
  html_console_log(camera.position.y);
});

// Handle window resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Create a canvas to draw the text
function createTextTexture(text, width, height) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = (width / height) * 512; // Adjust canvas size
  canvas.height = 512;

  // Set the background color (optional)
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Set text properties
  context.fillStyle = 'red'; // Text color
  context.font = '120px Arial'; // Font and size
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Draw the text onto the canvas
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  // Create texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
