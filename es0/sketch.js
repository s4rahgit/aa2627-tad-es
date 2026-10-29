const larghezzaCanvas = 800
const altezzaCanvas = 600
const diametroStellaIniziale = 50
const distanzaTraStelle = 4
const diametroMinimoStella = 1
const riduzioneDiametroStella = 0.5
const numeroPunteStella = 5
const proporzioneRaggioInterno = 0.45
const probabilitaCambioTono = 0.02
const massimoTono = 360
const saturazioneColore = 100
const luminositaColore = 40
const grigioContorno = 100
const grigioSfondo = 20

let tono
let ultimaStellaX
let ultimaStellaY
let diametroStellaCorrente
let mouseEraPremuto = false

function setup () {
  createCanvas(larghezzaCanvas, altezzaCanvas).parent('sketch-holder')
  colorMode(HSL)
  tono = random(massimoTono)
  background(grigioSfondo)
}

function disegnaStella (x, y, diametro) {
  const raggioEsterno = diametro / 2
  const raggioInterno = raggioEsterno * proporzioneRaggioInterno
  const numeroVertici = numeroPunteStella * 2

  beginShape()
  for (let i = 0; i < numeroVertici; i++) {
    const angolo = -HALF_PI + i * TWO_PI / numeroVertici
    const raggio = i % 2 === 0 ? raggioEsterno : raggioInterno
    vertex(x + cos(angolo) * raggio, y + sin(angolo) * raggio)
  }
  endShape(CLOSE)
}

function draw () {
  stroke(grigioContorno)

  if (mouseIsPressed) {
    if (!mouseEraPremuto) {
      diametroStellaCorrente = diametroStellaIniziale
      mouseEraPremuto = true
    }

    const x = constrain(mouseX, diametroStellaIniziale / 2, width - diametroStellaIniziale / 2)
    const y = constrain(mouseY, diametroStellaIniziale / 2, height - diametroStellaIniziale / 2)

    if (ultimaStellaX === undefined) {
      ultimaStellaX = x
      ultimaStellaY = y
      fill(tono, saturazioneColore, luminositaColore)
      disegnaStella(x, y, diametroStellaCorrente)
    } else {
      const distanza = dist(ultimaStellaX, ultimaStellaY, x, y)
      const numeroStelle = floor(distanza / distanzaTraStelle)
      const partenzaX = ultimaStellaX
      const partenzaY = ultimaStellaY

      for (let i = 1; i <= numeroStelle; i++) {
        const avanzamento = (i * distanzaTraStelle) / distanza
        ultimaStellaX = partenzaX + (x - partenzaX) * avanzamento
        ultimaStellaY = partenzaY + (y - partenzaY) * avanzamento
        fill(tono, saturazioneColore, luminositaColore)
        disegnaStella(ultimaStellaX, ultimaStellaY, diametroStellaCorrente)
        if (random() < probabilitaCambioTono) {
          tono = random(massimoTono)
        }
        diametroStellaCorrente = max(
          diametroMinimoStella,
          diametroStellaCorrente - riduzioneDiametroStella
        )
      }
    }
  } else {
    mouseEraPremuto = false
    ultimaStellaX = undefined
    ultimaStellaY = undefined
  }
}
