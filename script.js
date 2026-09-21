const canvas = document.getElementById('fieldCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('messageModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.querySelector('.close-button');
const modalBackdrop = document.querySelector('.modal-backdrop');

const flowers = [];
const particles = [];

let width = 0;
let height = 0;
let dpr = 1;
let time = 0;

function openModal() {
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  generateFlowers();
  generateParticles();
}

function generateFlowers() {
  flowers.length = 0;

  const bloomCount = width < 640 ? 12 : width < 1200 ? 18 : 26;

  for (let i = 0; i < bloomCount; i += 1) {
    const x = (width / (bloomCount + 1)) * (i + 1) + randomBetween(-26, 26);
    const stemHeight = randomBetween(110, 220);
    const baseY = height * 0.82 + randomBetween(0, height * 0.14);
    const variants = ['daisy', 'sunburst', 'petal', 'pompon', 'wild'];
    const type = variants[Math.floor(Math.random() * variants.length)];

    flowers.push({
      x,
      baseY,
      stemHeight,
      sway: randomBetween(10, 26),
      swaySpeed: randomBetween(0.45, 1.35),
      phase: randomBetween(0, Math.PI * 2),
      petalCount: type === 'pompon' ? Math.floor(randomBetween(12, 20)) : Math.floor(randomBetween(6, 14)),
      bloomRadius: randomBetween(16, 33),
      petalLength: randomBetween(8, 18),
      petalWidth: randomBetween(5, 11),
      delay: i * 0.12 + randomBetween(0.1, 0.55),
      growth: 0,
      lean: randomBetween(-8, 8),
      stemTilt: randomBetween(-4, 4),
      colorShift: randomBetween(0, 0.6),
      type,
      leafSpread: randomBetween(12, 26),
      centerSize: randomBetween(8, 15),
      hue: randomBetween(35, 55),
    });
  }
}

function generateParticles() {
  particles.length = 0;
  const particleCount = width < 640 ? 40 : 80;

  for (let i = 0; i < particleCount; i += 1) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: randomBetween(1.2, 4.5),
      speedX: randomBetween(-0.2, 0.3),
      speedY: randomBetween(-0.1, 0.25),
      alpha: randomBetween(0.18, 0.85),
      drift: randomBetween(0.5, 1.6),
      phase: randomBetween(0, Math.PI * 2),
    });
  }
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#241900');
  sky.addColorStop(0.38, '#101a2d');
  sky.addColorStop(1, '#03070d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(
    width * 0.5,
    height * 0.15,
    20,
    width * 0.5,
    height * 0.15,
    width * 0.8
  );
  glow.addColorStop(0, 'rgba(255, 211, 94, 0.18)');
  glow.addColorStop(0.35, 'rgba(255, 165, 0, 0.08)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

function drawParticles() {
  particles.forEach((particle) => {
    const x = particle.x + Math.sin(time * particle.drift + particle.phase) * 12;
    const y = particle.y + Math.cos(time * particle.drift * 0.8 + particle.phase) * 16;

    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 224, 118, ${particle.alpha})`;
    ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
    ctx.fill();

    if (y > height + 20) {
      particle.y = -10;
      particle.x = Math.random() * width;
    }

    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x < -10) particle.x = width + 10;
    if (particle.x > width + 10) particle.x = -10;
  });
}

function drawFlower(flower) {
  const bloomProgress = clamp((time - flower.delay) * 0.25, 0, 1);
  const eased = easeOutCubic(bloomProgress);

  const x = flower.x;
  const stemTopY = flower.baseY - flower.stemHeight * eased;
  const sway = Math.sin(time * flower.swaySpeed + flower.phase) * flower.sway * (0.35 + eased);
  const stemEndX = x + sway;

  ctx.strokeStyle = 'rgba(88, 172, 95, 0.96)';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, height);
  ctx.quadraticCurveTo(
    x + sway * 0.35,
    flower.baseY - flower.stemHeight * 0.54,
    stemEndX,
    stemTopY
  );
  ctx.stroke();

  const leafOffset = flower.stemHeight * 0.18;
  ctx.beginPath();
  ctx.moveTo(stemEndX, stemTopY + leafOffset * 0.55);
  ctx.quadraticCurveTo(
    stemEndX - flower.leafSpread,
    stemTopY + leafOffset * 0.7,
    stemEndX - flower.leafSpread * 0.5,
    stemTopY + leafOffset * 1.2
  );
  ctx.quadraticCurveTo(
    stemEndX - flower.leafSpread * 0.18,
    stemTopY + leafOffset * 0.8,
    stemEndX,
    stemTopY + leafOffset * 0.55
  );
  ctx.fillStyle = 'rgba(47, 142, 86, 0.9)';
  ctx.fill();

  ctx.save();
  ctx.translate(stemEndX, stemTopY - 6);
  ctx.rotate(Math.sin(time * 0.9 + flower.phase) * 0.18 + flower.stemTilt * 0.04);

  const petalScale = 0.7 + eased * 0.75;
  const petalLength = flower.petalLength * petalScale;
  const petalWidth = flower.petalWidth * petalScale;

  const palette = [
    'rgba(255, 245, 170, 0.98)',
    'rgba(255, 228, 98, 0.96)',
    'rgba(255, 206, 74, 0.94)',
    'rgba(255, 188, 48, 0.92)',
  ];

  if (flower.type === 'sunburst') {
    for (let i = 0; i < flower.petalCount; i += 1) {
      const angle = (Math.PI * 2 * i) / flower.petalCount;
      const px = Math.cos(angle) * (flower.bloomRadius * 0.8 * petalScale);
      const py = Math.sin(angle) * (flower.bloomRadius * 0.8 * petalScale);

      ctx.beginPath();
      ctx.ellipse(px, py, petalWidth * 1.5, petalLength * 1.6, angle, 0, Math.PI * 2);
      ctx.fillStyle = palette[i % palette.length];
      ctx.shadowColor = 'rgba(255, 224, 90, 0.7)';
      ctx.shadowBlur = 12;
      ctx.fill();
    }
  } else if (flower.type === 'daisy') {
    for (let i = 0; i < flower.petalCount; i += 1) {
      const angle = (Math.PI * 2 * i) / flower.petalCount;
      const px = Math.cos(angle) * (flower.bloomRadius * 0.9 * petalScale);
      const py = Math.sin(angle) * (flower.bloomRadius * 0.9 * petalScale);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(px * 0.8, py * 0.4, px, py);
      ctx.quadraticCurveTo(px * 0.2, py * 1.2, 0, 0);
      ctx.fillStyle = palette[i % palette.length];
      ctx.shadowColor = 'rgba(255, 236, 130, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fill();
    }
  } else if (flower.type === 'pompon') {
    for (let i = 0; i < flower.petalCount; i += 1) {
      const angle = (Math.PI * 2 * i) / flower.petalCount;
      const distance = flower.bloomRadius * 0.7 * petalScale;
      const px = Math.cos(angle) * distance;
      const py = Math.sin(angle) * distance;

      ctx.beginPath();
      ctx.ellipse(px, py, petalWidth * 0.75, petalLength * 0.7, angle, 0, Math.PI * 2);
      ctx.fillStyle = palette[(i + 1) % palette.length];
      ctx.shadowBlur = 8;
      ctx.fill();
    }
  } else if (flower.type === 'wild') {
    for (let i = 0; i < flower.petalCount; i += 1) {
      const angle = (Math.PI * 2 * i) / flower.petalCount + (flower.phase * 0.5);
      const px = Math.cos(angle) * (flower.bloomRadius * 0.8 * petalScale);
      const py = Math.sin(angle) * (flower.bloomRadius * 0.8 * petalScale);

      ctx.beginPath();
      ctx.ellipse(px, py, petalWidth * 1.2, petalLength * 1.4, angle, 0, Math.PI * 2);
      ctx.fillStyle = palette[i % palette.length];
      ctx.shadowBlur = 14;
      ctx.fill();
    }
  } else {
    for (let i = 0; i < flower.petalCount; i += 1) {
      const angle = (Math.PI * 2 * i) / flower.petalCount;
      const px = Math.cos(angle) * (flower.bloomRadius * 0.8 * petalScale);
      const py = Math.sin(angle) * (flower.bloomRadius * 0.8 * petalScale);

      ctx.beginPath();
      ctx.ellipse(px, py, petalWidth + 2, petalLength + 4, angle + 0.2, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 240, 120, 0.96)' : 'rgba(255, 196, 62, 0.92)';
      ctx.shadowBlur = 10;
      ctx.fill();
    }
  }

  ctx.beginPath();
  const centerGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, flower.centerSize + 16);
  centerGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
  centerGlow.addColorStop(0.22, 'rgba(255, 246, 185, 1)');
  centerGlow.addColorStop(0.65, `hsla(${flower.hue}, 95%, 55%, 0.96)`);
  centerGlow.addColorStop(1, `hsla(${flower.hue - 8}, 92%, 45%, 0.85)`);
  ctx.fillStyle = centerGlow;
  ctx.arc(0, 0, flower.centerSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function animate(timestamp) {
  time = timestamp * 0.001;

  drawBackground();
  drawParticles();

  flowers.forEach((flower) => drawFlower(flower));

  requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(animate);
