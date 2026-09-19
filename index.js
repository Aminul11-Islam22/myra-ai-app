// --- PAGE NAVIGATION SYSTEM ---
function switchTab(tabName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const targetPage = document.getElementById('page-' + tabName);
  let targetNav = document.getElementById('nav-' + tabName);

  if (!targetNav && (tabName === 'voice-models' || tabName === 'orb-custom' || tabName === 'api-settings' || tabName === 'connectors' || tabName === 'permissions')) {
    targetNav = document.getElementById('nav-settings');
  }

  if (targetPage) targetPage.classList.add('active');
  if (targetNav) targetNav.classList.add('active');

  window.scrollTo(0, 0);
}

function selectRadio(element) {
  document.querySelectorAll('.radio-option').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
}

// --- CHECK ALL API INPUT FIELDS BEFORE ENABLING CHECK API BUTTON ---
function checkApiInputs() {
  const apiInputs = document.querySelectorAll('.required-api');
  const checkBtn = document.getElementById('btn-check-api-key');
  let allFilled = true;

  apiInputs.forEach(input => {
    if (input.value.trim() === '') {
      allFilled = false;
    }
  });

  if (checkBtn) {
    if (allFilled) {
      checkBtn.classList.add('ready');
    } else {
      checkBtn.classList.remove('ready');
    }
  }
}

document.addEventListener('input', (e) => {
  if (e.target.classList.contains('required-api')) {
    checkApiInputs();
  }
});

// --- CHECK API FUNCTIONALITY (RENDER BACKEND HEALTH CHECK) ---
async function verifyApiKeys() {
  const statusText = document.getElementById('check-status-text');
  const btn = document.getElementById('btn-check-api-key');
  const saveBtn = document.getElementById('btn-save-config');
  
  if (statusText) {
    statusText.classList.remove('completed');
    statusText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Checking Render Backend...</span>';
  }
  if (btn) {
    btn.style.opacity = '0.6';
    btn.style.pointerEvents = 'none';
  }
  if (saveBtn) saveBtn.disabled = true;

  try {
    const res = await fetch('https://myra-ai-backend-h8f4.onrender.com/');
    if (res.ok) {
      if (statusText) {
        statusText.classList.add('completed');
        statusText.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #2ed573;"></i> <span>Connected!</span>';
      }
      showToastNotification('Render Backend Connected Successfully!');
    } else {
      throw new Error('Server returned non-200');
    }
  } catch (err) {
    if (statusText) {
      statusText.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: #ff4757;"></i> <span>Server Offline/Waking Up</span>';
    }
    showToastNotification('Render Server waking up, please wait 20s and try again.');
  } finally {
    if (btn) {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    }
    if (saveBtn) saveBtn.disabled = false;
  }
}

// --- SAVE CONFIGURATION & SHOW POPUP NOTIFICATION ---
function saveConfiguration() {
  showToastNotification('Configuration Saved Successfully!');
}

function showToastNotification(message) {
  const popup = document.getElementById('save-popup');
  if (popup) {
    popup.querySelector('span').innerText = message;
    popup.classList.add('show');

    setTimeout(() => {
      popup.classList.remove('show');
    }, 3000);
  }
}

// --- TOGGLE SWITCH INTERACTION (ON/OFF) ---
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-switch')) {
      e.target.classList.toggle('off');
    }
  });
  checkApiInputs();
});

// --- SAVE CHANGES FUNCTION ---
function saveOrbSettings() {
  showToastNotification('Orb Settings Saved Successfully!');
}

// --- 1. DYNAMIC BACKGROUND PARTICLES ---
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;

function resizeBg() {
  if (bgCanvas) {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
}
resizeBg();
window.addEventListener('resize', resizeBg);

const particles = bgCanvas ? Array.from({ length: 60 }, () => ({
  x: Math.random() * bgCanvas.width,
  y: Math.random() * bgCanvas.height,
  radius: Math.random() * 1.8 + 0.5,
  alpha: Math.random() * 0.6 + 0.2,
  speedY: -Math.random() * 0.3 - 0.1,
  color: Math.random() > 0.5 ? '#ff2a4b' : '#00ffcc'
})) : [];

function drawBgParticles() {
  if (bgCtx && bgCanvas) {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    particles.forEach(p => {
      bgCtx.beginPath();
      bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      bgCtx.fillStyle = p.color;
      bgCtx.globalAlpha = p.alpha;
      bgCtx.fill();

      p.y += p.speedY;
      if (p.y < 0) p.y = bgCanvas.height;
    });
  }
  requestAnimationFrame(drawBgParticles);
}
drawBgParticles();

// --- 2. THREE.JS HOME ORB ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container ? container.clientWidth / container.clientHeight : 1, 0.1, 1000);
camera.position.z = 18;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
if (container) {
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
}

const orbGroup = new THREE.Group();
scene.add(orbGroup);

const ringCount = 4;
const rings = [];
const colors = [0x00ff88, 0x00e1ff, 0x33ff57, 0x02c39a];

for (let i = 0; i < ringCount; i++) {
  const pointsCount = 120;
  const points = [];
  const baseRadius = 4.2;

  for (let j = 0; j <= pointsCount; j++) {
    const theta = (j / pointsCount) * Math.PI * 2;
    const wave = Math.sin(theta * 3 + i) * 0.8;
    const r = baseRadius + wave;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const z = Math.sin(theta * 2) * 0.5;
    points.push(new THREE.Vector3(x, y, z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: colors[i],
    linewidth: 2,
    transparent: true,
    opacity: 0.85
  });

  const line = new THREE.Line(geometry, material);
  line.rotation.x = Math.PI * (i * 0.25);
  line.rotation.y = Math.PI * (i * 0.35);
  rings.push(line);
  orbGroup.add(line);
}

const coreGeo = new THREE.IcosahedronGeometry(2, 2);
const coreMat = new THREE.MeshBasicMaterial({
  color: 0x00ff88,
  wireframe: true,
  transparent: true,
  opacity: 0.25
});
const core = new THREE.Mesh(coreGeo, coreMat);
orbGroup.add(core);

// --- 3. THREE.JS SETTINGS AVATAR ---
function createSettingsOrb(targetContainer) {
  const sScene = new THREE.Scene();
  const sCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  sCamera.position.z = 6;

  const sRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  sRenderer.setSize(70, 70);
  sRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if (targetContainer) targetContainer.appendChild(sRenderer.domElement);

  const sGroup = new THREE.Group();
  sScene.add(sGroup);

  const headGeo = new THREE.SphereGeometry(1.5, 32, 32);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x8a2be2,
    wireframe: true,
    emissive: 0x4b0082,
    emissiveIntensity: 0.8
  });
  const headMesh = new THREE.Mesh(headGeo, headMat);
  sGroup.add(headMesh);

  const auraRingGeo = new THREE.TorusGeometry(2.1, 0.08, 16, 100);
  const auraRingMat = new THREE.MeshBasicMaterial({ color: 0xff0055, wireframe: true });
  const auraRing = new THREE.Mesh(auraRingGeo, auraRingMat);
  sGroup.add(auraRing);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  sScene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xff0055, 2, 10);
  pointLight.position.set(2, 2, 2);
  sScene.add(pointLight);

  return { scene: sScene, camera: sCamera, renderer: sRenderer, group: sGroup, ring: auraRing };
}

const charContainer = document.getElementById('character-3d-container');
const topOrb = createSettingsOrb(charContainer);
if (topOrb && topOrb.renderer.domElement) topOrb.renderer.setSize(140, 140);

const bottomOrbContainer = document.getElementById('bottom-orb-container');
const bottomOrb = createSettingsOrb(bottomOrbContainer);

// --- 4. ADVANCED HIGH-GLOW 3D ORB PREVIEW ENGINE ---
const orbPreviewContainer = document.getElementById('orb-3d-canvas-container');
const orbPreviewScene = new THREE.Scene();
const orbPreviewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
orbPreviewCamera.position.z = 8;

const orbPreviewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
if (orbPreviewContainer) {
  orbPreviewRenderer.setSize(200, 200);
  orbPreviewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  orbPreviewContainer.appendChild(orbPreviewRenderer.domElement);
}

function createPointTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, '#00d2ff');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

const previewGroup = new THREE.Group();
orbPreviewScene.add(previewGroup);

let currentOrbType = 'classic';
let orbHue = 200 / 360;
let baseScale = 0.5;

function buildClassicOrb() {
  while(previewGroup.children.length > 0) previewGroup.remove(previewGroup.children[0]);
  
  const pCount = 2200;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(pCount * 3);

  for (let i = 0; i < pCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 2.0 + (Math.random() - 0.5) * 0.15;

    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.22,
    map: createPointTexture(),
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  mat.color.setHSL(orbHue, 1.0, 0.65);

  const pMesh = new THREE.Points(geo, mat);
  previewGroup.add(pMesh);
}

function switchOrbType(type, element) {
  currentOrbType = type;
  if (element) {
    document.querySelectorAll('#orb-type-pills .pill-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
  }

  if (type === 'classic') buildClassicOrb();
  updateOrbScaleAndColor();
}

function updateOrbScaleAndColor() {
  previewGroup.scale.set(baseScale, baseScale, baseScale);
  overlayGroup.scale.set(baseScale * 1.5, baseScale * 1.5, baseScale * 1.5);
  
  previewGroup.traverse(child => {
    if (child.material && child.material.color) {
      child.material.color.setHSL(orbHue, 1.0, 0.6);
    }
  });
  overlayGroup.traverse(child => {
    if (child.material && child.material.color) {
      child.material.color.setHSL(orbHue, 1.0, 0.6);
    }
  });
}

buildClassicOrb();

const orbSizeSlider = document.getElementById('orb-size-slider');
function updateSliderTrack(slider) {
  if (!slider) return;
  const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
  slider.style.background = `linear-gradient(to right, #ff2a4b 0%, #ff2a4b ${value}%, #ffffff ${value}%, #ffffff 100%)`;
}

if (orbSizeSlider) {
  orbSizeSlider.addEventListener('input', (e) => {
    baseScale = 0.3 + (e.target.value / 100) * 0.7;
    updateOrbScaleAndColor();
    updateSliderTrack(e.target);
  });
  updateSliderTrack(orbSizeSlider);
}

const orbHueSlider = document.getElementById('orb-hue-slider');
if (orbHueSlider) {
  orbHueSlider.addEventListener('input', (e) => {
    orbHue = e.target.value / 360;
    updateOrbScaleAndColor();
  });
}

// --- 5. FULLSCREEN CENTER ORB OVERLAY ENGINE ---
const overlayContainer = document.getElementById('overlay-orb-container');
const overlayScene = new THREE.Scene();
const overlayCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
overlayCamera.position.z = 8;

const overlayRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
if (overlayContainer) {
  overlayRenderer.setSize(320, 320);
  overlayRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  overlayContainer.appendChild(overlayRenderer.domElement);
}

const overlayGroup = new THREE.Group();
overlayScene.add(overlayGroup);

function buildOverlayClassicOrb() {
  while(overlayGroup.children.length > 0) overlayGroup.remove(overlayGroup.children[0]);
  
  const pCount = 2800;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(pCount * 3);

  for (let i = 0; i < pCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 2.0 + (Math.random() - 0.5) * 0.15;

    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.22,
    map: createPointTexture(),
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  mat.color.setHSL(orbHue, 1.0, 0.6);

  const pMesh = new THREE.Points(geo, mat);
  overlayGroup.add(pMesh);
}
buildOverlayClassicOrb();

// --- NO-BEEP ERROR-SAFE VOICE ENGINE ---
let isAiSpeaking = false;
let isListening = false;
let recognition = null;

function toggleCenterOrb() {
  const overlay = document.getElementById('center-orb-overlay');
  if (overlay) {
    overlay.classList.toggle('active');
  }

  if (!isListening) {
    startVoiceRecognition();
  } else {
    stopVoiceRecognition();
  }
}

function startVoiceRecognition() {
  if (isAiSpeaking) return;

  if (window.location.protocol === 'file:') {
    showToastNotification('লোকাল ফাইলে ভয়েস কাজ করবে না, GitHub বা Netlify-তে হোস্ট করুন!');
    console.warn("Speech API doesn't support file:// protocol.");
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToastNotification('আপনার ব্রাউজারে ভয়েস সাপোর্ট করে না!');
    return;
  }

  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening = true;
      showToastNotification('মাইক চালু... বলুন!');
    };

    recognition.onresult = (event) => {
      if (isAiSpeaking) return;

      const userSpeech = event.results[0][0].transcript.trim();
      if (userSpeech) {
        const inputBox = document.querySelector('.input-box');
        if (inputBox) inputBox.value = userSpeech;

        sendQueryToBackend(userSpeech);
      }
    };

    recognition.onerror = (event) => {
      isListening = false;
      if (event.error === 'network') {
        console.warn("Speech Engine Error: Network issue or running from file:// protocol.");
      } else {
        console.warn("Speech Engine Error:", event.error);
      }
    };

    recognition.onend = () => {
      isListening = false;
    };
  }

  try {
    recognition.start();
  } catch (e) {
    console.log("Recognition is active or starting...");
  }
}

function stopVoiceRecognition() {
  isListening = false;
  if (recognition) {
    try { recognition.stop(); } catch(e) {}
  }
  showToastNotification('মাইক বন্ধ করা হয়েছে');
}

// --- SEND QUERY TO RENDER BACKEND & CUSTOM COMMAND SYSTEM ---
async function sendQueryToBackend(promptText) {
  const lowerPrompt = promptText.trim().toLowerCase();

  // ১. নাম জিজ্ঞেস করার কাস্টম কমান্ড
  if (lowerPrompt.includes("তোমার নাম কি") || lowerPrompt.includes("তোমার নাম কী")) {
    speakAiResponse("আমার নাম মাইরা (Myra), আপনার এআই অ্যাসিস্ট্যান্ট।");
    return;
  }

  // ২. কেমন আছো জিজ্ঞেস করার কাস্টম কমান্ড
  if (lowerPrompt.includes("তুমি কেমন আছো") || lowerPrompt.includes("কেমন আছো")) {
    speakAiResponse("আমি ভালো আছি বস! আপনি কেমন আছেন?");
    return;
  }

  showToastNotification('MYRA ভাবছে...');

  try {
    const response = await fetch("https://myra-ai-backend-h8f4.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: promptText
      })
    });

    const data = await response.json();
    let aiReply = data.response || data.reply || data.ai_reply || data.ai_response;

    if (aiReply) {
      
      // ১. প্লে ভিডিও কমান্ড আসলেও তা সরাসরি না চালিয়ে ইউটিউব অ্যাপে সার্চ করবে
      if (aiReply.includes('[PLAY_VIDEO:')) {
        const match = aiReply.match(/\[PLAY_VIDEO:\s*(.*?)\]/);
        if (match && match[1]) {
          const searchQuery = encodeURIComponent(match[1].trim());
          // ইউটিউব অ্যাপ ওপেন করে গানটি আগে সার্চ করবে
          window.location.href = `intent://www.youtube.com/results?search_query=${searchQuery}#Intent;package=com.google.android.youtube;scheme=https;end;`;
        }
        aiReply = aiReply.replace(/\[PLAY_VIDEO:.*?\]/g, '').trim();
      } 
      
      // ২. সরাসরি সার্চ কোয়েরি ইউটিউব অ্যাপে ওপেন করবে
      else if (aiReply.includes('[OPEN_YOUTUBE:')) {
        const match = aiReply.match(/\[OPEN_YOUTUBE:\s*(.*?)\]/);
        if (match && match[1]) {
          const searchQuery = encodeURIComponent(match[1].trim());
          // ইউটিউব অ্যাপ ওপেন করে গানটি আগে সার্চ করবে
          window.location.href = `intent://www.youtube.com/results?search_query=${searchQuery}#Intent;package=com.google.android.youtube;scheme=https;end;`;
        }
        aiReply = aiReply.replace(/\[OPEN_YOUTUBE:.*?\]/g, '').trim();
      }

      speakAiResponse(aiReply);
    } else if (data && data.error) {
      console.error("Backend Error:", data.error);
      speakAiResponse("ত্রুটি: " + data.error);
    } else {
      speakAiResponse("দুঃখিত, কোনো উত্তর পাওয়া যায়নি।");
    }

  } catch (error) {
    console.error("Fetch Error:", error);
    speakAiResponse("সার্ভারের সাথে সংযোগ করতে সমস্যা হচ্ছে। Render সার্ভার চালু হচ্ছে কি না দেখুন।");
  }
}

// --- AI SPEECH SYNTHESIS WITH FEMALE VOICE ENGINE ---
function speakAiResponse(replyText) {
  isAiSpeaking = true;
  stopVoiceRecognition();
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(replyText);
    utterance.lang = 'bn-BD';
    utterance.rate = 1.0;
    utterance.pitch = 1.2; // পিস বাড়িয়ে কন্ঠটিকে মেয়েলি রূপ দেওয়া হলো

    // ডিভাইসের স্টোর থেকে ফিমেল / মেয়েদের কণ্ঠ সিলেক্ট করার চেষ্টা
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      (voice.lang.includes('bn') || voice.lang.includes('en')) && 
      (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('google') || voice.name.toLowerCase().includes('zira'))
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.onend = () => {
      isAiSpeaking = false;
      setTimeout(() => { 
        const overlay = document.getElementById('center-orb-overlay');
        if (overlay && overlay.classList.contains('active')) {
          startVoiceRecognition();
        }
      }, 500);
    };

    utterance.onerror = () => {
      isAiSpeaking = false;
    };
    
    window.speechSynthesis.speak(utterance);
  } else {
    setTimeout(() => { 
      isAiSpeaking = false; 
    }, 3000);
  }
}

// ভয়েস লোড হওয়া নিশ্চিত করা
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  orbGroup.rotation.y = elapsedTime * 0.4;
  orbGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;
  const scale = 1 + Math.sin(elapsedTime * 2) * 0.05;
  orbGroup.scale.set(scale, scale, scale);

  rings.forEach((ring, idx) => {
    ring.rotation.z += (idx % 2 === 0 ? 0.008 : -0.008);
  });
  renderer.render(scene, camera);

  if (topOrb && topOrb.group) {
    topOrb.group.rotation.y = elapsedTime * 0.6;
    topOrb.ring.rotation.x = elapsedTime * 0.8;
    topOrb.ring.rotation.y = elapsedTime * 0.4;
    topOrb.renderer.render(topOrb.scene, topOrb.camera);
  }

  if (bottomOrb && bottomOrb.group) {
    bottomOrb.group.rotation.y = elapsedTime * 0.6;
    bottomOrb.ring.rotation.x = elapsedTime * 0.8;
    bottomOrb.ring.rotation.y = elapsedTime * 0.4;
    bottomOrb.renderer.render(bottomOrb.scene, bottomOrb.camera);
  }

  previewGroup.rotation.y = elapsedTime * 0.5;
  previewGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15;
  orbPreviewRenderer.render(orbPreviewScene, orbPreviewCamera);

  let targetScale = 1;
  if (isAiSpeaking || isListening) {
    targetScale = 1 + Math.sin(elapsedTime * 18) * 0.25 + (Math.random() * 0.1);
  } else {
    targetScale = 1 + Math.sin(elapsedTime * 2) * 0.05;
  }
  
  overlayGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);

  overlayGroup.rotation.y = elapsedTime * 0.5;
  overlayGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;
  overlayRenderer.render(overlayScene, overlayCamera);
}

animate();

window.addEventListener('resize', () => {
  if (container && container.clientWidth > 0) {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
});
