// Quadro: Wassily Kandinsky, "13 rettangoli", 1930
// Fonte: https://www.meisterdrucke.it/stampe-d-arte/Wassily-Kandinsky/684131/13-rettangoli.html
// Regola cromatica rigorosa in HSB. Variabili globali dichiarate correttamente all'inizio,
//   movimenti e variazioni dimensionali controllati tramite click sul marrone, e hitbox 
//   del pulsante di reset perfettamente calibrata sulle dimensioni effettive (20x20).

// --- VARIABILI GLOBALI E PARAMETRI ---
let canvasWidth = 800;
let canvasHeight = 600;

// Fattore di interazione: sale molto lentamente (sul blu), scende rapidamente (quando esci)
let interactionFactor = 0;

// Valori target e correnti per ogni figura per un'evoluzione cromatica morbida e coerente
let targetShiftRed = 0, currentShiftRed = 0;
let targetShiftBlue1 = 0, currentShiftBlue1 = 0;
let targetShiftBlue2 = 0, currentShiftBlue2 = 0;
let targetShiftAzzurro = 0, currentShiftAzzurro = 0;
let targetShiftYellow1 = 0, currentShiftYellow1 = 0;
let targetShiftYellow2 = 0, currentShiftYellow2 = 0;
let targetShiftBrown1 = 0, currentShiftBrown1 = 0;
let targetShiftBrown2 = 0, currentShiftBrown2 = 0;
let targetShiftDark = 0, currentShiftDark = 0;

// Colori dinamici per i quadratini piccoli
let smallColor1, smallColor2, smallColor3;

// Flag per l'attivazione dei movimenti e delle variazioni dimensionali (tramite click sul marrone)
let isMoving = false;

// Variabili di animazione e estensione dichiarate globalmente come richiesto
let redPulse = 1.0;
let blueExtW = 120.0;
let blueExtH = 80.0;
let yellowScale = 1.0;
let redMoveX = 0.0;
let redMoveY = 0.0;
let blueRot = 0.0;
let brownDrift = 0.0;
let smallChaos = 0.0;

// Coordinate globali per tracciare la posizione dinamica del quadratino di reset (hitbox precisa)
let currentResetX = 560;
let currentResetY = 550;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  colorMode(HSB, 360, 100, 100); // Imposta HSB per la gestione intuitiva dei rapporti cromatici
  updateOriginalSmallColors();
}

function draw() {
  // --- VERIFICA PASSAGGIO CURSORE SUL RETTANGOLO BLU ---
  let blueBlock1X = 310, blueBlock1Y = 215, blueBlock1W = 120, blueBlock1H = 80;
  let isOverBlue = (abs(mouseX - blueBlock1X) < blueBlock1W / 2 && abs(mouseY - blueBlock1Y) < blueBlock1H / 2);

  let targetFactor = isOverBlue ? 1.0 : 0.0;
  
  // Velocità asimmetrica: salita molto lenta sul blu, discesa rapida all'uscita
  let lerpSpeed = isOverBlue ? 0.003 : 0.08;
  interactionFactor = lerp(interactionFactor, targetFactor, lerpSpeed); 

  // Aggiornamento cromatico controllato e coerente
  if (isOverBlue && frameCount % 120 === 0) {
    targetShiftRed = random(-30, 30);
    targetShiftBlue1 = random(-25, 25);
    targetShiftBlue2 = random(-25, 25);
    targetShiftAzzurro = random(-20, 20);
    targetShiftYellow1 = random(-30, 30);
    targetShiftYellow2 = random(-30, 30);
    targetShiftBrown1 = random(-15, 15);
    targetShiftBrown2 = random(-15, 15);
    targetShiftDark = random(-20, 20);
  } else if (!isOverBlue && interactionFactor < 0.01) {
    targetShiftRed = 0;
    targetShiftBlue1 = 0;
    targetShiftBlue2 = 0;
    targetShiftAzzurro = 0;
    targetShiftYellow1 = 0;
    targetShiftYellow2 = 0;
    targetShiftBrown1 = 0;
    targetShiftBrown2 = 0;
    targetShiftDark = 0;
  }

  // Interpolazione continua dei colori
  let colorLerpSpeed = 0.015;
  currentShiftRed = lerp(currentShiftRed, targetShiftRed, colorLerpSpeed);
  currentShiftBlue1 = lerp(currentShiftBlue1, targetShiftBlue1, colorLerpSpeed);
  currentShiftBlue2 = lerp(currentShiftBlue2, targetShiftBlue2, colorLerpSpeed);
  currentShiftAzzurro = lerp(currentShiftAzzurro, targetShiftAzzurro, colorLerpSpeed);
  currentShiftYellow1 = lerp(currentShiftYellow1, targetShiftYellow1, colorLerpSpeed);
  currentShiftYellow2 = lerp(currentShiftYellow2, targetShiftYellow2, colorLerpSpeed);
  currentShiftBrown1 = lerp(currentShiftBrown1, targetShiftBrown1, colorLerpSpeed);
  currentShiftBrown2 = lerp(currentShiftBrown2, targetShiftBrown2, colorLerpSpeed);
  currentShiftDark = lerp(currentShiftDark, targetShiftDark, colorLerpSpeed);

  // --- SFONDO FISSO (Mantiene rigorosamente il colore originale ocra/sabbia) ---
  background(38, 28, 76);

  rectMode(CENTER);
  noStroke();

  // --- PARAMETRI DI MOVIMENTO E VARIAZIONE ESTENSIONE (LENTO) ---
  let t = frameCount * 0.015;
  
  redMoveX = isMoving ? sin(t * 0.8) * 15 : 0;
  redMoveY = isMoving ? cos(t * 0.6) * 10 : 0;
  
  // Variazioni di estensione / dimensione attivate dal click sul marrone
  redPulse = isMoving ? 1 + sin(t) * 0.08 : 1.0;
  blueExtW = isMoving ? 120 + sin(t * 0.7) * 20 : 120.0; 
  blueExtH = isMoving ? 80 + cos(t * 0.7) * 15 : 80.0;   
  yellowScale = isMoving ? 1 + cos(t * 0.9) * 0.15 : 1.0; 

  blueRot = isMoving ? sin(t * 0.5) * 0.08 : 0; 
  brownDrift = isMoving ? cos(t * 0.4) * 12 : 0; 
  smallChaos = isMoving ? sin(t * 1.2) * 10 : 0;

  // --- 1. RETTANGOLO ROSSO CENTRALE (Con variazione di estensione) ---
  let currentRedHue = (355 + currentShiftRed + 360) % 360;
  fill(currentRedHue, 84, 74);
  rect(400 + redMoveX, 300 + redMoveY, 200 * redPulse, 200 * redPulse);

  // --- 2. RETTANGOLI BLU E AZZURRI (Con variazione di estensione sul principale) ---
  let currentBlue1 = (212 + currentShiftBlue1 + 360) % 360;
  push();
  translate(310, 215);
  rotate(blueRot);
  fill(currentBlue1, 81, 57);
  rect(0, 0, blueExtW, blueExtH); 
  pop();

  let currentBlue2 = (15 + currentShiftBlue2 + 360) % 360;
  fill(currentBlue2, 90, 63);
  rect(310 - smallChaos, 440 + smallChaos, 50, 110);

  // --- IL PICCOLO QUADRATINO CHIARO (Pulsante di Reset in basso a destra) ---
  // Aggiornamento coordinate in tempo reale
  currentResetX = 560 + smallChaos * 0.5;
  currentResetY = 550 - smallChaos * 0.5;
  
  let currentAzzurro = (210 + currentShiftAzzurro + 360) % 360;
  fill(currentAzzurro, 15, 88);
  rect(currentResetX, currentResetY, 20, 20);

  // --- 3. RETTANGOLI GIALLI (Con variazione di estensione) ---
  let currentYellow1 = (48 + currentShiftYellow1 + 360) % 360;
  fill(currentYellow1, 60, 94);
  rect(520, 230, 80 * yellowScale, 80 * yellowScale); 

  let currentYellow2 = (43 + currentShiftYellow2 + 360) % 360;
  fill(currentYellow2, 70, 92);
  rect(330 + smallChaos, 530 - smallChaos, 30 * yellowScale, 30 * yellowScale); 

  // --- 4. RETTANGOLI MARRONI E SCURI ---
  let brown1X = 360, brown1Y = 105, brown1W = 50, brown1H = 95;
  let brown2X = 460, brown2Y = 260, brown2W = 45, brown2H = 65;

  let currentBrown1 = (18 + currentShiftBrown1 + 360) % 360;
  let currentBrown2 = (15 + currentShiftBrown2 + 360) % 360;

  fill(currentBrown1, 66, 29);
  rect(brown1X + brownDrift, brown1Y, brown1W, brown1H); 

  fill(currentBrown2, 68, 37);
  rect(brown2X, brown2Y - brownDrift * 0.5, brown2W, brown2H);

  // Nero / blu profondo
  let currentDark = (230 + currentShiftDark + 360) % 360;
  fill(currentDark, 50, 12);
  rect(550, 430 + smallChaos, 60, 100);

  // --- 5. QUADRATINI PICCOLI ---
  if (interactionFactor > 0.05 && frameCount % 120 === 0) {
    updateCoherentSmallColors();
  }

  fill(smallColor1);
  rect(265 + smallChaos, 155 - smallChaos, 35, 45);

  fill(smallColor2);
  rect(395 - smallChaos * 0.8, 500 + smallChaos * 0.8, 15, 15);

  fill(smallColor3);
  rect(530 + smallChaos * 0.5, 330 - smallChaos * 0.5, 14, 14);

  fill((12 + currentShiftRed * 0.5 + 360) % 360, 26, 92);
  rect(530 - smallChaos, 400 + smallChaos, 65, 40);
}

// --- GESTIONE DEI CLICK DEL MOUSE ---
function mousePressed() {
  let brown1X = 360, brown1Y = 105, brown1W = 50, brown1H = 95;

  // 1. Clic sul rettangolo marrone: attiva/disattiva i movimenti e le variazioni dimensionali
  let clickedBrown = (abs(mouseX - brown1X) < brown1W / 2 && abs(mouseY - brown1Y) < brown1H / 2);
  if (clickedBrown) {
    isMoving = !isMoving; 
  }

  // 2. Clic sul piccolo quadrato chiaro: hitbox rigorosamente commisurata alla dimensione 20x20 (raggio 10)
  let clickedReset = (abs(mouseX - currentResetX) < 10 && abs(mouseY - currentResetY) < 10);
  if (clickedReset) {
    isMoving = false;
    interactionFactor = 0;
    targetShiftRed = 0; currentShiftRed = 0;
    targetShiftBlue1 = 0; currentShiftBlue1 = 0;
    targetShiftBlue2 = 0; currentShiftBlue2 = 0;
    targetShiftAzzurro = 0; currentShiftAzzurro = 0;
    targetShiftYellow1 = 0; currentShiftYellow1 = 0;
    targetShiftYellow2 = 0; currentShiftYellow2 = 0;
    targetShiftBrown1 = 0; currentShiftBrown1 = 0;
    targetShiftBrown2 = 0; currentShiftBrown2 = 0;
    targetShiftDark = 0; currentShiftDark = 0;
    
    // Reset delle variabili globali di animazione/estensione
    redPulse = 1.0;
    blueExtW = 120.0;
    blueExtH = 80.0;
    yellowScale = 1.0;
    redMoveX = 0.0;
    redMoveY = 0.0;
    blueRot = 0.0;
    brownDrift = 0.0;
    smallChaos = 0.0;

    updateOriginalSmallColors();
  }
}

// --- COLORI ORIGINALI PER I QUADRATINI PICCOLI ---
function updateOriginalSmallColors() {
  smallColor1 = color(6, 35, 90);  // Rosa chiaro originale
  smallColor2 = color(35, 40, 40); // Nero/grigio originale
  smallColor3 = color(4, 38, 88);  // Rosa/pesca originale
}

// --- VARIAZIONE CROMATICA COERENTE PER I QUADRATINI ---
function updateCoherentSmallColors() {
  smallColor1 = color((6 + random(-15, 15) + 360) % 360, random(30, 45), random(85, 95));
  smallColor2 = color((35 + random(-15, 15) + 360) % 360, random(35, 50), random(35, 50));
  smallColor3 = color((4 + random(-15, 15) + 360) % 360, random(30, 45), random(85, 95));
}