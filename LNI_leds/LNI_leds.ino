// Se ajustaron los pines segun tu conexion fisica:
const int ledVerde = 8;  // LED Verde en el pin 8
const int ledRojo = 9;   // LED Rojo en el pin 9

char comando = ' ';

// Tiempos sin bloqueos (Sin delay)
unsigned long tiempoEstado = 0;
unsigned long tiempoTic = 0;
const unsigned long TIEMPO_MOSTRAR = 4000; // 4 segundos de resultado
const unsigned long DURACION_TIC = 80;    // 80 ms dura el destello del tic

bool mostrarResultado = false;
bool ticActivo = false;

void setup() {
  Serial.begin(9600);
  
  pinMode(ledVerde, OUTPUT);
  pinMode(ledRojo, OUTPUT);
  
  apagarLeds();
}

void loop() {
  unsigned long tiempoActual = millis();

  // 1. Lectura de comandos enviados por p5.js
  if (Serial.available() > 0) {
    comando = Serial.read();

    if (comando == 'T' && !mostrarResultado) {
      // Activa el destello del LED ROJO (Pin 9)
      digitalWrite(ledRojo, HIGH);
      tiempoTic = tiempoActual;
      ticActivo = true;
    } 
    else if (comando == 'G') {
      // Estado de Victoria: LED VERDE (Pin 8) encendido fijo
      apagarLeds();
      digitalWrite(ledVerde, HIGH);
      tiempoEstado = tiempoActual;
      mostrarResultado = true;
    } 
    else if (comando == 'P') {
      // Estado de Derrota: LED ROJO (Pin 9) encendido fijo
      apagarLeds();
      digitalWrite(ledRojo, HIGH);
      tiempoEstado = tiempoActual;
      mostrarResultado = true;
    } 
    else if (comando == 'R') {
      // Reinicio: Apaga los LEDs
      apagarLeds();
      mostrarResultado = false;
    }
  }

  // 2. Apagar el destello del Tic (LED rojo)
  if (ticActivo && (tiempoActual - tiempoTic >= DURACION_TIC)) {
    if (!mostrarResultado) {
      digitalWrite(ledRojo, LOW);
    }
    ticActivo = false;
  }

  // 3. Apagar LEDs tras cumplir los 4 segundos
  if (mostrarResultado && (tiempoActual - tiempoEstado >= TIEMPO_MOSTRAR)) {
    apagarLeds();
    mostrarResultado = false;
  }
}

void apagarLeds() {
  digitalWrite(ledVerde, LOW);
  digitalWrite(ledRojo, LOW);
  ticActivo = false;
}