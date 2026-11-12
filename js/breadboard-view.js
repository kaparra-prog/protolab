// ==========================================================================
// ProtoLab - Visualizador Gráfico de Protoboard en SVG
// Representa una protoboard real de laboratorio con buses de alimentación (+/-),
// matriz de terminales A-J (filas 1 a 30) y montaje exacto de componentes
// para los circuitos CKT-01 a CKT-06.
// ==========================================================================

function renderBreadboardSvg(circuitId) {
  // Dimensiones base de la protoboard SVG
  const width = 860;
  const height = 440;
  
  // Coordenadas fijas de la protoboard
  // Riel superior:
  //   Línea Azul (GND): y = 35
  //   Línea Roja (+V):  y = 55
  // Matriz superior (A-E): y de 95 a 175 (paso 20px) -> Fila A=95, B=115, C=135, D=155, E=175
  // Canal central divisorio: y = 195 a 225 (centro 210)
  // Matriz inferior (F-J): y de 245 a 325 (paso 20px) -> Fila F=245, G=265, H=285, I=305, J=325
  // Riel inferior:
  //   Línea Roja (+V):  y = 365
  //   Línea Azul (GND): y = 385

  // Función helper para obtener coordenada X de una columna (fila de la protoboard 1 a 30)
  const colX = (col) => 90 + (col - 1) * 23.5;

  // Renderizar orificios estándar de fondo
  let pinHoles = '';
  // Orificios rieles superior e inferior
  for (let c = 1; c <= 30; c++) {
    const x = colX(c);
    // Riel superior GND y VCC
    pinHoles += `<circle cx="${x}" cy="35" r="2.8" class="fill-stone-300 dark:fill-stone-700"/>`;
    pinHoles += `<circle cx="${x}" cy="55" r="2.8" class="fill-stone-300 dark:fill-stone-700"/>`;
    // Matriz A-E
    for (let r = 0; r < 5; r++) {
      pinHoles += `<circle cx="${x}" cy="${95 + r * 20}" r="2.8" class="fill-stone-300 dark:fill-stone-700"/>`;
    }
    // Matriz F-J
    for (let r = 0; r < 5; r++) {
      pinHoles += `<circle cx="${x}" cy="${245 + r * 20}" r="2.8" class="fill-stone-300 dark:fill-stone-700"/>`;
    }
    // Riel inferior VCC y GND
    pinHoles += `<circle cx="${x}" cy="365" r="2.8" class="fill-stone-300 dark:fill-stone-700"/>`;
    pinHoles += `<circle cx="${x}" cy="385" r="2.8" class="fill-stone-300 dark:fill-stone-700"/>`;

    // Números de columna cada 5 filas
    if (c === 1 || c % 5 === 0) {
      pinHoles += `<text x="${x}" y="80" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9" class="fill-stone-400 font-bold">${c}</text>`;
      pinHoles += `<text x="${x}" y="350" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9" class="fill-stone-400 font-bold">${c}</text>`;
    }
  }

  // Letras de fila a la izquierda y derecha
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const rowYs = [95, 115, 135, 155, 175, 245, 265, 285, 305, 325];
  let letters = '';
  for (let i = 0; i < 10; i++) {
    letters += `<text x="65" y="${rowYs[i] + 3}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="10" class="fill-stone-400 font-bold">${rowLabels[i]}</text>`;
    letters += `<text x="${colX(30) + 25}" y="${rowYs[i] + 3}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="10" class="fill-stone-400 font-bold">${rowLabels[i]}</text>`;
  }

  // Componentes específicos superpuestos según el circuito
  let circuitOverlay = '';

  switch (circuitId) {
    case 'led-resistor':
      // CKT-01: LED con resistencia limitadora
      circuitOverlay = `
        <!-- Alimentación Cable Rojo Fuente -> Riel VCC Sup (Col 3) -->
        <path d="M 20 55 L ${colX(3)} 55" stroke="#EF4444" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <circle cx="${colX(3)}" cy="55" r="4.5" fill="#EF4444"/>
        <text x="25" y="47" font-family="'JetBrains Mono'" font-size="9" font-weight="bold" fill="#EF4444">+5V</text>

        <!-- Alimentación Cable Negro Fuente -> Riel GND Sup (Col 3) -->
        <path d="M 20 35 L ${colX(3)} 35" stroke="#2563EB" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <circle cx="${colX(3)}" cy="35" r="4.5" fill="#2563EB"/>
        <text x="25" y="27" font-family="'JetBrains Mono'" font-size="9" font-weight="bold" fill="#2563EB">GND</text>

        <!-- Resistencia 220 Ohm: Riel VCC (Col 10, y=55) a Fila A (Col 10, y=95) -->
        <!-- Patas metálicas -->
        <path d="M ${colX(10)} 55 L ${colX(10)} 65 L ${colX(10)} 85 L ${colX(10)} 95" stroke="#94A3B8" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(10)}" cy="55" r="4" fill="#94A3B8"/>
        <circle cx="${colX(10)}" cy="95" r="4" fill="#94A3B8"/>
        <!-- Cuerpo Resistor cerámico -->
        <rect x="${colX(10) - 7}" y="67" width="14" height="24" rx="4" fill="#E2D4C3" stroke="#C5B49E" stroke-width="1.5"/>
        <!-- Bandas: Rojo, Rojo, Marrón, Dorado -->
        <rect x="${colX(10) - 7}" y="71" width="14" height="2" fill="#DC2626"/>
        <rect x="${colX(10) - 7}" y="75" width="14" height="2" fill="#DC2626"/>
        <rect x="${colX(10) - 7}" y="79" width="14" height="2" fill="#78350F"/>
        <rect x="${colX(10) - 7}" y="85" width="14" height="2" fill="#D4AF37"/>
        <text x="${colX(10) + 14}" y="82" font-family="'JetBrains Mono'" font-size="9" font-weight="bold" fill="#B45309">R: 220Ω</text>

        <!-- Diodo LED: Ánodo en Col 10 (Fila E, y=175), Cátodo en Col 12 (Fila E, y=175) -->
        <!-- Pata Ánodo -->
        <path d="M ${colX(10)} 175 L ${colX(10.5)} 185 L ${colX(10.8)} 190" stroke="#CBD5E1" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(10)}" cy="175" r="4" fill="#94A3B8"/>
        <!-- Pata Cátodo -->
        <path d="M ${colX(12)} 175 L ${colX(11.5)} 185 L ${colX(11.2)} 190" stroke="#CBD5E1" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(12)}" cy="175" r="4" fill="#94A3B8"/>
        <!-- Lente del LED (5mm) -->
        <circle cx="${colX(11)}" cy="205" r="14" fill="#EF4444" opacity="0.9" stroke="#B91C1C" stroke-width="2"/>
        <circle cx="${colX(11) - 4}" cy="200" r="3.5" fill="#FFFFFF" opacity="0.6"/>
        <text x="${colX(11)}" y="235" text-anchor="middle" font-family="'Plus Jakarta Sans'" font-size="10" font-weight="bold" fill="#DC2626">LED 5mm</text>
        <text x="${colX(10) - 10}" y="172" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#DC2626">Ánodo (+)</text>
        <text x="${colX(12) + 15}" y="172" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#2563EB">Cátodo (-)</text>

        <!-- Cable Jumper: Cátodo Col 12 (Fila A, y=95) a Riel GND Sup (Col 12, y=35) -->
        <path d="M ${colX(12)} 95 Q ${colX(14)} 65 ${colX(12)} 35" stroke="#2563EB" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="${colX(12)}" cy="95" r="4" fill="#2563EB"/>
        <circle cx="${colX(12)}" cy="35" r="4" fill="#2563EB"/>
        <text x="${colX(12) + 8}" y="60" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#2563EB">Jumper a GND</text>
      `;
      break;

    case 'voltage-divider':
      // CKT-02: Divisor de Voltaje (R1 y R2)
      circuitOverlay = `
        <!-- Alimentación Vin -> Riel VCC Sup -->
        <path d="M 20 55 L ${colX(4)} 55" stroke="#EF4444" stroke-width="3.5" fill="none"/>
        <circle cx="${colX(4)}" cy="55" r="4.5" fill="#EF4444"/>
        <text x="25" y="47" font-family="'JetBrains Mono'" font-size="9" font-weight="bold" fill="#EF4444">+Vin (5-12V)</text>

        <!-- GND -> Riel GND Sup -->
        <path d="M 20 35 L ${colX(4)} 35" stroke="#2563EB" stroke-width="3.5" fill="none"/>
        <circle cx="${colX(4)}" cy="35" r="4.5" fill="#2563EB"/>
        <text x="25" y="27" font-family="'JetBrains Mono'" font-size="9" font-weight="bold" fill="#2563EB">GND (0V)</text>

        <!-- Resistencia R1 (10k): De Riel VCC (Col 12, y=55) a Fila C (Col 12, y=135) -->
        <path d="M ${colX(12)} 55 L ${colX(12)} 135" stroke="#94A3B8" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(12)}" cy="55" r="4" fill="#94A3B8"/>
        <circle cx="${colX(12)}" cy="135" r="4" fill="#94A3B8"/>
        <rect x="${colX(12) - 7}" y="80" width="14" height="26" rx="4" fill="#E2D4C3" stroke="#C5B49E" stroke-width="1.5"/>
        <rect x="${colX(12) - 7}" y="84" width="14" height="2" fill="#78350F"/>
        <rect x="${colX(12) - 7}" y="88" width="14" height="2" fill="#1C1917"/>
        <rect x="${colX(12) - 7}" y="92" width="14" height="2" fill="#EA580C"/>
        <rect x="${colX(12) - 7}" y="98" width="14" height="2" fill="#D4AF37"/>
        <text x="${colX(12) - 40}" y="97" font-family="'JetBrains Mono'" font-size="9" font-weight="bold" fill="#B45309">R1: 10kΩ</text>

        <!-- Nodo Vout (Fila C, Col 12) con punto de prueba -->
        <circle cx="${colX(12)}" cy="135" r="7" fill="#F59E0B" opacity="0.4"/>
        <text x="${colX(12) + 12}" y="139" font-family="'JetBrains Mono'" font-size="10" font-weight="bold" fill="#D97706">Nodo Vout (Salida)</text>

        <!-- Resistencia R2 (10k): De Fila C (Col 12, y=135) a Fila H (Col 12, y=285) cruzando canal -->
        <path d="M ${colX(12)} 135 L ${colX(12)} 285" stroke="#94A3B8" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(12)}" cy="285" r="4" fill="#94A3B8"/>
        <rect x="${colX(12) - 7}" y="195" width="14" height="26" rx="4" fill="#E2D4C3" stroke="#C5B49E" stroke-width="1.5"/>
        <rect x="${colX(12) - 7}" y="199" width="14" height="2" fill="#78350F"/>
        <rect x="${colX(12) - 7}" y="203" width="14" height="2" fill="#1C1917"/>
        <rect x="${colX(12) - 7}" y="207" width="14" height="2" fill="#EA580C"/>
        <rect x="${colX(12) - 7}" y="213" width="14" height="2" fill="#D4AF37"/>
        <text x="${colX(12) - 40}" y="212" font-family="'JetBrains Mono'" font-size="9" font-weight="bold" fill="#B45309">R2: 10kΩ</text>

        <!-- Cable Jumper: De Fila H (Col 12, y=285) al Riel GND Inf (Col 12, y=385) -->
        <path d="M ${colX(12)} 285 L ${colX(12)} 385" stroke="#2563EB" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="${colX(12)}" cy="385" r="4" fill="#2563EB"/>
        <text x="${colX(12) + 10}" y="340" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#2563EB">Retorno a GND</text>

        <!-- Cable de sonda multímetro para medir Vout -->
        <path d="M ${colX(12)} 135 Q ${colX(17)} 135 ${colX(20)} 110" stroke="#10B981" stroke-width="3" stroke-dasharray="4" fill="none"/>
        <circle cx="${colX(20)}" cy="110" r="5" fill="#10B981"/>
        <text x="${colX(20) + 8}" y="114" font-family="'JetBrains Mono'" font-size="9" font-weight="bold" fill="#059669">Punta multímetro (Vout)</text>
      `;
      break;

    case 'opamp-non-inverting':
      // CKT-03: Amplificador No Inversor LM741 (DIP-8 sobre canal central)
      circuitOverlay = `
        <!-- Chip LM741 montado sobre canal central entre col 14 y 17 -->
        <rect x="${colX(13.8)}" y="180" width="${colX(17.2) - colX(13.8)}" height="60" rx="4" fill="#1E2024" stroke="#475569" stroke-width="2"/>
        <!-- Muesca de orientación Pin 1 -->
        <path d="M ${colX(13.8)} 205 A 5 5 0 0 1 ${colX(13.8)} 215" fill="#334155"/>
        <circle cx="${colX(14.3)}" cy="190" r="2.5" fill="#94A3B8"/>
        <text x="${(colX(14) + colX(17))/2}" y="214" text-anchor="middle" font-family="'JetBrains Mono'" font-size="10" font-weight="bold" fill="#FFFFFF">LM741</text>

        <!-- Pines DIP-8: 1 a 4 arriba (Fila E), 8 a 5 abajo (Fila F) -->
        <!-- Pin 7 (+Vcc = +12V): Col 16 Fila E -> Riel Rojo -->
        <path d="M ${colX(16)} 180 L ${colX(16)} 55" stroke="#EF4444" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(16)}" cy="55" r="4" fill="#EF4444"/>
        <text x="${colX(16) + 4}" y="70" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#EF4444">Pin 7 (+12V)</text>

        <!-- Pin 4 (-Vee = -12V o GND): Col 17 Fila F -> Riel Azul Inf -->
        <path d="M ${colX(17)} 240 L ${colX(17)} 385" stroke="#2563EB" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(17)}" cy="385" r="4" fill="#2563EB"/>
        <text x="${colX(17) + 4}" y="360" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#2563EB">Pin 4 (-12V)</text>

        <!-- Pin 3 (Entrada no inversora Vin+): Col 16 Fila E -->
        <path d="M ${colX(16)} 175 L ${colX(16)} 125 L ${colX(10)} 125" stroke="#F59E0B" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(10)}" cy="125" r="4" fill="#F59E0B"/>
        <text x="${colX(9)}" y="120" font-family="'JetBrains Mono'" font-size="9" font-weight="bold" fill="#D97706">Vin (+) Pin 3</text>

        <!-- Resistencia Rf (10k) entre Pin 6 (Salida, Col 15 Fila F) y Pin 2 (Inversora, Col 15 Fila E) -->
        <path d="M ${colX(15)} 245 C ${colX(21)} 245, ${colX(21)} 175, ${colX(15)} 175" stroke="#94A3B8" stroke-width="2" fill="none"/>
        <rect x="${colX(20)}" y="195" width="22" height="14" rx="3" fill="#E2D4C3" stroke="#B45309" stroke-width="1.2"/>
        <text x="${colX(20) + 11}" y="206" text-anchor="middle" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#B45309">Rf 10k</text>

        <!-- Resistencia R1 (1k) de Pin 2 (Col 15 Fila E) a GND riel superior -->
        <path d="M ${colX(15)} 175 L ${colX(15)} 95 L ${colX(11)} 95 L ${colX(11)} 35" stroke="#94A3B8" stroke-width="2" fill="none"/>
        <rect x="${colX(12)}" y="88" width="18" height="14" rx="3" fill="#E2D4C3" stroke="#B45309" stroke-width="1.2"/>
        <circle cx="${colX(11)}" cy="35" r="4" fill="#2563EB"/>
        <text x="${colX(13)}" y="82" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#B45309">R1 1k -> GND</text>

        <!-- Salida Pin 6 -->
        <path d="M ${colX(15)} 245 L ${colX(15)} 285 L ${colX(22)} 285" stroke="#10B981" stroke-width="3" fill="none"/>
        <circle cx="${colX(22)}" cy="285" r="5" fill="#10B981"/>
        <text x="${colX(22) + 8}" y="289" font-family="'JetBrains Mono'" font-size="9" font-weight="bold" fill="#059669">Salida Vout (Pin 6)</text>
      `;
      break;

    case 'timer-555-monostable':
      // CKT-04: Temporizador 555 Monoestable
      circuitOverlay = `
        <!-- Chip NE555 sobre canal central col 12 a 15 -->
        <rect x="${colX(11.8)}" y="180" width="${colX(15.2) - colX(11.8)}" height="60" rx="4" fill="#1E2024" stroke="#475569" stroke-width="2"/>
        <path d="M ${colX(11.8)} 205 A 5 5 0 0 1 ${colX(11.8)} 215" fill="#334155"/>
        <circle cx="${colX(12.3)}" cy="190" r="2.5" fill="#94A3B8"/>
        <text x="${(colX(12) + colX(15))/2}" y="214" text-anchor="middle" font-family="'JetBrains Mono'" font-size="10" font-weight="bold" fill="#FFFFFF">NE555</text>

        <!-- Pin 1 (GND): Col 12 Fila E -> GND Sup -->
        <path d="M ${colX(12)} 175 L ${colX(12)} 35" stroke="#2563EB" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(12)}" cy="35" r="4" fill="#2563EB"/>
        <text x="${colX(12) - 30}" y="45" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#2563EB">Pin 1 GND</text>

        <!-- Pin 8 (Vcc) y Pin 4 (Reset): Col 15 y 14 Fila F -> VCC Inf -->
        <path d="M ${colX(15)} 245 L ${colX(15)} 365" stroke="#EF4444" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(15)}" cy="365" r="4" fill="#EF4444"/>
        <path d="M ${colX(14)} 245 L ${colX(14)} 365" stroke="#EF4444" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(14)}" cy="365" r="4" fill="#EF4444"/>
        <text x="${colX(14) - 25}" y="360" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#EF4444">Pin 4,8 Vcc</text>

        <!-- Pin 3 (Salida): Col 14 Fila E -> Salida con LED Testigo -->
        <path d="M ${colX(14)} 175 L ${colX(14)} 120 L ${colX(20)} 120" stroke="#10B981" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(20)}" cy="120" r="6" fill="#10B981"/>
        <text x="${colX(20) + 10}" y="124" font-family="'JetBrains Mono'" font-size="9" font-weight="bold" fill="#059669">Pin 3 Pulso LED</text>

        <!-- Pulsador de Trigger a Pin 2 -->
        <rect x="${colX(7)}" y="165" width="22" height="22" rx="4" fill="#3B82F6" stroke="#1D4ED8"/>
        <circle cx="${colX(7) + 11}" cy="176" r="6" fill="#60A5FA"/>
        <path d="M ${colX(8)} 176 L ${colX(13)} 176" stroke="#3B82F6" stroke-width="2" fill="none"/>
        <text x="${colX(5)}" y="180" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#1D4ED8">Disparo (Push)</text>
      `;
      break;

    case 'transistor-driver':
      // CKT-05: Driver de Carga con Transistor 2N2222 y Diodo 1N4007
      circuitOverlay = `
        <!-- Transistor TO-92 en Fila G/H col 12, 13, 14 -->
        <circle cx="${colX(12)}" cy="265" r="4" fill="#94A3B8"/>
        <circle cx="${colX(13)}" cy="265" r="4" fill="#94A3B8"/>
        <circle cx="${colX(14)}" cy="265" r="4" fill="#94A3B8"/>
        <!-- Cuerpo D-shape del 2N2222 -->
        <path d="M ${colX(11.5)} 280 L ${colX(14.5)} 280 A 10 10 0 0 1 ${colX(11.5)} 280" fill="#1E2024" stroke="#64748B" stroke-width="1.5"/>
        <text x="${colX(13)}" y="295" text-anchor="middle" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#FFFFFF">2N2222</text>

        <!-- Pin 1 (Emisor): Col 12 Fila G -> GND Riel Inf -->
        <path d="M ${colX(12)} 265 L ${colX(12)} 385" stroke="#2563EB" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(12)}" cy="385" r="4" fill="#2563EB"/>
        <text x="${colX(12) - 45}" y="375" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#2563EB">Emisor 1 -> GND</text>

        <!-- Pin 2 (Base): Col 13 Fila G con Resistencia 1k hacia señal de control -->
        <path d="M ${colX(13)} 265 L ${colX(8)} 265" stroke="#94A3B8" stroke-width="2" fill="none"/>
        <rect x="${colX(9.5)}" y="258" width="22" height="14" rx="3" fill="#E2D4C3" stroke="#B45309" stroke-width="1.2"/>
        <circle cx="${colX(8)}" cy="265" r="4.5" fill="#F59E0B"/>
        <text x="${colX(5)}" y="260" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#D97706">Disparo 5V (Base)</text>
        <text x="${colX(10.5)}" y="252" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#B45309">R: 1kΩ</text>

        <!-- Pin 3 (Colector): Col 14 Fila G hacia Carga y Diodo Flyback -->
        <path d="M ${colX(14)} 265 L ${colX(14)} 135" stroke="#64748B" stroke-width="2.5" fill="none"/>
        
        <!-- Diodo 1N4007 en paralelo: Ánodo en Col 14 (Colector), Cátodo en Col 16 (+VCC) -->
        <rect x="${colX(16)}" y="125" width="28" height="16" rx="4" fill="#0F172A" stroke="#475569"/>
        <rect x="${colX(16) + 21}" y="125" width="7" height="16" fill="#E2E8F0"/>
        <path d="M ${colX(14)} 133 L ${colX(16)} 133" stroke="#94A3B8" stroke-width="2" fill="none"/>
        <path d="M ${colX(16) + 28} 133 L ${colX(20)} 133 L ${colX(20)} 55" stroke="#EF4444" stroke-width="2" fill="none"/>
        <circle cx="${colX(20)}" cy="55" r="4" fill="#EF4444"/>
        <text x="${colX(15)}" y="115" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#EF4444">1N4007 Flyback (Cátodo a +V)</text>

        <!-- Bobina / Relevador de Carga -->
        <rect x="${colX(14) - 5}" y="150" width="34" height="24" rx="4" fill="#7C3AED" opacity="0.85"/>
        <text x="${colX(14) + 12}" y="166" text-anchor="middle" font-family="'Plus Jakarta Sans'" font-size="9" font-weight="bold" fill="#FFFFFF">Relé / Carga</text>
      `;
      break;

    case 'lm35-temperature':
      // CKT-06: Sensor de Temperatura LM35DZ con Capacitor 104
      circuitOverlay = `
        <!-- Sensor LM35 en TO-92 en Fila C, D, E (Col 14, 15, 16) -->
        <circle cx="${colX(14)}" cy="135" r="4" fill="#94A3B8"/>
        <circle cx="${colX(15)}" cy="135" r="4" fill="#94A3B8"/>
        <circle cx="${colX(16)}" cy="135" r="4" fill="#94A3B8"/>
        <!-- Cuerpo plano de frente -->
        <path d="M ${colX(13.5)} 120 L ${colX(16.5)} 120 A 10 10 0 0 1 ${colX(13.5)} 120" fill="#23252A" stroke="#64748B" stroke-width="1.5"/>
        <text x="${colX(15)}" y="110" text-anchor="middle" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#FFFFFF">LM35DZ</text>

        <!-- Pin 1 (+Vs): Col 14 Fila C -> Riel VCC Sup (+5V) -->
        <path d="M ${colX(14)} 135 L ${colX(14)} 55" stroke="#EF4444" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(14)}" cy="55" r="4" fill="#EF4444"/>
        <text x="${colX(14) - 40}" y="70" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#EF4444">Pin 1 (+Vs 5V)</text>

        <!-- Pin 2 (Vout): Col 15 Fila C -> Salida Analógica 10mV/°C -->
        <path d="M ${colX(15)} 135 L ${colX(15)} 175 L ${colX(21)} 175" stroke="#10B981" stroke-width="3" fill="none"/>
        <circle cx="${colX(21)}" cy="175" r="5" fill="#10B981"/>
        <text x="${colX(21) + 8}" y="179" font-family="'JetBrains Mono'" font-size="9" font-weight="bold" fill="#059669">Vout (10 mV/°C) -> A0</text>

        <!-- Pin 3 (GND): Col 16 Fila C -> Riel GND Sup -->
        <path d="M ${colX(16)} 135 L ${colX(16)} 35" stroke="#2563EB" stroke-width="2.5" fill="none"/>
        <circle cx="${colX(16)}" cy="35" r="4" fill="#2563EB"/>
        <text x="${colX(16) + 5}" y="45" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#2563EB">Pin 3 (GND)</text>

        <!-- Capacitor Cerámico 104 (100nF) entre Pin 1 y Pin 3 para eliminar ruido -->
        <path d="M ${colX(14)} 150 C ${colX(15)} 165 ${colX(15)} 165 ${colX(16)} 150" stroke="#F59E0B" stroke-width="2" fill="none"/>
        <circle cx="${colX(15)}" cy="162" r="5" fill="#D97706"/>
        <text x="${colX(15) - 30}" y="185" font-family="'JetBrains Mono'" font-size="8" font-weight="bold" fill="#D97706">Filtro 104 (100nF)</text>
      `;
      break;

    default:
      circuitOverlay = `
        <text x="${width/2}" y="${height/2}" text-anchor="middle" font-family="'Plus Jakarta Sans'" font-size="14" class="fill-stone-400 font-semibold">
          Selecciona un circuito para visualizar las conexiones en la protoboard
        </text>
      `;
  }

  return `
    <div class="w-full bg-[#FAF7F2] dark:bg-[#1C1A1E] rounded-2xl border border-warm-border dark:border-stone-700 p-3 sm:p-4 shadow-sm overflow-hidden select-none">
      <div class="flex items-center justify-between mb-3 px-1">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[19px]">developer_board</span>
          <span class="font-heading font-bold text-xs uppercase tracking-wider text-warm-charcoal dark:text-stone-200">
            Esquema Físico de Montaje en Protoboard
          </span>
        </div>
        <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white dark:bg-stone-800 text-sage-dark dark:text-sage border border-warm-border dark:border-stone-700">
          Vista Superior Vectorial
        </span>
      </div>

      <div class="w-full overflow-x-auto flex justify-center py-1">
        <svg viewBox="0 0 ${width} ${height}" class="w-full max-w-[860px] h-auto min-w-[620px] drop-shadow-sm transition-all" style="max-height: 440px;">
          <!-- Chasis base de la protoboard (color marfil claro / carbón en dark) -->
          <rect x="40" y="10" width="${width - 80}" height="${height - 20}" rx="16" class="fill-white dark:fill-[#252228] stroke-warm-border dark:stroke-stone-700" stroke-width="2"/>

          <!-- Riel Superior: Línea Azul (GND) y Línea Roja (VCC) -->
          <line x1="85" y1="26" x2="${colX(30) + 5}" y2="26" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
          <text x="73" y="29" font-family="'JetBrains Mono'" font-size="12" font-weight="bold" fill="#2563EB">-</text>
          <line x1="85" y1="64" x2="${colX(30) + 5}" y2="64" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
          <text x="73" y="67" font-family="'JetBrains Mono'" font-size="12" font-weight="bold" fill="#DC2626">+</text>

          <!-- Canal Divisorio Central (Aislante plástico) -->
          <rect x="50" y="195" width="${width - 100}" height="30" fill="#F4EFEA" class="dark:fill-[#1E1B20]" rx="2"/>
          <line x1="55" y1="210" x2="${width - 55}" y2="210" stroke="#E2DCD5" class="dark:stroke-stone-700" stroke-width="1.5" stroke-dasharray="3"/>

          <!-- Riel Inferior: Línea Roja (VCC) y Línea Azul (GND) -->
          <line x1="85" y1="356" x2="${colX(30) + 5}" y2="356" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
          <text x="73" y="359" font-family="'JetBrains Mono'" font-size="12" font-weight="bold" fill="#DC2626">+</text>
          <line x1="85" y1="394" x2="${colX(30) + 5}" y2="394" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
          <text x="73" y="397" font-family="'JetBrains Mono'" font-size="12" font-weight="bold" fill="#2563EB">-</text>

          <!-- Orificios y serigrafía de matriz -->
          ${pinHoles}
          ${letters}

          <!-- Componentes y cableado del circuito activo -->
          ${circuitOverlay}
        </svg>
      </div>

      <!-- Leyenda rápida inferior -->
      <div class="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-warm-border dark:border-stone-800 text-[10px] font-mono text-warm-gray dark:text-stone-400">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Rojo: +Vcc</span>
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Azul: GND (Masa)</span>
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Verde: Señal / Salida</span>
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Ámbar: Control / Disparo</span>
        </div>
        <span>Canal central apto para integrados DIP</span>
      </div>
    </div>
  `;
}
