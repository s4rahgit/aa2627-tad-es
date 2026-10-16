// Illusione: Optical Illusion Psychedelic Distorted Checkerboard
// Fonte: https://it.pngtree.com/freebackground/optical-illusion-psychedelic-black-and-white-background_1306806.html
// Regola (consigliata): La scacchiera viene deformata da una serie di vettori di forza radiali: ogni centro di rigonfiamento spinge i vertici della griglia verso l'esterno con una forza che decresce con la distanza
// Parametri critici: rigonfiamentoForza, rigonfiamentoRaggio, centriRigonfiamento, oscillationSpeed
//   effetto più evidente con rigonfiamentoForza = 32, nessun effetto con rigonfiamentoForza = 0

const canvasWidth = 800;
const canvasHeight = 600;
const tileSize = 52;
const gridColumns = 14;
const gridRows = 9;
const segmentiBordo = 8; // tratti per ogni lato della cella: più è alto, più il bordo è curvo

// Parametri critici dell'illusione
const rigonfiamentoForza = 32;   // spostamento massimo in pixel al picco dell'oscillazione
const rigonfiamentoRaggio = 170; // distanza in pixel oltre la quale la forza si spegne
const oscillationSpeed = 0.03;   // radianti per frame: meno è piccolo, più l'alternanza è lenta

// Coordinate dei centri di rigonfiamento: si muovono cambiando qui x e y
const centriRigonfiamento = [
  { x: 400, y: 300 },
  { x: 170, y: 160 },
  { x: 640, y: 450 },
];

function setup() {
  createCanvas(canvasWidth, canvasHeight);
}

function draw() {
  background(255);
  noStroke();

  // Fase 3: alternanza fra effetto presente ed assente.
  // sin(frameCount) scende gradualmente da 1 a -1, quindi map()
  // fa oscillare la forza fra rigonfiamentoForza (effetto) e 0 (nessun effetto)
  let forzaCorrente = map(sin(frameCount * oscillationSpeed), -1, 1, 0, rigonfiamentoForza);

  // Calcolo dei margini per centrare la scacchiera sulla tela
  let xOffset = (canvasWidth - (gridColumns * tileSize)) / 2;
  let yOffset = (canvasHeight - (gridRows * tileSize)) / 2;

  // La forza di un centro spinge il vertice lontano dal centro,
  // con un profilo gaussiano che si annulla oltre il raggio
  function calcolaSpostamento(x, y, centro) {
    let dx = x - centro.x;
    let dy = y - centro.y;
    let distanza = max(1, sqrt(dx * dx + dy * dy));
    let peso = exp(-(distanza * distanza) / (rigonfiamentoRaggio * rigonfiamentoRaggio));
    let spostamento = forzaCorrente * peso;
    return { x: (dx / distanza) * spostamento, y: (dy / distanza) * spostamento };
  }

  // Ogni vertice somma la spinta di tutti i centri
  function calcolaVertice(x, y) {
    let vertice = { x: x, y: y };
    for (let i = 0; i < centriRigonfiamento.length; i++) {
      let s = calcolaSpostamento(x, y, centriRigonfiamento[i]);
      vertice.x += s.x;
      vertice.y += s.y;
    }
    return vertice;
  }

  // Il lato retto della cella viene spezzato in più tratti:
  // ogni tratto subisce la stessa deformazione, così la linea si curva
  // invece di restare dritta, e i due lati condivisi restano incollati
  function aggiungiLato(ax, ay, bx, by) {
    for (let i = 0; i < segmentiBordo; i++) {
      let t = i / segmentiBordo;
      let v = calcolaVertice(lerp(ax, bx, t), lerp(ay, by, t));
      vertex(v.x, v.y);
    }
  }

  // Ciclo di generazione della griglia (Fase 2: Ripetizione dell'elemento)
  for (let c = 0; c < gridColumns; c++) {
    for (let r = 0; r < gridRows; r++) {

      // 1. Definiamo le coordinate lineari dei 4 vertici del quadrato originale
      let x1 = xOffset + c * tileSize;
      let y1 = yOffset + r * tileSize;

      let x2 = x1 + tileSize;
      let y2 = y1;

      let x3 = x1 + tileSize;
      let y3 = y1 + tileSize;

      let x4 = x1;
      let y4 = y1 + tileSize;

      // 2. Applichiamo la regola del colore alternato (Pari = Bianco, Dispari = Nero)
      if ((c + r) % 2 === 0) {
        fill(255); // Bianco
      } else {
        fill(0);   // Nero
      }

      // 3. Disegniamo la cella come forma chiusa, con i lati curvati
      beginShape();
      aggiungiLato(x1, y1, x2, y2);
      aggiungiLato(x2, y2, x3, y3);
      aggiungiLato(x3, y3, x4, y4);
      aggiungiLato(x4, y4, x1, y1);
      endShape(CLOSE);
    }
  }
}
