// Base de datos de Circuitos Integrados, Transistores, Sensores y Componentes esenciales para ProtoLab
const PINOUTS_DATA = [
  {
    id: 'lm7805',
    name: 'LM7805',
    typeCategoryLabel: 'Regulador Lineal de Voltaje Fijo (+5V DC)',
    fullName: 'LM7805 - Regulador Lineal Positivo de +5.0V',
    category: 'regulator',
    package: 'TO-220',
    description: 'Regulador lineal de 3 terminales. Recibe voltajes variables mayores (ej. 7V a 24V de una batería o fuente) y los convierte en +5.0V DC fijos y estables.',
    voltages: {
      min: '7.0 V (Vin mínimo recomendado para estabilizar)',
      typ: '9.0 V a 12.0 V de entrada para entregar 5.0V',
      maxAbs: '35.0 V Vin Máximo | Corriente máx: 1.0 A',
      warning: 'Si la diferencia entre Vin y 5V es grande o consumes más de 200mA, el regulador se calentará mucho: usa un disipador de aluminio en la pestaña.'
    },
    pins: [
      { num: 1, name: 'IN (Entrada)', role: 'Voltaje de Entrada Vin (+7V a +24V)', type: 'positive', side: 'left', desc: 'Conectar a la fuente de voltaje positiva que deseas regular. Se recomienda colocar un capacitor de 100µF entre este pin y GND.' },
      { num: 2, name: 'GND (Masa)', role: 'Tierra / Referencia Común', type: 'ground', side: 'center', desc: 'Punto negativo de referencia (0V). Está conectado internamente a la pestaña metálica trasera de fijación.' },
      { num: 3, name: 'OUT (Salida)', role: 'Voltaje Regulado Fijo (+5.0V)', type: 'signal', side: 'right', desc: 'Salida limpia y regulada a 5V para alimentar protoboards, Arduinos, microcontroladores y circuitos lógicos.' }
    ]
  },
  {
    id: 'lm7812',
    name: 'LM7812',
    typeCategoryLabel: 'Regulador Lineal de Voltaje Fijo (+12V DC)',
    fullName: 'LM7812 - Regulador Lineal Positivo de +12.0V',
    category: 'regulator',
    package: 'TO-220',
    description: 'Regulador lineal estándar para rieles de alimentación de 12V. Ideal para alimentar motores pequeños, relevadores o amplificadores operacionales.',
    voltages: {
      min: '14.5 V (Vin mínimo de entrada)',
      typ: '15.0 V a 18.0 V de entrada para entregar 12.0V',
      maxAbs: '35.0 V Vin Máximo | Corriente máx: 1.0 A',
      warning: 'Requiere al menos 2.5V por encima de la salida para mantener los 12V estables (dropout voltage).'
    },
    pins: [
      { num: 1, name: 'IN (Entrada)', role: 'Voltaje de Entrada Vin (+14.5V a +28V)', type: 'positive', side: 'left', desc: 'Conectar a la fuente de continua sin regular.' },
      { num: 2, name: 'GND (Masa)', role: 'Tierra / Referencia Común', type: 'ground', side: 'center', desc: 'Conectar a la masa común (0V).' },
      { num: 3, name: 'OUT (Salida)', role: 'Voltaje Regulado Fijo (+12.0V)', type: 'signal', side: 'right', desc: 'Salida fija a 12V DC con protección térmica interna.' }
    ]
  },
  {
    id: '2n2222',
    name: '2N2222A',
    typeCategoryLabel: 'Transistor Bipolar BJT NPN (Conmutación y Driver)',
    fullName: '2N2222A - Transistor NPN de Propósito General',
    category: 'transistor',
    package: 'TO-92',
    description: 'El transistor NPN más utilizado para actuar como interruptor electrónico (controlar relés, zumbadores, motores pequeños o LEDs de alta potencia desde una salida digital).',
    voltages: {
      min: 'Vbe = 0.65 V a 0.7 V (umbral de activación en base)',
      typ: 'Vce = 5V a 12V en corte/saturación',
      maxAbs: 'Vceo = 40V | Ic máximo = 800 mA',
      warning: '¡REGLA FUNDAMENTAL! Nunca conectes la BASE (Pin 2) directamente a +5V sin una resistencia limitadora (ej. 1 kΩ o 2.2 kΩ), de lo contrario se destruirá de inmediato.'
    },
    pins: [
      { num: 1, name: 'E (Emisor)', role: 'Salida de corriente hacia GND', type: 'ground', side: 'left', desc: 'Mirando la cara plana del encapsulado de frente: Pin 1 es el Emisor. Se conecta al riel negativo o masa (GND).' },
      { num: 2, name: 'B (Base)', role: 'Terminal de control (Disparo)', type: 'signal', side: 'center', desc: 'Pin central. Una pequeña corriente que entra por aquí permite pasar una corriente grande entre Colector y Emisor.' },
      { num: 3, name: 'C (Colector)', role: 'Entrada de corriente de la carga', type: 'positive', side: 'right', desc: 'Pin derecho. Se conecta al negativo de la carga que quieres activar (motor, bobina de relé, etc.), cuyo positivo va a la fuente.' }
    ]
  },
  {
    id: 'bc547',
    name: 'BC547',
    typeCategoryLabel: 'Transistor Bipolar BJT NPN (Estándar Europeo de Audio y Baja Señal)',
    fullName: 'BC547B - Transistor NPN para Pequeña Señal',
    category: 'transistor',
    package: 'TO-92',
    description: 'Transistor de silicio de bajo ruido para amplificación de señales analógicas de sensores o audio y conmutación de baja corriente.',
    voltages: {
      min: 'Vbe = 0.65 V',
      typ: 'Vce = 5V a 15V',
      maxAbs: 'Vceo = 45V | Ic máximo = 100 mA',
      warning: '¡CUIDADO CON EL PINOUT! El orden de pines del BC547 europeo es C-B-E (Pin 1 Colector, Pin 3 Emisor), es decir, es INVERSO al 2N2222.'
    },
    pins: [
      { num: 1, name: 'C (Colector)', role: 'Entrada de Carga (Pin 1)', type: 'positive', side: 'left', desc: 'Viendo la cara plana de frente: Pin 1 es el Colector (a diferencia del 2N2222).' },
      { num: 2, name: 'B (Base)', role: 'Terminal Central de Control', type: 'signal', side: 'center', desc: 'Pin central. Control de polarización con resistor de 10kΩ o 47kΩ.' },
      { num: 3, name: 'E (Emisor)', role: 'Salida a Tierra (Pin 3)', type: 'ground', side: 'right', desc: 'Pin derecho. Conectar a masa o tierra común.' }
    ]
  },
  {
    id: 'lm35',
    name: 'LM35',
    typeCategoryLabel: 'Sensor Analógico de Temperatura Lineal en Grados Celsius',
    fullName: 'LM35DZ - Sensor Calibrado en Grados Centígrados',
    category: 'sensor',
    package: 'TO-92',
    description: 'Sensor de temperatura de precisión integrado. Entrega una tensión analógica perfectamente proporcional a la temperatura ambiente: 10 mV por cada 1 °C (a 25 °C entrega 250 mV).',
    voltages: {
      min: '4.0 V DC (Alimentación)',
      typ: '5.0 V DC (Típico para Arduino/ADC)',
      maxAbs: '30.0 V DC | Rango de medición: 0 °C a 100 °C',
      warning: 'Cuidado con conectar los pines al revés: si intercambias +Vs y GND se calienta al punto de quemar los dedos en pocos segundos.'
    },
    pins: [
      { num: 1, name: '+Vs (Alimentación)', role: 'Alimentación Positiva (+4V a +20V)', type: 'positive', side: 'left', desc: 'Viendo la cara plana de frente: Pin 1 es la alimentación positiva (conectar a +5V).' },
      { num: 2, name: 'Vout (Salida)', role: 'Salida Analógica (10 mV / °C)', type: 'signal', side: 'center', desc: 'Tensión lineal resultante. Mide con multímetro o conéctalo al pin A0 de un microcontrolador.' },
      { num: 3, name: 'GND (Masa)', role: 'Tierra (0V)', type: 'ground', side: 'right', desc: 'Pin 3 derecho: Conectar al riel negativo (tierra común).' }
    ]
  },
  {
    id: 'lm741',
    name: 'LM741',
    typeCategoryLabel: 'Amplificador Operacional Universal de Propósito General',
    fullName: 'LM741CN - Amplificador Operacional DIP-8',
    category: 'opamp',
    package: 'DIP-8',
    description: 'El amplificador operacional más emblemático de la enseñanza de ingeniería. Requiere típicamente fuente de alimentación dual simétrica (ej. ±12V o ±15V).',
    voltages: {
      min: '±5.0 V (o 10V total)',
      typ: '±12.0 V a ±15.0 V DC (Alimentación dual)',
      maxAbs: '±18.0 V (o 36V entre rieles)',
      warning: '¡Nunca apliques tensión invertida en Pin 7 (+V) y Pin 4 (-V)! Destruye el chip casi al instante.'
    },
    pins: [
      { num: 1, name: 'Offset Null 1', role: 'Calibración de balance cero', type: 'passive', side: 'left', desc: 'Ajuste de offset de entrada. En el 95% de las prácticas de laboratorio se deja SIN CONECTAR (libre).' },
      { num: 2, name: 'Inverting (-)', role: 'Entrada inversora (-)', type: 'signal', side: 'left', desc: 'La señal que entra por aquí se desfasa 180° en la salida. Se conecta a la resistencia Rf.' },
      { num: 3, name: 'Non-Inverting (+)', role: 'Entrada no inversora (+)', type: 'signal', side: 'left', desc: 'La señal entra en fase con la salida. Ideal para configuraciones seguidoras o no inversoras.' },
      { num: 4, name: 'V- (Alimentación -)', role: 'Riel Negativo de Fuente Dual', type: 'negative', side: 'left', desc: 'Conectar al terminal -12V o -15V de la fuente dual. En circuitos de fuente simple va a GND.' },
      { num: 5, name: 'Offset Null 2', role: 'Calibración de balance cero', type: 'passive', side: 'right', desc: 'Segundo terminal de compensación. Se deja libre / sin conectar.' },
      { num: 6, name: 'Output (Salida)', role: 'Salida de Señal Analógica', type: 'signal', side: 'right', desc: 'Salida de tensión del operacional. Su rango máximo está limitado por las tensiones de alimentación.' },
      { num: 7, name: 'V+ (Alimentación +)', role: 'Riel Positivo de Alimentación', type: 'positive', side: 'right', desc: 'Conectar al terminal positivo (+12V o +15V) de la fuente de poder.' },
      { num: 8, name: 'NC', role: 'Sin Conexión Interna', type: 'passive', side: 'right', desc: 'Terminal flotante. Dejar siempre libre sin cablear.' }
    ]
  },
  {
    id: 'ne555',
    name: 'NE555',
    typeCategoryLabel: 'Temporizador y Oscilador de Precisión Analógico',
    fullName: 'NE555P - Circuito Temporizador Universal',
    category: 'timer',
    package: 'DIP-8',
    description: 'Generador versátil de pulsos únicos (monoestable), trenes de ondas cuadradas (astable/reloj) y modulación PWM.',
    voltages: {
      min: '4.5 V DC',
      typ: '5.0 V a 12.0 V DC',
      maxAbs: '16.0 V DC (18V en versiones CMOS)',
      warning: 'Compatible con niveles lógicos de 5V. Soporta hasta 200mA en la salida para mover LEDs o relés directos.'
    },
    pins: [
      { num: 1, name: 'GND (Masa)', role: 'Tierra (0V)', type: 'ground', side: 'left', desc: 'Referencia de masa del circuito. Conectar al riel azul de la protoboard.' },
      { num: 2, name: 'Trigger (Disparo)', role: 'Disparo de ciclo temporizado', type: 'signal', side: 'left', desc: 'Dispara la temporización cuando el voltaje desciende por debajo de 1/3 de Vcc.' },
      { num: 3, name: 'Output (Salida)', role: 'Salida de pulso / onda cuadrada', type: 'signal', side: 'left', desc: 'Entrega la señal de salida. Puede entregar corriente a positivo o sumergirla a masa.' },
      { num: 4, name: 'Reset (Reinicio)', role: 'Reinicio activo en bajo', type: 'positive', side: 'left', desc: 'Para funcionamiento normal, DEBE conectarse directamente a VCC (Pin 8) para que no se apague.' },
      { num: 5, name: 'Control Voltage', role: 'Voltaje de control (2/3 Vcc)', type: 'passive', side: 'right', desc: 'Permite modular la frecuencia. Para uso normal, colocar un capacitor cerámico de 10nF a tierra o dejar flotante.' },
      { num: 6, name: 'Threshold (Umbral)', role: 'Comparador de fin de pulso', type: 'signal', side: 'right', desc: 'Finaliza el pulso temporizado cuando el capacitor se carga por encima de 2/3 de Vcc.' },
      { num: 7, name: 'Discharge (Descarga)', role: 'Descarga del capacitor', type: 'signal', side: 'right', desc: 'Conmutador a tierra que vacía el capacitor de temporización cuando termina el ciclo.' },
      { num: 8, name: 'VCC (Alimentación)', role: 'Alimentación Positiva (+5V a +15V)', type: 'positive', side: 'right', desc: 'Conectar al riel positivo (+5V o +12V).' }
    ]
  },
  {
    id: 'lm358',
    name: 'LM358',
    typeCategoryLabel: 'Doble Amplificador Operacional para Fuente Simple',
    fullName: 'LM358N - Operacional Dual de Bajo Consumo',
    category: 'opamp',
    package: 'DIP-8',
    description: 'Incluye dos amplificadores operacionales independientes que funcionan de maravilla con una sola fuente positiva (+5V y GND), sin requerir riel negativo.',
    voltages: {
      min: '3.0 V (o ±1.5V)',
      typ: '5.0 V o 12.0 V DC (Fuente simple)',
      maxAbs: '32.0 V (o ±16V)',
      warning: 'Es el amplificador más recomendado para proyectos de microcontroladores y sensores con Arduino de 5V.'
    },
    pins: [
      { num: 1, name: 'Out 1 (Salida 1)', role: 'Salida del Op-Amp 1', type: 'signal', side: 'left', desc: 'Salida amplificada del primer operacional.' },
      { num: 2, name: 'In 1- (Inversora 1)', role: 'Entrada Inversora 1', type: 'signal', side: 'left', desc: 'Entrada inversora del operacional 1.' },
      { num: 3, name: 'In 1+ (No Inversora)', role: 'Entrada No Inversora 1', type: 'signal', side: 'left', desc: 'Entrada de señal directa en fase para el operacional 1.' },
      { num: 4, name: 'GND / V-', role: 'Tierra Común (0V)', type: 'ground', side: 'left', desc: 'Conectar a tierra o riel negativo.' },
      { num: 5, name: 'In 2+ (No Inversora)', role: 'Entrada No Inversora 2', type: 'signal', side: 'right', desc: 'Entrada directa del segundo operacional.' },
      { num: 6, name: 'In 2- (Inversora 2)', role: 'Entrada Inversora 2', type: 'signal', side: 'right', desc: 'Entrada inversora del segundo operacional.' },
      { num: 7, name: 'Out 2 (Salida 2)', role: 'Salida del Op-Amp 2', type: 'signal', side: 'right', desc: 'Salida analógica del segundo operacional.' },
      { num: 8, name: 'VCC / V+', role: 'Alimentación Positiva (+5V a +30V)', type: 'positive', side: 'right', desc: 'Alimentación positiva compartida para ambos operacionales.' }
    ]
  },
  {
    id: '4n35',
    name: '4N35',
    typeCategoryLabel: 'Optoacoplador / Aislador Galvánico con Fototransistor',
    fullName: '4N35 - Optoaislador Óptico DIP-6',
    category: 'opto',
    package: 'DIP-6',
    description: 'Transmite señales eléctricas mediante un haz de luz infrarroja interno. Protege microcontroladores aislando ruidos inductivos de motores, relés y altas tensiones.',
    voltages: {
      min: 'Vf LED = 1.2 V a 1.5 V',
      typ: 'Corriente LED: 10 mA | Vce máx: 30V',
      maxAbs: 'Aislamiento galvánico: hasta 3550 V RMS',
      warning: 'Siempre coloca una resistencia en serie en el Ánodo (Pin 1) para alimentar el LED interno (ej. 220Ω para 5V).'
    },
    pins: [
      { num: 1, name: 'Ánodo LED (+)', role: 'Entrada Positiva del Fotodiodo', type: 'positive', side: 'left', desc: 'Pin 1: Ánodo del diodo emisor infrarrojo. Va con resistencia limitadora.' },
      { num: 2, name: 'Cátodo LED (-)', role: 'Entrada Negativa del Fotodiodo', type: 'ground', side: 'left', desc: 'Pin 2: Cátodo del emisor. Conectar a tierra del circuito de control.' },
      { num: 3, name: 'NC', role: 'Sin Conexión Interna', type: 'passive', side: 'left', desc: 'Dejar libre / flotante.' },
      { num: 4, name: 'E (Emisor)', role: 'Emisor del Fototransistor', type: 'ground', side: 'right', desc: 'Salida aislada conectada a la tierra del circuito de potencia.' },
      { num: 5, name: 'C (Colector)', role: 'Colector del Fototransistor', type: 'positive', side: 'right', desc: 'Salida aislada que va a la carga o con resistencia pull-up a Vcc secundario.' },
      { num: 6, name: 'B (Base)', role: 'Base del Fototransistor', type: 'passive', side: 'right', desc: 'Opcional para compensación o filtrado de ruido. Típicamente se deja sin conectar.' }
    ]
  },
  {
    id: '1n4007',
    name: '1N4007',
    typeCategoryLabel: 'Diodo Rectificador de Silicio (1000V / 1A)',
    fullName: '1N4007 - Diodo de Protección y Rectificación',
    category: 'diode',
    package: 'DO-41',
    description: 'Diodo de unión PN para permitir el paso de corriente en un solo sentido. Fundamental en mecatrónica como diodo "flyback" de protección en paralelo con bobinas de relés y motores.',
    voltages: {
      min: 'Caída directa Vf = ~0.7 V',
      typ: 'Corriente directa continua: hasta 1.0 A',
      maxAbs: 'Voltaje inverso máximo: 1000 V',
      warning: '¡REGLA DE POLARIDAD! La franja plateada dibujada en el cuerpo del diodo indica SIEMPRE el terminal Cátodo (-).'
    },
    pins: [
      { num: 1, name: 'Ánodo (+)', role: 'Terminal Positivo (Sin franja)', type: 'positive', side: 'left', desc: 'Terminal por donde entra la corriente directa. Es el lado de cuerpo negro liso.' },
      { num: 2, name: 'Cátodo (-)', role: 'Terminal Negativo (Con Franja Plateada)', type: 'ground', side: 'right', desc: 'Terminal marcado con la FRANJA BLANCA O PLATEADA. Por aquí sale la corriente.' }
    ]
  }
];
