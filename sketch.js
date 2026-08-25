let writer;
let jugando = false;
let terminoJuego = false;
let tiempoRestante = 15;
let ultimoTiempo = 0;
let tiempoFinalizado = 0;

const DURACION_JUEGO = 15;
const DURACION_ESPERA = 3;

// Sonidos sinteticos
let oscTic, oscExito;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(245);

  // Boton para conectar Arduino via Web Serial Nativo
  let btnConectar = createButton('Conectar Arduino');
  btnConectar.position(10, 10);
  btnConectar.style('padding', '10px');
  btnConectar.style('z-index', '10');
  btnConectar.mousePressed(conectarArduino);

  // Sintetizadores de Audio
  oscTic = new p5.Oscillator('sine');
  oscExito = new p5.Oscillator('triangle');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(245);
}

// Funcion nativa para abrir el puerto Serie
async function conectarArduino() {
  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    writer = port.writable.getWriter();
    console.log("Arduino conectado con exito");
  } catch (err) {
    console.error("Error al conectar Serie:", err);
  }
}

// Funcion auxiliar para enviar caracteres al Arduino
async function enviarComando(letra) {
  if (writer) {
    try {
      const data = new TextEncoder().encode(letra);
      await writer.write(data);
    } catch (e) {
      console.error("Error enviando comando:", e);
    }
  }
}

function draw() {
  if (mouseIsPressed && jugando && !terminoJuego) {
    stroke(40);
    strokeWeight(6);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }

  if (jugando && !terminoJuego && millis() - ultimoTiempo >= 1000) {
    ultimoTiempo = millis();
    tiempoRestante--;

    if (tiempoRestante > 0) {
      sonarTic();
      enviarComando('T'); // Activa destello del LED
    } else {
      jugando = false;
      terminoJuego = true;
      tiempoFinalizado = millis();
      sonarExito();
      enviarComando('G'); // Envia orden de Victoria al Arduino
    }
  }

  if (terminoJuego && millis() - tiempoFinalizado >= DURACION_ESPERA * 1000) {
    reiniciarJuego();
  }
}

function touchStarted(event) {
  // Previene interacción si tocamos el botón de conectar
  if (event && event.target && event.target.tagName === 'BUTTON') {
    return true;
  }

  // Activa el contexto de audio si estaba suspendido por el navegador
  userStartAudio();

  if (!jugando && !terminoJuego) {
    background(245);
    jugando = true;
    tiempoRestante = DURACION_JUEGO;
    ultimoTiempo = millis();
    sonarTic();
    enviarComando('T');
  }

  return false;
}

function reiniciarJuego() {
  jugando = false;
  terminoJuego = false;
  tiempoRestante = DURACION_JUEGO;
  tiempoFinalizado = 0;
  background(245);
  enviarComando('R'); // Reinicia el estado de los LEDs en el Arduino
}

// --- EFECTOS DE SONIDO ---
function sonarTic() {
  if (getAudioContext().state === 'running') {
    oscTic.freq(800);
    oscTic.start();
    oscTic.amp(0.3, 0.05);
    oscTic.stop(0.1);
  }
}

function sonarExito() {
  if (getAudioContext().state === 'running') {
    oscExito.freq(523.25);
    oscExito.start();
    oscExito.amp(0.4, 0.05);
    oscExito.freq(659.25, 0.2);
    oscExito.stop(0.5);
  }
}