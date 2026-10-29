// Calculadora Express de Componentes para ProtoLab
// Soporta:
// 1. Resistencia Limitadora de LED con código de colores gráfico interactivo (4 bandas)
// 2. Divisor de Voltaje (Vin, Vout deseado -> R1 y R2 comerciales)
// 3. Amplificador No Inversor (Ganancia deseada -> Rf y R1 comerciales)

// Serie comercial E12 estándar (los valores que se encuentran en cualquier laboratorio de universidad)
const E12_VALUES = [
  1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2,
  10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82,
  100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820,
  1000, 1200, 1500, 1800, 2200, 2700, 3300, 3900, 4700, 5600, 6800, 8200,
  10000, 12000, 15000, 18000, 22000, 27000, 33000, 39000, 47000, 56000, 68000, 82000,
  100000, 120000, 150000, 180000, 220000, 270000, 330000, 390000, 470000, 560000, 680000, 820000,
  1000000
];

// Colores estándar de 4 bandas
const COLOR_CODES = {
  0: { name: 'Negro', hex: '#1C1917', text: 'text-white' },
  1: { name: 'Marrón', hex: '#78350F', text: 'text-white' },
  2: { name: 'Rojo', hex: '#DC2626', text: 'text-white' },
  3: { name: 'Naranja', hex: '#EA580C', text: 'text-white' },
  4: { name: 'Amarillo', hex: '#EAB308', text: 'text-stone-900' },
  5: { name: 'Verde', hex: '#16A34A', text: 'text-white' },
  6: { name: 'Azul', hex: '#2563EB', text: 'text-white' },
  7: { name: 'Violeta', hex: '#9333EA', text: 'text-white' },
  8: { name: 'Gris', hex: '#64748B', text: 'text-white' },
  9: { name: 'Blanco', hex: '#F8FAFC', text: 'text-stone-900' }
};

const MULTIPLIERS = {
  0: { name: 'Negro (x1)', hex: '#1C1917', factor: 1, label: 'x1' },
  1: { name: 'Marrón (x10)', hex: '#78350F', factor: 10, label: 'x10' },
  2: { name: 'Rojo (x100)', hex: '#DC2626', factor: 100, label: 'x100' },
  3: { name: 'Naranja (x1k)', hex: '#EA580C', factor: 1000, label: 'x1k' },
  4: { name: 'Amarillo (x10k)', hex: '#EAB308', factor: 10000, label: 'x10k' },
  5: { name: 'Verde (x100k)', hex: '#16A34A', factor: 100000, label: 'x100k' },
  6: { name: 'Azul (x1M)', hex: '#2563EB', factor: 1000000, label: 'x1M' },
  '-1': { name: 'Dorado (x0.1)', hex: '#D4AF37', factor: 0.1, label: 'x0.1' },
  '-2': { name: 'Plateado (x0.01)', hex: '#C0C0C0', factor: 0.01, label: 'x0.01' }
};

// Encuentra el valor comercial más cercano hacia arriba (para seguridad de corriente)
function findClosestCommercial(targetVal) {
  if (targetVal <= 0) return 10;
  // Buscar el valor mayor o igual más cercano en E12
  for (let val of E12_VALUES) {
    if (val >= targetVal) return val;
  }
  return E12_VALUES[E12_VALUES.length - 1];
}

// Formatea ohmios de forma amigable (ej. 220 Ω, 4.7 kΩ, 1 MΩ)
function formatOhms(val) {
  if (val >= 1000000) {
    return (val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1) + ' MΩ';
  }
  if (val >= 1000) {
    return (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + ' kΩ';
  }
  return Math.round(val) + ' Ω';
}

// Obtiene las bandas de color para un valor de resistencia
function getResistorBands(resistorValue) {
  // Convertir a notación científica para extraer dígitos significativos
  let strVal = resistorValue.toString();
  let firstDigit = 0;
  let secondDigit = 0;
  let multiplierExp = 0;

  if (resistorValue >= 10) {
    let orderOfMagnitude = Math.floor(Math.log10(resistorValue));
    let base = Math.round(resistorValue / Math.pow(10, orderOfMagnitude - 1));
    firstDigit = Math.floor(base / 10);
    secondDigit = base % 10;
    multiplierExp = orderOfMagnitude - 1;
  } else {
    // Valores de 1.0 a 9.9
    let rounded = Math.round(resistorValue * 10);
    firstDigit = Math.floor(rounded / 10);
    secondDigit = rounded % 10;
    multiplierExp = -1;
  }

  const band1 = COLOR_CODES[firstDigit] || COLOR_CODES[1];
  const band2 = COLOR_CODES[secondDigit] || COLOR_CODES[0];
  const band3 = MULTIPLIERS[multiplierExp] || MULTIPLIERS[0];
  const band4 = { name: 'Dorado (±5%)', hex: '#D4AF37', text: 'text-stone-900', label: '±5%' };

  return { band1, band2, band3, band4, firstDigit, secondDigit };
}

// Estado de la calculadora
let activeCalcMode = 'led'; // 'led', 'divider', 'opamp'

// Inicializador de la vista
function initCalculatorView() {
  const container = document.getElementById('calculadora-container');
  if (!container) return;

  container.innerHTML = `
    <div class="flex flex-col gap-6">
      
      <!-- Selector de Calculadoras (Tabs) -->
      <div class="flex items-center gap-1.5 p-1 bg-warm-card-alt rounded-xl border border-warm-border overflow-x-auto text-xs font-heading font-semibold">
        <button onclick="setCalcMode('led')" id="btn-calc-led" class="calc-tab-btn flex-1 py-2 px-3 rounded-lg transition-all bg-white text-primary shadow-xs border border-primary-border flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span class="material-symbols-outlined text-[17px]">lightbulb</span>
          <span>Resistencia para LED</span>
        </button>
        <button onclick="setCalcMode('divider')" id="btn-calc-divider" class="calc-tab-btn flex-1 py-2 px-3 rounded-lg transition-all text-warm-gray hover:text-warm-charcoal flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span class="material-symbols-outlined text-[17px]">tune</span>
          <span>Divisor de Voltaje</span>
        </button>
        <button onclick="setCalcMode('opamp')" id="btn-calc-opamp" class="calc-tab-btn flex-1 py-2 px-3 rounded-lg transition-all text-warm-gray hover:text-warm-charcoal flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span class="material-symbols-outlined text-[17px]">speed</span>
          <span>Ganancia Op-Amp</span>
        </button>
      </div>

      <!-- PANEL 1: RESISTENCIA PARA LED -->
      <div id="panel-calc-led" class="calc-panel space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Controles de Entrada (5 de 12) -->
          <div class="lg:col-span-5 bg-warm-card p-5 rounded-2xl border border-warm-border space-y-4">
            <h3 class="font-heading font-bold text-sm text-warm-charcoal flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[18px]">tune</span>
              <span>Parámetros de Entrada</span>
            </h3>

            <!-- Voltaje de Fuente (Vcc) -->
            <div>
              <label class="block text-xs font-semibold text-warm-charcoal mb-1">Voltaje de la Fuente ($V_{CC}$):</label>
              <div class="flex items-center gap-2">
                <input type="number" id="led-vcc-input" step="0.1" value="5.0" min="1" max="24" oninput="calculateLedResistor()" 
                       class="w-full bg-white text-sm font-mono font-bold text-warm-charcoal px-3 py-2 rounded-xl border border-warm-border focus:outline-none focus:border-primary-pastel">
                <span class="font-mono text-xs text-warm-gray font-bold">V</span>
              </div>
              <div class="flex gap-1.5 mt-2">
                <button type="button" onclick="setLedVcc(3.3)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-warm-border text-warm-gray hover:text-primary">3.3V</button>
                <button type="button" onclick="setLedVcc(5.0)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-warm-border text-warm-gray hover:text-primary">5.0V</button>
                <button type="button" onclick="setLedVcc(9.0)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-warm-border text-warm-gray hover:text-primary">9.0V</button>
                <button type="button" onclick="setLedVcc(12.0)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-warm-border text-warm-gray hover:text-primary">12V</button>
              </div>
            </div>

            <!-- Color del LED -->
            <div>
              <label class="block text-xs font-semibold text-warm-charcoal mb-1">Color y Tipo de LED:</label>
              <select id="led-color-select" onchange="onLedColorChange()" class="w-full bg-white text-xs text-warm-charcoal px-3 py-2 rounded-xl border border-warm-border focus:outline-none focus:border-primary-pastel">
                <option value="1.8" data-color="#EF4444" selected>🔴 LED Rojo Estándar (~1.8V - 2.0V)</option>
                <option value="2.1" data-color="#10B981">🟢 LED Verde Estándar (~2.1V - 2.3V)</option>
                <option value="2.0" data-color="#F59E0B">🟡 LED Amarillo (~2.0V - 2.2V)</option>
                <option value="3.2" data-color="#3B82F6">🔵 LED Azul Ultrabrillante (~3.2V - 3.4V)</option>
                <option value="3.2" data-color="#64748B">⚪ LED Blanco Ultrabrillante (~3.2V - 3.4V)</option>
              </select>
            </div>

            <!-- Corriente Deseada (mA) -->
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="text-xs font-semibold text-warm-charcoal">Corriente deseada ($I_{F}$):</label>
                <span id="led-current-val" class="font-mono text-xs font-bold text-primary">15 mA</span>
              </div>
              <input type="range" id="led-current-slider" min="5" max="25" value="15" step="1" oninput="onLedCurrentSlider(this.value)" 
                     class="w-full accent-primary-pastel cursor-pointer">
              <div class="flex justify-between text-[10px] text-warm-gray font-mono mt-1">
                <span>5 mA (Tenue)</span>
                <span>15 mA (Estándar Seguro)</span>
                <span>25 mA (Máximo)</span>
              </div>
            </div>

            <!-- Fórmula aplicada -->
            <div class="p-3 bg-white rounded-xl border border-warm-border font-mono text-[11px] text-warm-gray leading-relaxed">
              <span class="text-primary font-bold">Fórmula de Ley de Ohm:</span><br/>
              R = (V_cc - V_led) / I_led
            </div>

          </div>

          <!-- Resultados y Representación Gráfica (7 de 12) -->
          <div class="lg:col-span-7 space-y-4">
            
            <!-- Tarjetas de métricas -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div class="p-4 rounded-xl bg-warm-card border border-warm-border">
                <span class="text-[11px] font-mono text-warm-gray uppercase">Valor Comercial Lab</span>
                <div class="flex items-baseline gap-1 mt-1">
                  <span id="res-comm-value" class="font-mono text-2xl font-bold text-sage-dark">220</span>
                  <span class="font-heading font-semibold text-sm text-warm-gray">Ω</span>
                </div>
                <span class="text-[10px] text-warm-gray mt-1 block">Tolerancia ±5% (1/4 W)</span>
              </div>

              <div class="p-4 rounded-xl bg-warm-card border border-warm-border">
                <span class="text-[11px] font-mono text-warm-gray uppercase">Cálculo Teórico</span>
                <div class="flex items-baseline gap-1 mt-1">
                  <span id="res-theor-value" class="font-mono text-2xl font-bold text-primary">213.3</span>
                  <span class="font-heading font-semibold text-sm text-warm-gray">Ω</span>
                </div>
                <span class="text-[10px] text-warm-gray mt-1 block">Valor matemático exacto</span>
              </div>

              <div class="p-4 rounded-xl bg-warm-card border border-warm-border col-span-2 sm:col-span-1">
                <span class="text-[11px] font-mono text-warm-gray uppercase">Potencia Disipada</span>
                <div class="flex items-baseline gap-1 mt-1">
                  <span id="res-power-value" class="font-mono text-2xl font-bold text-warm-charcoal">48</span>
                  <span class="font-heading font-semibold text-sm text-warm-gray">mW</span>
                </div>
                <span class="text-[10px] text-sage-dark font-medium mt-1 block">✓ Seguro (&lt; 250mW)</span>
              </div>
            </div>

            <!-- VISUALIZADOR DE RESISTENCIA FÍSICA Y BANDAS DE COLORES -->
            <div class="bg-warm-card p-5 rounded-2xl border border-warm-border space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="font-heading font-bold text-xs uppercase tracking-wider text-warm-charcoal flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[17px] text-primary">palette</span>
                  <span>Código de Colores de 4 Bandas</span>
                </h4>
                <span id="res-band-summary" class="font-mono text-xs font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-md border border-primary-border">220 Ω ±5%</span>
              </div>

              <!-- Gráfico del Resistor Físico -->
              <div class="w-full py-6 bg-white rounded-xl border border-warm-border flex items-center justify-center overflow-x-auto select-none">
                <div class="relative flex items-center w-72 sm:w-80 h-16">
                  <!-- Pata Izquierda -->
                  <div class="h-2 w-14 bg-stone-300 rounded-l-full shadow-inner"></div>
                  <!-- Cuerpo del Resistor -->
                  <div class="relative flex-1 h-14 bg-[#EADCC9] rounded-2xl border border-[#D5C4AC] flex items-center justify-between px-6 shadow-sm overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/10 pointer-events-none"></div>
                    <!-- Banda 1 -->
                    <div id="band-1-ui" class="w-4 h-full bg-red-600 relative z-10 flex items-end justify-center pb-1 shadow-xs">
                      <span id="band-1-label" class="text-[9px] font-mono font-bold text-white drop-shadow">2</span>
                    </div>
                    <!-- Banda 2 -->
                    <div id="band-2-ui" class="w-4 h-full bg-red-600 relative z-10 flex items-end justify-center pb-1 shadow-xs">
                      <span id="band-2-label" class="text-[9px] font-mono font-bold text-white drop-shadow">2</span>
                    </div>
                    <!-- Banda 3 (Multiplicador) -->
                    <div id="band-3-ui" class="w-4 h-full bg-amber-900 relative z-10 flex items-end justify-center pb-1 shadow-xs">
                      <span id="band-3-label" class="text-[9px] font-mono font-bold text-white drop-shadow">x10</span>
                    </div>
                    <!-- Espacio -->
                    <div class="w-6"></div>
                    <!-- Banda 4 (Tolerancia) -->
                    <div id="band-4-ui" class="w-4 h-full bg-[#D4AF37] relative z-10 flex items-end justify-center pb-1 shadow-xs">
                      <span class="text-[8px] font-mono font-bold text-stone-900 drop-shadow">5%</span>
                    </div>
                  </div>
                  <!-- Pata Derecha -->
                  <div class="h-2 w-14 bg-stone-300 rounded-r-full shadow-inner"></div>
                </div>
              </div>

              <!-- Desglose de cada banda -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div class="p-2 rounded-xl bg-white border border-warm-border">
                  <span class="text-[10px] font-mono text-warm-gray block">Banda 1 (1er dígito)</span>
                  <span id="b1-name" class="font-mono font-bold text-warm-charcoal mt-0.5 block">Rojo (2)</span>
                </div>
                <div class="p-2 rounded-xl bg-white border border-warm-border">
                  <span class="text-[10px] font-mono text-warm-gray block">Banda 2 (2do dígito)</span>
                  <span id="b2-name" class="font-mono font-bold text-warm-charcoal mt-0.5 block">Rojo (2)</span>
                </div>
                <div class="p-2 rounded-xl bg-white border border-warm-border">
                  <span class="text-[10px] font-mono text-warm-gray block">Banda 3 (Multiplicador)</span>
                  <span id="b3-name" class="font-mono font-bold text-warm-charcoal mt-0.5 block">Marrón (x10)</span>
                </div>
                <div class="p-2 rounded-xl bg-white border border-warm-border">
                  <span class="text-[10px] font-mono text-warm-gray block">Banda 4 (Tolerancia)</span>
                  <span class="font-mono font-bold text-warm-charcoal mt-0.5 block">Dorado (±5%)</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      <!-- PANEL 2: DIVISOR DE VOLTAJE -->
      <div id="panel-calc-divider" class="calc-panel hidden space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div class="lg:col-span-5 bg-warm-card p-5 rounded-2xl border border-warm-border space-y-4">
            <h3 class="font-heading font-bold text-sm text-warm-charcoal flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[18px]">tune</span>
              <span>Voltajes Deseados</span>
            </h3>

            <div>
              <label class="block text-xs font-semibold text-warm-charcoal mb-1">Voltaje de Entrada ($V_{IN}$):</label>
              <div class="flex items-center gap-2">
                <input type="number" id="div-vin-input" step="0.5" value="5.0" min="1" max="30" oninput="calculateVoltageDivider()" 
                       class="w-full bg-white text-sm font-mono font-bold text-warm-charcoal px-3 py-2 rounded-xl border border-warm-border focus:outline-none focus:border-primary-pastel">
                <span class="font-mono text-xs text-warm-gray font-bold">V</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-warm-charcoal mb-1">Voltaje de Salida Deseado ($V_{OUT}$):</label>
              <div class="flex items-center gap-2">
                <input type="number" id="div-vout-input" step="0.1" value="2.5" min="0.1" max="29" oninput="calculateVoltageDivider()" 
                       class="w-full bg-white text-sm font-mono font-bold text-warm-charcoal px-3 py-2 rounded-xl border border-warm-border focus:outline-none focus:border-primary-pastel">
                <span class="font-mono text-xs text-warm-gray font-bold">V</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-warm-charcoal mb-1">Resistencia Base $R_1$ sugerida:</label>
              <select id="div-r1-select" onchange="calculateVoltageDivider()" class="w-full bg-white text-xs text-warm-charcoal px-3 py-2 rounded-xl border border-warm-border focus:outline-none focus:border-primary-pastel font-mono">
                <option value="1000">1 kΩ (Consumo estándar ~1mA)</option>
                <option value="10000" selected>10 kΩ (Recomendado para Lab y ADC)</option>
                <option value="47000">47 kΩ (Bajo consumo)</option>
                <option value="100000">100 kΩ (Muy bajo consumo)</option>
              </select>
            </div>

            <div class="p-3 bg-white rounded-xl border border-warm-border font-mono text-[11px] text-warm-gray leading-relaxed">
              <span class="text-primary font-bold">Ecuación del divisor:</span><br/>
              V_out = V_in · [ R2 / (R1 + R2) ]
            </div>
          </div>

          <div class="lg:col-span-7 bg-warm-card p-5 rounded-2xl border border-warm-border space-y-4">
            <h4 class="font-heading font-bold text-sm text-warm-charcoal">Resistencias Comerciales Recomendadas (E12)</h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-white border border-warm-border">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-warm-gray">Resistencia R1 (Superior)</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-warm-card-alt text-warm-charcoal">Hacia Vin</span>
                </div>
                <div class="mt-2">
                  <span id="div-r1-res" class="font-mono text-2xl font-bold text-primary">10 kΩ</span>
                </div>
                <p class="text-[11px] text-warm-gray mt-1">Conectada entre el positivo Vin y el nodo central Vout.</p>
              </div>

              <div class="p-4 rounded-xl bg-white border border-warm-border">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-warm-gray">Resistencia R2 (Inferior)</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-warm-card-alt text-warm-charcoal">Hacia GND</span>
                </div>
                <div class="mt-2">
                  <span id="div-r2-res" class="font-mono text-2xl font-bold text-sage-dark">10 kΩ</span>
                </div>
                <p class="text-[11px] text-warm-gray mt-1">Conectada entre el nodo central Vout y tierra (GND).</p>
              </div>
            </div>

            <!-- Resumen de Salida Real -->
            <div class="p-4 bg-white rounded-xl border border-warm-border space-y-2">
              <div class="flex justify-between items-center text-xs">
                <span class="text-warm-gray">Voltaje real obtenido con comerciales:</span>
                <span id="div-vout-real" class="font-mono font-bold text-warm-charcoal text-sm">2.50 V</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-warm-gray">Error respecto al deseado:</span>
                <span id="div-error-val" class="font-mono font-bold text-sage-dark text-xs">0.0%</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-warm-gray">Corriente consumida por el divisor:</span>
                <span id="div-current-val" class="font-mono font-bold text-warm-charcoal text-xs">0.25 mA</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- PANEL 3: AMPLIFICADOR NO INVERSOR -->
      <div id="panel-calc-opamp" class="calc-panel hidden space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div class="lg:col-span-5 bg-warm-card p-5 rounded-2xl border border-warm-border space-y-4">
            <h3 class="font-heading font-bold text-sm text-warm-charcoal flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[18px]">speed</span>
              <span>Ganancia Deseada ($A_V$)</span>
            </h3>

            <div>
              <label class="block text-xs font-semibold text-warm-charcoal mb-1">Ganancia de Voltaje ($A_V$):</label>
              <div class="flex items-center gap-2">
                <input type="number" id="opamp-gain-input" step="0.5" value="11" min="1" max="1000" oninput="calculateOpampGain()" 
                       class="w-full bg-white text-sm font-mono font-bold text-warm-charcoal px-3 py-2 rounded-xl border border-warm-border focus:outline-none focus:border-primary-pastel">
                <span class="font-mono text-xs text-warm-gray font-bold">V/V</span>
              </div>
              <div class="flex gap-1.5 mt-2">
                <button type="button" onclick="setOpampGain(2)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-warm-border text-warm-gray hover:text-primary">x2</button>
                <button type="button" onclick="setOpampGain(5)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-warm-border text-warm-gray hover:text-primary">x5</button>
                <button type="button" onclick="setOpampGain(10)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-warm-border text-warm-gray hover:text-primary">x10</button>
                <button type="button" onclick="setOpampGain(11)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-warm-border text-warm-gray hover:text-primary">x11</button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-warm-charcoal mb-1">Resistencia de Entrada $R_1$ sugerida:</label>
              <select id="opamp-r1-select" onchange="calculateOpampGain()" class="w-full bg-white text-xs text-warm-charcoal px-3 py-2 rounded-xl border border-warm-border focus:outline-none focus:border-primary-pastel font-mono">
                <option value="1000" selected>1 kΩ (Típico estándar en Lab)</option>
                <option value="2200">2.2 kΩ</option>
                <option value="10000">10 kΩ</option>
              </select>
            </div>

            <div class="p-3 bg-white rounded-xl border border-warm-border font-mono text-[11px] text-warm-gray leading-relaxed">
              <span class="text-primary font-bold">Fórmula de Ganancia No Inversora:</span><br/>
              A_v = 1 + ( R_f / R_1 )<br/>
              Nota: ¡La ganancia siempre es mayor o igual a 1!
            </div>
          </div>

          <div class="lg:col-span-7 bg-warm-card p-5 rounded-2xl border border-warm-border space-y-4">
            <h4 class="font-heading font-bold text-sm text-warm-charcoal">Valores Recomendados para el LM741 / LM358</h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-white border border-warm-border">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-warm-gray">Resistencia Rf (Feedback)</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-warm-card-alt text-warm-charcoal">Pin 6 a Pin 2</span>
                </div>
                <div class="mt-2">
                  <span id="opamp-rf-val" class="font-mono text-2xl font-bold text-primary">10 kΩ</span>
                </div>
                <p class="text-[11px] text-warm-gray mt-1">Va conectada entre la salida (Pin 6) y la entrada inversora (Pin 2).</p>
              </div>

              <div class="p-4 rounded-xl bg-white border border-warm-border">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-warm-gray">Resistencia R1 (A Tierra)</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-warm-card-alt text-warm-charcoal">Pin 2 a GND</span>
                </div>
                <div class="mt-2">
                  <span id="opamp-r1-val" class="font-mono text-2xl font-bold text-sage-dark">1 kΩ</span>
                </div>
                <p class="text-[11px] text-warm-gray mt-1">Va conectada entre la entrada inversora (Pin 2) y tierra (GND).</p>
              </div>
            </div>

            <div class="p-4 bg-white rounded-xl border border-warm-border space-y-2">
              <div class="flex justify-between items-center text-xs">
                <span class="text-warm-gray">Ganancia real obtenida con comerciales:</span>
                <span id="opamp-gain-real" class="font-mono font-bold text-warm-charcoal text-sm">11.00 x</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-warm-gray">Ejemplo práctico: Si aplicas 0.2V de entrada:</span>
                <span id="opamp-sample-out" class="font-mono font-bold text-sage-dark text-xs">Saldrán 2.20 V</span>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  `;

  // Calcular valores iniciales
  calculateLedResistor();
  calculateVoltageDivider();
  calculateOpampGain();
}

// Conmutar entre calculadoras
function setCalcMode(mode) {
  activeCalcMode = mode;
  document.querySelectorAll('.calc-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.calc-tab-btn').forEach(b => {
    b.className = "calc-tab-btn flex-1 py-2 px-3 rounded-lg transition-all text-warm-gray hover:text-warm-charcoal flex items-center justify-center gap-1.5 whitespace-nowrap";
  });

  const activePanel = document.getElementById('panel-calc-' + mode);
  const activeBtn = document.getElementById('btn-calc-' + mode);
  if (activePanel) activePanel.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.className = "calc-tab-btn flex-1 py-2 px-3 rounded-lg transition-all bg-white text-primary shadow-xs border border-primary-border flex items-center justify-center gap-1.5 whitespace-nowrap font-bold";
  }
}

// -------------------------------------------------------------
// CÁLCULO 1: RESISTENCIA PARA LED
// -------------------------------------------------------------
function setLedVcc(v) {
  const input = document.getElementById('led-vcc-input');
  if (input) {
    input.value = v;
    calculateLedResistor();
  }
}

function onLedColorChange() {
  calculateLedResistor();
}

function onLedCurrentSlider(val) {
  const label = document.getElementById('led-current-val');
  if (label) label.textContent = val + ' mA';
  calculateLedResistor();
}

function calculateLedResistor() {
  const vccInput = document.getElementById('led-vcc-input');
  const colorSelect = document.getElementById('led-color-select');
  const currentSlider = document.getElementById('led-current-slider');

  if (!vccInput || !colorSelect || !currentSlider) return;

  const vcc = parseFloat(vccInput.value) || 5.0;
  const vled = parseFloat(colorSelect.value) || 1.8;
  const i_mA = parseFloat(currentSlider.value) || 15;
  const i_A = i_mA / 1000;

  // R = (Vcc - Vled) / I
  let theoreticalR = (vcc - vled) / i_A;
  if (theoreticalR < 1) theoreticalR = 1;

  const commercialR = findClosestCommercial(theoreticalR);
  // Potencia: P = I^2 * R
  const powerWatts = (i_A * i_A) * commercialR;
  const power_mW = Math.round(powerWatts * 1000);

  // Actualizar DOM
  const commEl = document.getElementById('res-comm-value');
  const theorEl = document.getElementById('res-theor-value');
  const powerEl = document.getElementById('res-power-value');
  const summaryEl = document.getElementById('res-band-summary');

  if (commEl) commEl.textContent = commercialR >= 1000 ? (commercialR / 1000).toFixed(1) + ' k' : commercialR;
  if (theorEl) theorEl.textContent = theoreticalR.toFixed(1);
  if (powerEl) powerEl.textContent = power_mW;
  if (summaryEl) summaryEl.textContent = formatOhms(commercialR) + ' ±5%';

  // Actualizar bandas de color
  updateColorBandsUI(commercialR);
}

function updateColorBandsUI(resistorVal) {
  const bands = getResistorBands(resistorVal);
  
  const b1 = document.getElementById('band-1-ui');
  const b2 = document.getElementById('band-2-ui');
  const b3 = document.getElementById('band-3-ui');

  const l1 = document.getElementById('band-1-label');
  const l2 = document.getElementById('band-2-label');
  const l3 = document.getElementById('band-3-label');

  const n1 = document.getElementById('b1-name');
  const n2 = document.getElementById('b2-name');
  const n3 = document.getElementById('b3-name');

  if (b1) b1.style.backgroundColor = bands.band1.hex;
  if (b2) b2.style.backgroundColor = bands.band2.hex;
  if (b3) b3.style.backgroundColor = bands.band3.hex;

  if (l1) l1.textContent = bands.firstDigit;
  if (l2) l2.textContent = bands.secondDigit;
  if (l3) l3.textContent = bands.band3.label;

  if (n1) n1.textContent = `${bands.band1.name} (${bands.firstDigit})`;
  if (n2) n2.textContent = `${bands.band2.name} (${bands.secondDigit})`;
  if (n3) n3.textContent = bands.band3.name;
}

// -------------------------------------------------------------
// CÁLCULO 2: DIVISOR DE VOLTAJE
// -------------------------------------------------------------
function calculateVoltageDivider() {
  const vinInput = document.getElementById('div-vin-input');
  const voutInput = document.getElementById('div-vout-input');
  const r1Select = document.getElementById('div-r1-select');

  if (!vinInput || !voutInput || !r1Select) return;

  const vin = parseFloat(vinInput.value) || 5.0;
  let voutDesired = parseFloat(voutInput.value) || 2.5;
  if (voutDesired >= vin) voutDesired = vin * 0.95;

  const r1 = parseFloat(r1Select.value) || 10000;

  // Formula: Vout = Vin * R2 / (R1 + R2)
  // Vout*(R1 + R2) = Vin*R2
  // Vout*R1 = R2*(Vin - Vout)
  // R2 = (Vout * R1) / (Vin - Vout)
  let theoreticalR2 = (voutDesired * r1) / (vin - voutDesired);
  if (theoreticalR2 <= 0) theoreticalR2 = 100;

  const commercialR2 = findClosestCommercial(theoreticalR2);

  // Vout real con valores comerciales
  const voutReal = vin * (commercialR2 / (r1 + commercialR2));
  const errorPercent = Math.abs((voutReal - voutDesired) / voutDesired) * 100;
  const current_mA = (vin / (r1 + commercialR2)) * 1000;

  // Actualizar DOM
  const r1El = document.getElementById('div-r1-res');
  const r2El = document.getElementById('div-r2-res');
  const realEl = document.getElementById('div-vout-real');
  const errEl = document.getElementById('div-error-val');
  const currEl = document.getElementById('div-current-val');

  if (r1El) r1El.textContent = formatOhms(r1);
  if (r2El) r2El.textContent = formatOhms(commercialR2);
  if (realEl) realEl.textContent = voutReal.toFixed(2) + ' V';
  if (errEl) errEl.textContent = errorPercent.toFixed(1) + '%';
  if (currEl) currEl.textContent = current_mA.toFixed(2) + ' mA';
}

// -------------------------------------------------------------
// CÁLCULO 3: AMPLIFICADOR NO INVERSOR
// -------------------------------------------------------------
function setOpampGain(g) {
  const gainInput = document.getElementById('opamp-gain-input');
  if (gainInput) {
    gainInput.value = g;
    calculateOpampGain();
  }
}

function calculateOpampGain() {
  const gainInput = document.getElementById('opamp-gain-input');
  const r1Select = document.getElementById('opamp-r1-select');

  if (!gainInput || !r1Select) return;

  let gain = parseFloat(gainInput.value) || 11.0;
  if (gain < 1) gain = 1; // La ganancia no inversora no puede ser menor a 1

  const r1 = parseFloat(r1Select.value) || 1000;

  // Formula: Av = 1 + (Rf / R1) => Rf = (Av - 1) * R1
  let theoreticalRf = (gain - 1) * r1;
  let commercialRf = 0;
  if (theoreticalRf <= 0) {
    commercialRf = 0; // Seguidor de voltaje (buffer)
  } else {
    commercialRf = findClosestCommercial(theoreticalRf);
  }

  const realGain = 1 + (commercialRf / r1);
  const sampleVin = 0.2; // 200mV
  const sampleVout = sampleVin * realGain;

  // Actualizar DOM
  const rfEl = document.getElementById('opamp-rf-val');
  const r1El = document.getElementById('opamp-r1-val');
  const gainRealEl = document.getElementById('opamp-gain-real');
  const sampleOutEl = document.getElementById('opamp-sample-out');

  if (rfEl) rfEl.textContent = commercialRf === 0 ? '0 Ω (Cable directo / Buffer)' : formatOhms(commercialRf);
  if (r1El) r1El.textContent = formatOhms(r1);
  if (gainRealEl) gainRealEl.textContent = realGain.toFixed(2) + ' x';
  if (sampleOutEl) sampleOutEl.textContent = `Saldrán ${(sampleVout).toFixed(2)} V`;
}

// Escuchar cambios de voltaje global del laboratorio
window.addEventListener('labVoltageChange', (e) => {
  const voltStr = e.detail.voltage;
  const voltNum = parseFloat(voltStr);
  if (!isNaN(voltNum)) {
    const vccInput = document.getElementById('led-vcc-input');
    const divVinInput = document.getElementById('div-vin-input');
    if (vccInput) {
      vccInput.value = voltNum;
      calculateLedResistor();
    }
    if (divVinInput) {
      divVinInput.value = voltNum;
      calculateVoltageDivider();
    }
  }
});
