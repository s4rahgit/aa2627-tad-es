const orbCount = 12;
const ringRadius = 170;
const waveAmplitude = 36;

let orbs = [];

function setup() {
  const canvas = createCanvas(900, 600);
  canvas.parent('sketch-holder');
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();

  for (let i = 0; i < orbCount; i++) {
    orbs.push({
      angle: (TWO_PI / orbCount) * i,
      size: random(18, 42),
      offset: random(30, 120),
      hue: 190 + random(-25, 30),
      sat: 65 + random(20),
      bri: 70 + random(20),
      speed: random(0.005, 0.015),
    });
  }
}

function draw() {
  background(220, 30, 12);

  const centerX = width * 0.5;
  const centerY = height * 0.5;

  for (let i = 0; i < 7; i++) {
    const y = height * 0.15 + i * 75;
    fill(210, 45, 80, 18);
    ellipse(centerX, y, 580, 90 + i * 12);
  }

  for (let i = 0; i < orbs.length; i++) {
    const orb = orbs[i];
    const wave = sin(frameCount * orb.speed * 40 + orb.angle * 6) * waveAmplitude;
    const x = centerX + cos(orb.angle + frameCount * orb.speed * 2) * (ringRadius + orb.offset + wave);
    const y = centerY + sin(orb.angle + frameCount * orb.speed * 2.4) * (ringRadius * 0.82 + wave * 0.4);

    fill(orb.hue, orb.sat, orb.bri, 85);
    ellipse(x, y, orb.size, orb.size);
  }

  fill(32, 82, 92, 60);
  ellipse(centerX, centerY, 180, 180);

  fill(42, 74, 90, 80);
  ellipse(centerX, centerY, 220, 220);

  fill(42, 90, 92, 90);
  triangle(
    centerX, centerY - 60,
    centerX - 70, centerY + 60,
    centerX + 70, centerY + 60
  );

  fill(52, 35, 94, 75);
  arc(centerX, centerY + 80, 220, 120, 0, PI);
}
