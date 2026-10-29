// Base de datos de circuitos básicos de laboratorio para ProtoLab
const CIRCUITS_DATA = [
  {
    id: 'led-resistor',
    code: 'CKT-01',
    category: 'diodos',
    title: 'LED con Resistencia Limitadora',
    difficulty: 'Principiante',
    voltage: '5.0V DC',
    time: '3 min',
    summary: 'Control de corriente para diodos emisores de luz mediante una resistencia en serie. Es el primer circuito básico de laboratorio.',
    bom: [
      { name: 'Diodo LED (5mm)', qty: '1 unidad', note: 'Pata larga = Ánodo (+), Pata corta = Cátodo (-)', icon: 'lightbulb', color: 'text-rose-500' },
      { name: 'Resistencia 220 Ω o 330 Ω (1/4 W)', qty: '1 unidad', note: 'Código: Rojo-Rojo-Marrón (220Ω) o Naranja-Naranja-Marrón (330Ω)', icon: 'resistor', color: 'text-amber-600' },
      { name: 'Fuente de Voltaje Regulada', qty: '5V DC', note: 'Verificar en pantalla antes de conectar', icon: 'bolt', color: 'text-blue-500' },
      { name: 'Cables jumper (Macho-Macho)', qty: '2 unidades', note: 'Rojo para positivo, Negro/Azul para masa', icon: 'cable', color: 'text-slate-600' },
      { name: 'Protoboard estándar', qty: '1 unidad', note: 'Líneas laterales para rieles de alimentación', icon: 'grid_view', color: 'text-emerald-600' }
    ],
    connections: [
      { step: 1, text: 'Conecta el cable rojo desde la salida +5V de la fuente al riel positivo (línea roja) de la protoboard.' },
      { step: 2, text: 'Conecta el cable negro desde GND (tierra) de la fuente al riel negativo (línea azul) de la protoboard.' },
      { step: 3, text: 'Inserta la pata larga del LED (ánodo) en una fila vacía (ej. fila 10) y la pata corta (cátodo) en otra fila diferente (ej. fila 11).' },
      { step: 4, text: 'Coloca un extremo de la resistencia de 220Ω en la fila 10 (con el ánodo) y el otro extremo en el riel positivo (+5V).' },
      { step: 5, text: 'Conecta un cable jumper desde la fila 11 (cátodo) directo al riel negativo (GND).' }
    ],
    pinoutGuide: [
      { pin: 'Ánodo (+)', connectsTo: 'Resistencia de 220Ω hacia +5V', type: 'positive' },
      { pin: 'Cátodo (-)', connectsTo: 'Riel de Masa (GND) mediante cable negro', type: 'ground' },
      { pin: 'Resistencia', connectsTo: 'En serie entre el riel positivo y el ánodo', type: 'passive' }
    ],
    warning: 'NUNCA conectes el LED directamente a los 5V sin resistencia. La corriente superará los 100mA y se quemará instantáneamente en menos de 1 segundo.',
    diagramType: 'led'
  },
  {
    id: 'voltage-divider',
    code: 'CKT-02',
    category: 'fuentes',
    title: 'Divisor de Voltaje Resistivo',
    difficulty: 'Principiante',
    voltage: '5.0V o 12V DC',
    time: '5 min',
    summary: 'Atenuador de tensión con dos resistencias en serie. Permite obtener un voltaje menor para entradas de microcontroladores o sensores.',
    bom: [
      { name: 'Resistencia R1 (10 kΩ, 1/4 W)', qty: '1 unidad', note: 'Marrón-Negro-Naranja-Dorado', icon: 'resistor', color: 'text-amber-600' },
      { name: 'Resistencia R2 (10 kΩ, 1/4 W)', qty: '1 unidad', note: 'Para reducir a la mitad exacta (5V -> 2.5V)', icon: 'resistor', color: 'text-amber-600' },
      { name: 'Fuente de alimentación (Vin)', qty: '5V a 12V', note: 'Voltaje de entrada a dividir', icon: 'bolt', color: 'text-blue-500' },
      { name: 'Cables jumper para protoboard', qty: '3 unidades', note: 'Vin, Vout (nodo central) y GND', icon: 'cable', color: 'text-slate-600' },
      { name: 'Multímetro digital', qty: '1 unidad', note: 'En escala de 20V DC para medir Vout', icon: 'speed', color: 'text-purple-500' }
    ],
    connections: [
      { step: 1, text: 'Alimenta los rieles superior e inferior de la protoboard con Vin (rojo) y GND (negro).' },
      { step: 2, text: 'Conecta un extremo de R1 al riel positivo (+Vin).' },
      { step: 3, text: 'Inserta el otro extremo de R1 en una fila libre (ej. fila 15). Este será el nodo de salida Vout.' },
      { step: 4, text: 'En la misma fila 15, conecta un extremo de R2.' },
      { step: 5, text: 'Conecta el otro extremo de R2 al riel negativo (GND).' },
      { step: 6, text: 'Mide con la punta roja del multímetro en la fila 15 y la punta negra en GND: deberías leer exactamente la mitad del voltaje de entrada.' }
    ],
    pinoutGuide: [
      { pin: 'Extremo R1', connectsTo: 'Riel positivo de entrada (+Vin)', type: 'positive' },
      { pin: 'Nodo Central (R1 y R2)', connectsTo: 'Salida de voltaje atenuado (Vout)', type: 'signal' },
      { pin: 'Extremo R2', connectsTo: 'Riel de masa (GND)', type: 'ground' }
    ],
    warning: 'Un divisor de voltaje solo sirve para señales de referencia o lectura de sensores; NO lo uses como fuente para alimentar motores o módulos que consuman mucha corriente.',
    diagramType: 'divider'
  },
  {
    id: 'opamp-non-inverting',
    code: 'CKT-03',
    category: 'opamps',
    title: 'Amplificador No Inversor (LM741)',
    difficulty: 'Intermedio',
    voltage: '±12V o ±15V (Dual)',
    time: '10 min',
    summary: 'Acondicionador de señal de alta impedancia con ganancia Av = 1 + (Rf / R1). Amplifica señales analógicas pequeñas sin invertir la fase.',
    bom: [
      { name: 'Circuito Integrado LM741 (DIP-8)', qty: '1 unidad', note: 'Cuidado con la orientación de la muesca y Pin 1', icon: 'memory', color: 'text-purple-600' },
      { name: 'Resistencia de Realimentación Rf (10 kΩ)', qty: '1 unidad', note: 'Conecta el Pin 6 (salida) con el Pin 2 (-)', icon: 'resistor', color: 'text-amber-600' },
      { name: 'Resistencia de Entrada R1 (1 kΩ)', qty: '1 unidad', note: 'Define la ganancia: Av = 1 + (10k / 1k) = 11', icon: 'resistor', color: 'text-amber-600' },
      { name: 'Fuente Dual de Laboratorio', qty: '±12V DC', note: '+12V a Pin 7, -12V a Pin 4, Tierra al común', icon: 'bolt', color: 'text-blue-500' },
      { name: 'Cables jumper variados', qty: '6 unidades', note: 'Señal de entrada Vin hacia el Pin 3 (+)', icon: 'cable', color: 'text-slate-600' }
    ],
    connections: [
      { step: 1, text: 'Inserta el chip LM741 montado sobre la ranura divisoria central de la protoboard, con la muesca hacia la izquierda o arriba.' },
      { step: 2, text: 'Alimentación positiva: Conecta +12V directamente al Pin 7 del integrado.' },
      { step: 3, text: 'Alimentación negativa: Conecta -12V directamente al Pin 4 del integrado.' },
      { step: 4, text: 'Conecta la resistencia Rf (10kΩ) entre el Pin 6 (salida) y el Pin 2 (entrada inversora).' },
      { step: 5, text: 'Conecta la resistencia R1 (1kΩ) desde el Pin 2 hacia la tierra común (GND).' },
      { step: 6, text: 'Aplica tu señal de entrada analógica (ej. 0.5V) en el Pin 3 (entrada no inversora).' },
      { step: 7, text: 'La señal amplificada saldrá por el Pin 6 respecto a tierra.' }
    ],
    pinoutGuide: [
      { pin: 'Pin 7 (V+)', connectsTo: 'Fuente positiva (+12V)', type: 'positive' },
      { pin: 'Pin 4 (V-)', connectsTo: 'Fuente negativa (-12V)', type: 'negative' },
      { pin: 'Pin 3 (In+)', connectsTo: 'Señal de entrada Vin a amplificar', type: 'signal' },
      { pin: 'Pin 2 (In-)', connectsTo: 'Nodo entre Rf y R1', type: 'signal' },
      { pin: 'Pin 6 (Out)', connectsTo: 'Salida de señal amplificada Vout', type: 'signal' },
      { pin: 'Pines 1, 5, 8', connectsTo: 'Dejar sin conectar (Offset Null y NC)', type: 'passive' }
    ],
    warning: '¡Cuidado con la alimentación dual! Si intercambias el Pin 7 (+12V) con el Pin 4 (-12V), el chip se calentará de inmediato y quedará inservible.',
    diagramType: 'opamp'
  },
  {
    id: 'timer-555-monostable',
    code: 'CKT-04',
    category: 'timers',
    title: 'Temporizador 555 Monoestable',
    difficulty: 'Intermedio',
    voltage: '5.0V a 12V DC',
    time: '8 min',
    summary: 'Generador de pulso único temporizado. Al presionar un pulsador, la salida se activa durante un tiempo T = 1.1 · R · C y luego vuelve a reposo.',
    bom: [
      { name: 'Circuito Integrado NE555 (DIP-8)', qty: '1 unidad', note: 'El temporizador universal más usado en el mundo', icon: 'memory', color: 'text-purple-600' },
      { name: 'Capacitor Electrolítico C1 (10 µF / 16V)', qty: '1 unidad', note: 'Observa la polaridad: franja blanca hacia tierra', icon: 'battery_charging_full', color: 'text-cyan-600' },
      { name: 'Resistencia de Temporización R (100 kΩ)', qty: '1 unidad', note: 'Da un pulso de aproximadamente 1.1 segundos', icon: 'resistor', color: 'text-amber-600' },
      { name: 'Pulsador normalmente abierto (Push button)', qty: '1 unidad', note: 'Para disparar el pulso hacia masa en Pin 2', icon: 'touch_app', color: 'text-emerald-600' },
      { name: 'LED testigo y resistencia de 330 Ω', qty: '1 de c/u', note: 'Conectados en el Pin 3 para ver el pulso encenderse', icon: 'lightbulb', color: 'text-rose-500' }
    ],
    connections: [
      { step: 1, text: 'Coloca el NE555 a horcajadas en el canal central de la protoboard.' },
      { step: 2, text: 'Conecta el Pin 8 (VCC) y el Pin 4 (Reset) al riel positivo (+5V).' },
      { step: 3, text: 'Conecta el Pin 1 (GND) al riel negativo (tierra).' },
      { step: 4, text: 'Une con un cable corto el Pin 6 (Threshold) con el Pin 7 (Discharge).' },
      { step: 5, text: 'Conecta la resistencia de 100kΩ desde el riel positivo (+5V) hacia el Pin 7.' },
      { step: 6, text: 'Conecta el polo positivo del capacitor de 10µF al Pin 6 y el polo negativo (franja blanca) a GND.' },
      { step: 7, text: 'Coloca una resistencia de 10kΩ desde +5V al Pin 2 (Pull-up) y el pulsador desde el Pin 2 a GND.' },
      { step: 8, text: 'Conecta el Pin 3 (Salida) al ánodo del LED testigo con su resistencia hacia GND.' }
    ],
    pinoutGuide: [
      { pin: 'Pin 8 (Vcc)', connectsTo: 'Riel positivo (+5V a +12V)', type: 'positive' },
      { pin: 'Pin 1 (GND)', connectsTo: 'Riel de tierra (GND)', type: 'ground' },
      { pin: 'Pin 4 (Reset)', connectsTo: 'Riel positivo para evitar reset accidental', type: 'positive' },
      { pin: 'Pin 2 (Trigger)', connectsTo: 'Pulsador de disparo hacia masa', type: 'signal' },
      { pin: 'Pin 3 (Output)', connectsTo: 'LED testigo con resistencia limitadora', type: 'signal' },
      { pin: 'Pines 6 y 7', connectsTo: 'Unidos entre sí hacia la red R-C temporizadora', type: 'signal' }
    ],
    warning: 'Verifica la polaridad del capacitor electrolítico. Conectarlo al revés puede hacer que se hinche o reviente al energizar el circuito.',
    diagramType: '555'
  }
];
