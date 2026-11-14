// Testo: Flo Rida, "Right Round" (ritornello)
// Font: Outfit — https://fonts.google.com/specimen/Outfit
// Composizione: all'apertura la frase si legge su righe orizzontali al centro
//   della tela. Cliccando sulla parola "spin", la frase si dispone in una
//   spirale di orbite circolari, partendo dal centro con la parola "down";
//   le lettere seguono l'arco della spirale.
//   Lo sfondo diventa nero prima che le parole si accendano in ordine casuale;
//   passando il cursore sulle parole, il loro colore neon cambia casualmente.
//   Cliccando su "down", tutto torna gradualmente allo stato iniziale.

const testo = 'you spin my head right round right round, when you go down when you go down down';
const nomeFont = 'Outfit.ttf';

const larghezzaTela = 800;
const altezzaTela = 600;

// durata del passaggio dalla frase orizzontale alla spirale
const fotogrammiTransizione = 120;
const dimensioneIniziale = 30;
const interlinea = 1.4;
const margineOrizzontale = 120;
const parolaDaCliccare = 'spin';
const parolaPerRipristino = 'down';

// ogni parola segue un'orbita; gli scarti casuali irregolarizzano la spirale
const raggioIniziale = 55;
const passoRadiale = 12;
const scartoRadialeMassimo = 5;
const passoAngolare = 0.68;
const spazioMinimoTraParole = 8;
const ritardoTraParole = 6;
const attesaAccensione = 18;
const fotogrammiTraAccensioni = 8;

const dimensioneMinima = 10;
const dimensioneMassima = 52;

// curvatura dei caratteri: quasi dritti quelli interni, molto arcuati
// quelli esterni, che devono seguire il tratto più ampio della spirale
const curvaturaParolaInterna = 0.003;
const curvaturaParolaEsterna = 0.012;

// sopra 1 il contrasto fra interno ed esterno aumenta: le parole esterne
// restano grandi e molto curve, quelle interne si riducono e si raddrizzano
const esponenteEsterno = 1.3;

const velocitaMinima = 0.0015;
const velocitaMassima = 0.004;
const sensoDiRotazione = -1;

const coloreSfondo = 245;
const coloreInchiostro = 25;
const coloreTestoAttivo = 70;
const coloreNeon = '#a8f0ff';
const coloriNeon = [
  '#9cf0ff',
  '#6deaff',
  '#40dfff',
  '#29c8ff',
  '#20a8ff',
  '#218bff',
  '#346dff',
  '#5456ff',
  '#754bff',
  '#9945ff',
  '#be3fff',
  '#e33df1',
  '#f13fd0',
  '#ff47a7',
  '#ff4f7c',
  '#ff5a59',
  '#ff703e',
  '#ff8b32',
  '#ffaa32',
  '#ffd038',
  '#f3ed46',
  '#c5f34a',
  '#8ce84b',
  '#58df68',
  '#35d9a0',
  '#25d8d8',
  '#51e5e9'
];
const durataCambioColore = 18;
const intensitaBagliore = 16;

let font;
let parole = [];
let paroleAccese = [];
let coloriParole = [];
let coloriPartenzaParole = [];
let coloriObiettivoParole = [];
let frameCambioColore = [];
let ritardiAccensione = [];
let raggi = [];
let scartiAngolari = [];
let dimensioni = [];
let scaleDalCentro = [];
let angoloSpirale = 0;
let velocitaSpirale = 0;
let posizioniInizialiX = [];
let posizioniInizialiY = [];
let posizioniVisualiX = [];
let posizioniVisualiY = [];
let raggiCliccabili = [];
let larghezzaParolaDaCliccare = 0;
let animazioneAvviata = false;
let ritornoAvviato = false;
let frameAvvio = 0;
let frameRitorno = 0;
let indiceHoverPrecedente = -1;
let indiceProssimoColoreNeon = 0;

async function setup() {
  let tela = createCanvas(larghezzaTela, altezzaTela);
  tela.parent('sketch-holder');

  font = await loadFont(nomeFont);
  textFont(font);
  textAlign(CENTER, CENTER);
  noStroke();

  parole = testo.split(' ');
  paroleAccese = new Array(parole.length).fill(false);
  coloriParole = new Array(parole.length).fill(color(coloreNeon));
  coloriPartenzaParole = coloriParole.slice();
  coloriObiettivoParole = coloriParole.slice();
  frameCambioColore = new Array(parole.length).fill(0);

  let ordineAccensione = [];
  for (let i = 0; i < parole.length; i++) {
    ordineAccensione.push(i);
  }
  for (let i = ordineAccensione.length - 1; i > 0; i--) {
    let indiceCasuale = floor(random(i + 1));
    let temporaneo = ordineAccensione[i];
    ordineAccensione[i] = ordineAccensione[indiceCasuale];
    ordineAccensione[indiceCasuale] = temporaneo;
  }
  for (let i = 0; i < ordineAccensione.length; i++) {
    ritardiAccensione[ordineAccensione[i]] = i * fotogrammiTraAccensioni;
  }

  angoloSpirale = random(TWO_PI);
  velocitaSpirale = random(velocitaMinima, velocitaMassima) * sensoDiRotazione;

  for (let i = 0; i < parole.length; i++) {
    // l'ultima parola parte vicino al centro; le precedenti si allargano
    let distanzaDalCentro = parole.length - 1 - i;
    raggi.push(
      raggioIniziale +
      distanzaDalCentro * passoRadiale +
      random(-scartoRadialeMassimo, scartoRadialeMassimo)
    );
    let scalaDalCentro = distanzaDalCentro / (parole.length - 1);
    scaleDalCentro.push(scalaDalCentro);
    dimensioni.push(
      lerp(
        dimensioneMinima,
        dimensioneMassima,
        pow(scalaDalCentro, esponenteEsterno)
      )
    );
  }

  scartiAngolari = new Array(parole.length).fill(0);
  for (let i = parole.length - 2; i >= 0; i--) {
    push();
    textSize(dimensioni[i]);
    textStyle(parole[i] === parolaDaCliccare ? BOLD : NORMAL);
    let larghezzaEsterna = fontWidth(parole[i]);
    textSize(dimensioni[i + 1]);
    textStyle(parole[i + 1] === parolaDaCliccare ? BOLD : NORMAL);
    let larghezzaInterna = fontWidth(parole[i + 1]);
    pop();

    let distanzaMinima =
      (larghezzaEsterna + larghezzaInterna) / 2 + spazioMinimoTraParole;
    let raggioEsterno = raggi[i];
    let raggioInterno = raggi[i + 1];
    let cosenoPasso = constrain(
      (raggioEsterno * raggioEsterno +
        raggioInterno * raggioInterno -
        distanzaMinima * distanzaMinima) /
        (2 * raggioEsterno * raggioInterno),
      -1,
      1
    );
    let passoNecessario = acos(cosenoPasso);
    scartiAngolari[i] =
      scartiAngolari[i + 1] + max(passoAngolare, passoNecessario);
  }

  disponiFraseIniziale();
}

// posiziona le parole su righe normali, andando a capo quando superano
// la larghezza disponibile, e ne memorizza il centro
function disponiFraseIniziale() {
  textSize(dimensioneIniziale);

  let spazio = fontWidth(' ');
  let larghezzaMassima = larghezzaTela - margineOrizzontale;
  let righe = [];
  let riga = [];
  let larghezzaRiga = 0;

  for (let i = 0; i < parole.length; i++) {
    let larghezzaParola = fontWidth(parole[i]);
    let aggiunta = (riga.length > 0 ? spazio : 0) + larghezzaParola;

    if (riga.length > 0 && larghezzaRiga + aggiunta > larghezzaMassima) {
      righe.push(riga);
      riga = [];
      larghezzaRiga = 0;
      aggiunta = larghezzaParola;
    }

    riga.push({ indice: i, larghezza: larghezzaParola });
    larghezzaRiga += aggiunta;
  }
  if (riga.length > 0) righe.push(riga);

  let passoRiga = dimensioneIniziale * interlinea;
  let primaRigaY = altezzaTela / 2 - ((righe.length - 1) * passoRiga) / 2;

  for (let r = 0; r < righe.length; r++) {
    let larghezzaTotale = 0;
    for (let k = 0; k < righe[r].length; k++) {
      larghezzaTotale += righe[r][k].larghezza;
    }
    larghezzaTotale += spazio * (righe[r].length - 1);

    let x = larghezzaTela / 2 - larghezzaTotale / 2;

    for (let k = 0; k < righe[r].length; k++) {
      let parola = righe[r][k];
      posizioniInizialiX[parola.indice] = x + parola.larghezza / 2;
      posizioniInizialiY[parola.indice] = primaRigaY + r * passoRiga;
      x += parola.larghezza + spazio;
    }
  }

  larghezzaParolaDaCliccare = fontWidth(parolaDaCliccare);
}

function draw() {
  let durataRitorno =
    fotogrammiTransizione + (parole.length - 1) * ritardoTraParole;
  let avanzamentoRitorno = 0;
  if (ritornoAvviato) {
    avanzamentoRitorno = constrain(
      (frameCount - frameRitorno) / durataRitorno,
      0,
      1
    );
    avanzamentoRitorno =
      avanzamentoRitorno * avanzamentoRitorno * (3 - 2 * avanzamentoRitorno);
  }

  let coloreSfondoCorrente = animazioneAvviata ? 0 : coloreSfondo;
  if (ritornoAvviato) {
    coloreSfondoCorrente = lerp(0, coloreSfondo, avanzamentoRitorno);
  }
  background(coloreSfondoCorrente);

  if (sopraParolaSpin() || sopraParolaDown()) {
    cursor('pointer');
  } else {
    cursor('default');
  }

  if (animazioneAvviata && !ritornoAvviato) {
    angoloSpirale += velocitaSpirale;
  }

  let posizioniX = [];
  let posizioniY = [];
  let dimensioniAttuali = [];
  let rotazioni = [];
  let curvaturaParole = [];
  let mezzeLarghezze = [];
  let mezzeAltezze = [];

  for (let i = 0; i < parole.length; i++) {
    if (
      animazioneAvviata &&
      !ritornoAvviato &&
      frameCount - frameAvvio >= attesaAccensione + ritardiAccensione[i]
    ) {
      paroleAccese[i] = true;
    }

    let ritardoFormazione = (parole.length - 1 - i) * ritardoTraParole;
    let progresso = 0;
    if (animazioneAvviata) {
      let avanzamento = constrain(
        (frameCount - frameAvvio - ritardoFormazione) /
          fotogrammiTransizione,
        0,
        1
      );
      let progressoAttuale =
        avanzamento * avanzamento * (3 - 2 * avanzamento);

      if (ritornoAvviato) {
        let avanzamentoInizioRitorno = constrain(
          (frameRitorno - frameAvvio - ritardoFormazione) /
            fotogrammiTransizione,
          0,
          1
        );
        let progressoInizioRitorno =
          avanzamentoInizioRitorno *
          avanzamentoInizioRitorno *
          (3 - 2 * avanzamentoInizioRitorno);
        let avanzamentoRitornoParola = constrain(
          (frameCount - frameRitorno - i * ritardoTraParole) /
            fotogrammiTransizione,
          0,
          1
        );
        avanzamentoRitornoParola =
          avanzamentoRitornoParola *
          avanzamentoRitornoParola *
          (3 - 2 * avanzamentoRitornoParola);
        progresso = lerp(
          progressoInizioRitorno,
          0,
          avanzamentoRitornoParola
        );
      } else {
        progresso = progressoAttuale;
      }
    }

    let angolo = angoloSpirale + scartiAngolari[i];
    let orbitaX = larghezzaTela / 2 + raggi[i] * cos(angolo);
    let orbitaY = altezzaTela / 2 + raggi[i] * sin(angolo);

    let x = lerp(posizioniInizialiX[i], orbitaX, progresso);
    let y = lerp(posizioniInizialiY[i], orbitaY, progresso);
    let dimensione = lerp(dimensioneIniziale, dimensioni[i], progresso);
    let inclinazione;
    if (i === parole.length - 1) {
      // all'estremità, stimo la tangente proseguendo la curva dai due punti precedenti
      let angoloPrecedente = angoloSpirale + scartiAngolari[i - 1];
      let angoloPrimaDelPrecedente = angoloSpirale + scartiAngolari[i - 2];
      let xPrecedente =
        larghezzaTela / 2 + raggi[i - 1] * cos(angoloPrecedente);
      let yPrecedente =
        altezzaTela / 2 + raggi[i - 1] * sin(angoloPrecedente);
      let xPrimaDelPrecedente =
        larghezzaTela / 2 +
        raggi[i - 2] * cos(angoloPrimaDelPrecedente);
      let yPrimaDelPrecedente =
        altezzaTela / 2 +
        raggi[i - 2] * sin(angoloPrimaDelPrecedente);
      inclinazione = atan2(
        3 * orbitaY - 4 * yPrecedente + yPrimaDelPrecedente,
        3 * orbitaX - 4 * xPrecedente + xPrimaDelPrecedente
      );
    } else {
      let indicePrecedente = max(i - 1, 0);
      let indiceSuccessivo = min(i + 1, parole.length - 1);
      let angoloPrecedente =
        angoloSpirale + scartiAngolari[indicePrecedente];
      let angoloSuccessivo =
        angoloSpirale + scartiAngolari[indiceSuccessivo];
      let xPrecedente =
        larghezzaTela / 2 + raggi[indicePrecedente] * cos(angoloPrecedente);
      let yPrecedente =
        altezzaTela / 2 + raggi[indicePrecedente] * sin(angoloPrecedente);
      let xSuccessivo =
        larghezzaTela / 2 + raggi[indiceSuccessivo] * cos(angoloSuccessivo);
      let ySuccessivo =
        altezzaTela / 2 + raggi[indiceSuccessivo] * sin(angoloSuccessivo);
      inclinazione = atan2(
        ySuccessivo - yPrecedente,
        xSuccessivo - xPrecedente
      );
    }
    let rotazione = inclinazione * progresso;

    push();
    textSize(dimensione);
    textStyle(parole[i] === parolaDaCliccare ? BOLD : NORMAL);
    posizioniX.push(x);
    posizioniY.push(y);
    dimensioniAttuali.push(dimensione);
    rotazioni.push(rotazione);
    // durante lo spostamento la curvatura cresce con progresso; le parole
    // più esterne si arcuano di più per seguire il tratto largo della spirale
    curvaturaParole.push(
      -lerp(
        curvaturaParolaInterna,
        curvaturaParolaEsterna,
        pow(scaleDalCentro[i], esponenteEsterno)
      ) * progresso
    );
    mezzeLarghezze.push(fontWidth(parole[i]) / 2);
    mezzeAltezze.push(dimensione / 2);
    pop();
  }

  posizioniVisualiX = posizioniX;
  posizioniVisualiY = posizioniY;
  raggiCliccabili = [];
  for (let i = 0; i < parole.length; i++) {
    raggiCliccabili.push(
      sqrt(
        mezzeLarghezze[i] * mezzeLarghezze[i] +
        mezzeAltezze[i] * mezzeAltezze[i]
      )
    );
  }

  let indiceHoverCorrente = -1;
  for (let i = 0; i < parole.length; i++) {
    push();
    textSize(dimensioniAttuali[i]);
    textStyle(parole[i] === parolaDaCliccare ? BOLD : NORMAL);

    if (
      indiceHoverCorrente < 0 &&
      animazioneAvviata &&
      !ritornoAvviato &&
      dist(mouseX, mouseY, posizioniX[i], posizioniY[i]) < raggiCliccabili[i]
    ) {
      indiceHoverCorrente = i;
      paroleAccese[i] = true;
      cursor('pointer');
      if (indiceHoverPrecedente !== i) {
        coloriPartenzaParole[i] = coloriParole[i];
        coloriObiettivoParole[i] = color(
          coloriNeon[indiceProssimoColoreNeon]
        );
        frameCambioColore[i] = frameCount;
        indiceProssimoColoreNeon =
          (indiceProssimoColoreNeon + 1) % coloriNeon.length;
      }
    }

    let avanzamentoCambioColore = constrain(
      (frameCount - frameCambioColore[i]) / durataCambioColore,
      0,
      1
    );
    avanzamentoCambioColore =
      avanzamentoCambioColore *
      avanzamentoCambioColore *
      (3 - 2 * avanzamentoCambioColore);
    coloriParole[i] = lerpColor(
      coloriPartenzaParole[i],
      coloriObiettivoParole[i],
      avanzamentoCambioColore
    );

    translate(posizioniX[i], posizioniY[i]);
    rotate(rotazioni[i]);
    if (paroleAccese[i]) {
      drawingContext.shadowColor = coloriParole[i].toString();
      drawingContext.shadowBlur =
        intensitaBagliore * (1 - avanzamentoRitorno);
      fill(
        lerpColor(
          coloriParole[i],
          color(coloreInchiostro),
          avanzamentoRitorno
        )
      );
    } else {
      drawingContext.shadowBlur = 0;
      let coloreTesto = animazioneAvviata
        ? coloreTestoAttivo
        : coloreInchiostro;
      if (ritornoAvviato) {
        coloreTesto = lerp(
          coloreTestoAttivo,
          coloreInchiostro,
          avanzamentoRitorno
        );
      }
      fill(coloreTesto);
    }
    disegnaParolaCurva(parole[i], curvaturaParole[i]);
    pop();
  }
  indiceHoverPrecedente = indiceHoverCorrente;

  if (ritornoAvviato && avanzamentoRitorno >= 1) {
    animazioneAvviata = false;
    ritornoAvviato = false;
    paroleAccese.fill(false);
    coloriParole.fill(color(coloreNeon));
    coloriPartenzaParole = coloriParole.slice();
    coloriObiettivoParole = coloriParole.slice();
    frameCambioColore.fill(0);
    indiceHoverPrecedente = -1;
    indiceProssimoColoreNeon = 0;
    frameAvvio = 0;
    frameRitorno = 0;
  }
}

function disegnaParolaCurva(parola, curvatura) {
  // dispone ogni carattere lungo una porzione curva della parola
  let avanzamentiCaratteri = [];
  let prefisso = '';
  let larghezzaPrecedente = 0;

  for (let i = 0; i < parola.length; i++) {
    prefisso += parola[i];
    let larghezzaPrefisso = fontWidth(prefisso);
    avanzamentiCaratteri.push(larghezzaPrefisso - larghezzaPrecedente);
    larghezzaPrecedente = larghezzaPrefisso;
  }

  let posizioneX = -larghezzaPrecedente / 2;
  for (let i = 0; i < parola.length; i++) {
    let larghezzaCarattere = avanzamentiCaratteri[i];
    let distanzaDalCentro = posizioneX + larghezzaCarattere / 2;
    let angoloLocale = curvatura * distanzaDalCentro;
    let xLocale = distanzaDalCentro;
    let yLocale = 0;

    if (abs(curvatura) >= 0.0001) {
      xLocale = sin(angoloLocale) / curvatura;
      yLocale = (1 - cos(angoloLocale)) / curvatura;
    }

    push();
    translate(xLocale, yLocale);
    rotate(angoloLocale);
    text(parola[i], 0, 0);
    pop();

    posizioneX += larghezzaCarattere;
  }
}

// il clic vale solo finché la frase è ancora ferma
function sopraParolaSpin() {
  if (animazioneAvviata) return false;

  let i = parole.indexOf(parolaDaCliccare);
  if (i < 0) return false;

  let mezzaLarghezza = larghezzaParolaDaCliccare / 2 + 5;
  let mezzaAltezza = dimensioneIniziale * 0.4;

  return abs(mouseX - posizioniInizialiX[i]) < mezzaLarghezza &&
    abs(mouseY - posizioniInizialiY[i]) < mezzaAltezza;
}

function sopraParolaDown() {
  if (!animazioneAvviata || ritornoAvviato) return false;

  for (let i = 0; i < parole.length; i++) {
    if (parole[i] !== parolaPerRipristino) continue;
    if (
      posizioniVisualiX[i] !== undefined &&
      dist(mouseX, mouseY, posizioniVisualiX[i], posizioniVisualiY[i]) <
        raggiCliccabili[i]
    ) {
      return true;
    }
  }

  return false;
}

function mousePressed() {
  if (sopraParolaSpin()) {
    animazioneAvviata = true;
    frameAvvio = frameCount;
  } else if (sopraParolaDown()) {
    ritornoAvviato = true;
    frameRitorno = frameCount;
  }
}
