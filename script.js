// Obtener elementos principales
const player = document.getElementById('audio');
const playPauseBtn = document.getElementById('playPauseBtn');
const seekBar = document.getElementById('seekBar');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const volumeBar = document.getElementById('volumeBar');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const audioInput = document.getElementById('audioInput');
const imgInput = document.getElementById('imgInput');
const bgInput = document.getElementById('bgInput');
const cover = document.getElementById('cover');
const bg = document.getElementById('bg');
const visualizerWrapper = document.getElementById('visualizer-wrapper');
const circle = document.getElementById('circle');
const toggleShakeGlobal = document.getElementById('toggleShakeGlobal');
const toggleShakeCircle = document.getElementById('toggleShakeCircle');
const toggleBlur = document.getElementById('toggleBlur');
const controls = document.querySelectorAll('.controls');
const shortcuts = document.getElementById('shortcuts');
const trapCanvas = document.getElementById('trapCanvas');
const trapCtx = trapCanvas.getContext('2d');
const trapParticlesCanvas = document.getElementById('trapParticles');
const trapParticlesCtx = trapParticlesCanvas.getContext('2d');
const trapCover = document.getElementById('trapCover');

let audioCtx, analyser, source, bufferLength, dataArray;
let radius = 140;
let visualizerMode = "circular";
let uiHidden = false;
let particles = [];

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  trapCanvas.width = innerWidth;
  trapCanvas.height = innerHeight;
  trapParticlesCanvas.width = innerWidth;
  trapParticlesCanvas.height = innerHeight;
}
resize();
window.addEventListener('resize', resize);

playPauseBtn.addEventListener('click', () => {
  if (player.paused) { player.play(); playPauseBtn.textContent = '⏸️'; }
  else { player.pause(); playPauseBtn.textContent = '▶️'; }
});

player.addEventListener('loadedmetadata', () => {
  seekBar.max = player.duration;
  durationSpan.textContent = formatTime(player.duration);
});

player.addEventListener('timeupdate', () => {
  seekBar.value = player.currentTime;
  currentTimeSpan.textContent = formatTime(player.currentTime);
});
seekBar.addEventListener('input', () => { player.currentTime = seekBar.value; });
volumeBar.addEventListener('input', () => { player.volume = volumeBar.value; });

function setupAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    source = audioCtx.createMediaElementSource(player);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  }
}

function spawnParticle(x, y, angle, strength) {
  const speed = strength / 10 + Math.random();
  particles.push({
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: Math.random() * 2 + 1,
    alpha: 1
  });
}

function drawParticles(ctx) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.01;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
    ctx.fill();
  }
}

function drawTrapVisualizer() {
  if (!analyser) return;
  analyser.getByteFrequencyData(dataArray);
  trapCtx.clearRect(0, 0, trapCanvas.width, trapCanvas.height);
  trapParticlesCtx.clearRect(0, 0, trapParticlesCanvas.width, trapParticlesCanvas.height);
  const cx = trapCanvas.width / 2, cy = trapCanvas.height / 2;
  trapCtx.save(); trapCtx.translate(cx, cy);
  const radius = 120, bars = 64;
  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    const value = dataArray[i], barLength = value / 2;
    const xStart = Math.cos(angle) * radius;
    const yStart = Math.sin(angle) * radius;
    const xEnd = Math.cos(angle) * (radius + barLength);
    const yEnd = Math.sin(angle) * (radius + barLength);
    trapCtx.beginPath();
    trapCtx.moveTo(xStart, yStart);
    trapCtx.lineTo(xEnd, yEnd);
    trapCtx.strokeStyle = `hsl(${i * 6}, 100%, 50%)`;
    trapCtx.lineWidth = 3;
    trapCtx.stroke();
    if (value > 80 && Math.random() < 0.5) {
      spawnParticle(cx + xEnd, cy + yEnd, angle, value);
    }
  }
  trapCtx.restore();
  drawParticles(trapParticlesCtx);
}

function drawCircularVisualizer() {
  if (!analyser) return;
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const step = Math.PI * 2 / bufferLength;
  const hue = Date.now() / 10 % 360;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    const value = dataArray[i] / 255;
    const angle = i * step;
    const r = radius + value * 60;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    if (value * 255 > 200 && Math.random() < 0.5) {
      spawnParticle(x, y, angle, value * 255);
    }
  }
  ctx.closePath();
  ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
  ctx.lineWidth = 5;
  ctx.shadowBlur = 20;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.stroke();
  ctx.shadowBlur = 0;
  drawParticles(ctx);
}

function draw() {
  requestAnimationFrame(draw);
  if (!analyser) return;
  analyser.getByteFrequencyData(dataArray);

  const avg = dataArray.slice(32, 64).reduce((a, b) => a + b, 0) / 32;
  const shake = avg > 70 ? (Math.random() * 10 - 5) : 0;

  visualizerWrapper.style.transform = toggleShakeGlobal.checked ? `translate(${shake}px, ${shake}px)` : 'translate(0, 0)';
  circle.style.transform = toggleShakeCircle.checked ? `translate(-50%, -50%) translate(${shake}px, ${shake}px)` : 'translate(-50%, -50%)';
  trapCover.style.transform = toggleShakeCircle.checked ? `translate(-50%, -50%) translate(${shake}px, ${shake}px)` : 'translate(-50%, -50%)';

  canvas.classList.add("hidden");
  trapCanvas.classList.add("hidden");
  trapParticlesCanvas.classList.add("hidden");
  circle.classList.add("hidden");
  trapCover.classList.add("hidden");

  if (visualizerMode === "circular") {
    canvas.classList.remove("hidden");
    circle.classList.remove("hidden");
    drawCircularVisualizer();
  }

  if (visualizerMode === "espejo") {
    canvas.classList.remove("hidden");
    circle.classList.remove("hidden");
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const barCount = 64, spacing = 2, barWidth = (canvas.width / 2) / barCount - spacing;
    const hue = Date.now() / 10 % 360;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < barCount; i++) {
      const val = dataArray[i], barHeight = val * 1.5;
      const xLeft = cx - (i * (barWidth + spacing)) - barWidth;
      const xRight = cx + (i * (barWidth + spacing));
      const yTop = cy - barHeight / 2;
      ctx.fillStyle = `hsl(${(hue + i * 5) % 360}, 100%, 60%)`;
      ctx.fillRect(xLeft, yTop, barWidth, barHeight);
      ctx.fillRect(xRight, yTop, barWidth, barHeight);
    }
  }

  if (visualizerMode === "trap") {
    trapCanvas.classList.remove("hidden");
    trapParticlesCanvas.classList.remove("hidden");
    trapCover.classList.remove("hidden");
    drawTrapVisualizer();
  }
}

player.addEventListener('play', () => { setupAudio(); draw(); });
window.addEventListener('click', () => { player.play(); setupAudio(); draw(); }, { once: true });

audioInput.addEventListener('change', async (e) => {
  const file = e.target.files[0]; if (!file) return;
  player.src = URL.createObjectURL(file); player.play();
  try {
    const metadata = await musicMetadata.parseBlob(file);
    const picture = metadata.common.picture?.[0];
    if (picture) {
      const blob = new Blob([picture.data], { type: picture.format });
      cover.src = URL.createObjectURL(blob);
    }
  } catch (err) { console.error('Error leyendo metadata:', err); }
});

imgInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const imgURL = URL.createObjectURL(file);
  cover.src = imgURL;
  const trapImage = document.getElementById('trapImage');
  if (trapImage) trapImage.src = imgURL;
});

bgInput.addEventListener('change', (e) => {
  const file = e.target.files[0]; if (!file) return;
  const url = URL.createObjectURL(file);
  if (file.type.startsWith('image/')) {
    document.body.style.backgroundImage = `url(${url})`;
    document.body.classList.toggle('bg-blur', toggleBlur.checked);
    bg.removeAttribute('src'); bg.style.display = 'none'; bg.classList.remove('blurred');
  } else if (file.type.startsWith('video/')) {
    bg.src = url; bg.style.display = 'block';
    document.body.style.backgroundImage = ''; document.body.classList.remove('bg-blur');
    bg.classList.toggle('blurred', toggleBlur.checked);
  }
});

toggleBlur.addEventListener('change', () => {
  const isChecked = toggleBlur.checked;
  if (bg.style.display !== 'none') {
    bg.classList.toggle('blurred', isChecked);
    document.body.classList.remove('bg-blur');
  } else {
    document.body.classList.toggle('bg-blur', isChecked);
    bg.classList.remove('blurred');
  }
});

document.addEventListener('keydown', (e) => {
  if (document.activeElement.tagName === 'INPUT') return;
  if (e.key.toLowerCase() === 'q') {
    uiHidden = !uiHidden;
    controls.forEach(ctrl => ctrl.classList.toggle('hidden', uiHidden));
    shortcuts.classList.toggle('hidden', uiHidden);
    document.body.classList.toggle('hide-cursor', uiHidden);
  }
  if (e.key.toLowerCase() === 'b') {
    toggleBlur.checked = !toggleBlur.checked;
    toggleBlur.dispatchEvent(new Event('change'));
  }
  if (e.key.toLowerCase() === 'v') {
    visualizerMode = visualizerMode === "circular" ? "espejo" : visualizerMode === "espejo" ? "trap" : "circular";
  }
  switch (e.key) {
    case ' ': e.preventDefault(); player.paused ? player.play() : player.pause(); break;
    case 'ArrowRight': player.currentTime += 5; break;
    case 'ArrowLeft': player.currentTime -= 5; break;
    case 'ArrowUp': e.preventDefault(); player.volume = Math.min(player.volume + 0.1, 1); break;
    case 'ArrowDown': e.preventDefault(); player.volume = Math.max(player.volume - 0.1, 0); break;
  }
});
