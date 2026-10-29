// Base de datos de Circuitos Integrados y Componentes esenciales para ProtoLab
const PINOUTS_DATA = [
  {
    id: 'lm741',
    name: 'LM741',
    fullName: 'LM741CN Operacional Universal',
    category: 'opamp',
    package: 'DIP-8',
    description: 'El amplificador operacional de uso pedagógico por excelencia en laboratorios de ingeniería.',
    voltages: {
      min: '±5 V',
      typ: '±12 V a ±15 V',
      maxAbs: '±18 V (o 36V total)',
      warning: '¡Nunca excedas ±18V ni inviertas Pin 7 (+V) y Pin 4 (-V)!'
    },
    pins: [
      { num: 1, name: 'Offset Null', role: 'Calibración de offset', type: 'passive', side: 'left', desc: 'Ajuste de cero analógico. En la gran mayoría de prácticas de laboratorio se deja SIN CONECTAR (libre).' },
      { num: 2, name: 'Inverting (-)', role: 'Entrada inversora', type: 'signal', side: 'left', desc: 'Señal aplicada aquí sale invertida 180° en la salida (Pin 6). Se conecta con Rf.' },
      { num: 3, name: 'Non-Inverting (+)', role: 'Entrada no inversora', type: 'signal', side: 'left', desc: 'Señal aplicada aquí sale en fase con la misma polaridad en la salida (Pin 6).' },
      { num: 4, name: 'V- (Vee)', role: 'Alimentación Negativa', type: 'negative', side: 'left', desc: 'Conectar a la salida negativa de la fuente dual (ej. -12V) o a GND en fuente simple.' },
      { num: 5, name: 'Offset Null', role: 'Calibración de offset', type: 'passive', side: 'right', desc: 'Segundo terminal de compensación. Se deja libre / sin conectar.' },
      { num: 6, name: 'Output', role: 'Salida Analógica', type: 'signal', side: 'right', desc: 'Salida del amplificador operacional. Tensión máxima limitada por los rieles de alimentación.' },
      { num: 7, name: 'V+ (Vcc)', role: 'Alimentación Positiva', type: 'positive', side: 'right', desc: 'Conectar a la salida positiva de la fuente dual (ej. +12V o +15V).' },
      { num: 8, name: 'NC', role: 'No Conexión', type: 'passive', side: 'right', desc: 'Pin sin conexión interna física. Dejar siempre libre / flotante.' }
    ]
  },
  {
    id: 'ne555',
    name: 'NE555',
    fullName: 'NE555P Temporizador Universal',
    category: 'timer',
    package: 'DIP-8',
    description: 'Generador de temporización, pulsos, trenes de onda cuadrada y oscilaciones astables/monoestables.',
    voltages: {
      min: '4.5 V',
      typ: '5.0 V a 12 V',
      maxAbs: '16.0 V',
      warning: 'No alimentar con más de 16V. Con 5V es compatible con lógica digital TTL.'
    },
    pins: [
      { num: 1, name: 'GND', role: 'Tierra / Masa (0V)', type: 'ground', side: 'left', desc: 'Punto de referencia del circuito. Conectar al riel negativo (azul) de la protoboard.' },
      { num: 2, name: 'Trigger (Disparo)', role: 'Disparo de pulso', type: 'signal', side: 'left', desc: 'Dispara la temporización cuando su voltaje cae por debajo de 1/3 de Vcc.' },
      { num: 3, name: 'Output (Salida)', role: 'Salida de señal', type: 'signal', side: 'left', desc: 'Salida digital en nivel alto (~Vcc) o bajo (0V). Puede alimentar directamente un LED o relé (hasta 200mA).' },
      { num: 4, name: 'Reset', role: 'Reinicio activo en bajo', type: 'positive', side: 'left', desc: 'Si se lleva a 0V reinicia el timer. Para funcionamiento normal, DEBE conectarse a VCC (Pin 8).' },
      { num: 5, name: 'Control Voltage', role: 'Voltaje de control', type: 'passive', side: 'right', desc: 'Acceso al divisor resistivo interno (2/3 Vcc). Se recomienda desacoplar a tierra con capacitor de 10nF.' },
      { num: 6, name: 'Threshold (Umbral)', role: 'Comparador de fin de pulso', type: 'signal', side: 'right', desc: 'Finaliza el pulso cuando la tensión en este pin supera 2/3 de Vcc.' },
      { num: 7, name: 'Discharge (Descarga)', role: 'Descarga del capacitor', type: 'signal', side: 'right', desc: 'Colector abierto que descarga a masa el capacitor de temporización.' },
      { num: 8, name: 'VCC', role: 'Alimentación Positiva', type: 'positive', side: 'right', desc: 'Alimentación positiva (+4.5V a +15V). Típicamente conectado a +5V o +12V.' }
    ]
  },
  {
    id: 'lm358',
    name: 'LM358',
    fullName: 'LM358N Doble Amplificador Operacional',
    category: 'opamp',
    package: 'DIP-8',
    description: 'Contiene dos amplificadores operacionales independientes de bajo consumo que pueden operar con fuente simple (ej. solo +5V y GND).',
    voltages: {
      min: '3.0 V (o ±1.5V)',
      typ: '5.0 V o 12 V',
      maxAbs: '32.0 V (o ±16V)',
      warning: 'Ideal para usar con Arduino porque funciona perfecto con 5V sin necesidad de fuente dual negativa.'
    },
    pins: [
      { num: 1, name: 'Out 1', role: 'Salida Op-Amp 1', type: 'signal', side: 'left', desc: 'Salida analógica del primer amplificador operacional.' },
      { num: 2, name: 'In 1 (-)', role: 'Entrada Inversora 1', type: 'signal', side: 'left', desc: 'Entrada inversora del primer operacional.' },
      { num: 3, name: 'In 1 (+)', role: 'Entrada No Inversora 1', type: 'signal', side: 'left', desc: 'Entrada no inversora del primer operacional.' },
      { num: 4, name: 'GND / V-', role: 'Tierra o Masa', type: 'ground', side: 'left', desc: 'Conectar a tierra (0V) en alimentación simple, o a -Vcc en fuente dual.' },
      { num: 5, name: 'In 2 (+)', role: 'Entrada No Inversora 2', type: 'signal', side: 'right', desc: 'Entrada no inversora del segundo operacional.' },
      { num: 6, name: 'In 2 (-)', role: 'Entrada Inversora 2', type: 'signal', side: 'right', desc: 'Entrada inversora del segundo operacional.' },
      { num: 7, name: 'Out 2', role: 'Salida Op-Amp 2', type: 'signal', side: 'right', desc: 'Salida analógica del segundo amplificador operacional.' },
      { num: 8, name: 'VCC / V+', role: 'Alimentación Positiva', type: 'positive', side: 'right', desc: 'Alimentación positiva común para ambos amplificadores (+3V a +32V).' }
    ]
  },
  {
    id: 'lm7805',
    name: 'LM7805',
    fullName: 'LM7805 Regulador Lineal de +5V',
    category: 'regulator',
    package: 'TO-220',
    description: 'Regulador de voltaje positivo de 3 terminales. Convierte cualquier voltaje mayor (ej. 7V a 20V) en 5V estables y fijos.',
    voltages: {
      min: '7.0 V (Vin mínimo para regular)',
      typ: '9.0 V a 12.0 V de entrada',
      maxAbs: '35.0 V Vin Máximo',
      warning: 'Requiere disipador de calor si la corriente supera los 300mA o la diferencia de voltaje es muy alta.'
    },
    pins: [
      { num: 1, name: 'Input (Vin)', role: 'Entrada de Voltaje sin regular', type: 'positive', side: 'left', desc: 'Conectar a la fuente de entrada no regulada (+7V a +20V).' },
      { num: 2, name: 'GND (Masa)', role: 'Tierra común', type: 'ground', side: 'left', desc: 'Conectado también a la pestaña metálica trasera de refrigeración.' },
      { num: 3, name: 'Output (Vout)', role: 'Salida Regulada +5V', type: 'signal', side: 'right', desc: 'Entrega exactamente +5.0V regulados para tu protoboard.' }
    ]
  },
  {
    id: '2n2222',
    name: '2N2222',
    fullName: '2N2222A Transistor BJT NPN',
    category: 'transistor',
    package: 'TO-92',
    description: 'Transistor bipolar NPN estándar de silicio para conmutación rápida (switches) y amplificación de propósito general.',
    voltages: {
      min: '0.7 V (Vbe activación)',
      typ: 'Vce = 5V a 12V',
      maxAbs: 'Vceo = 40V / Ic = 800mA',
      warning: 'Siempre coloca una resistencia en la base (ej. 1kΩ); si conectas la base directo a 5V lo quemarás.'
    },
    pins: [
      { num: 1, name: 'Emisor (E)', role: 'Salida hacia masa', type: 'ground', side: 'left', desc: 'Viendo la cara plana del TO-92 de frente: Pin 1 es el Emisor.' },
      { num: 2, name: 'Base (B)', role: 'Terminal de control', type: 'signal', side: 'left', desc: 'Pin central. Requiere resistor limitador (1kΩ - 10kΩ) para no destruirlo.' },
      { num: 3, name: 'Colector (C)', role: 'Entrada de corriente de carga', type: 'positive', side: 'right', desc: 'Conecta a la carga (bobina de relé, motor, LED) que va hacia positivo.' }
    ]
  }
];
