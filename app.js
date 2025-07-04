
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');

const hairImage = new Image();
hairImage.src = 'images/pero.png'; // Vlož si sem svůj účes v PNG

let videoWidth = 0;
let videoHeight = 0;

function onResults(results) {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    return;
  }

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  const landmarks = results.multiFaceLandmarks[0];

  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const forehead = landmarks[10]; // Přibližně střed čela

  // Výpočet pozice a velikosti účesu
  const eyeDist = Math.abs(rightEye.x - leftEye.x) * canvasElement.width;
  const hairWidth = eyeDist * 3;
  const hairHeight = hairWidth * 1.2;

  const hairX = (forehead.x * canvasElement.width) - hairWidth / 2;
  const hairY = (forehead.y * canvasElement.height) - hairHeight * 0.8;

  canvasCtx.drawImage(hairImage, hairX, hairY, hairWidth, hairHeight);
}

// Inicializace MediaPipe FaceMesh
const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

// Spuštění kamery
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 480,
  height: 360
});
camera.start();

// Uprav velikost canvasu podle videa
videoElement.addEventListener('loadeddata', () => {
  videoWidth = videoElement.videoWidth;
  videoHeight = videoElement.videoHeight;
  canvasElement.width = videoWidth;
  canvasElement.height = videoHeight;
});
