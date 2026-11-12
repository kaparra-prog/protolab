// ==========================================================================
// ProtoLab - Calculadora Express Ampliada para Laboratorio
// Sub-módulos:
// 1. Resistencia para LED (con validación Vin > Vled y disipación térmica)
// 2. Divisor de Voltaje (con validación pasiva 0 < Vout < Vin)
// 3. Ganancia Op-Amp No-Inversor (con validación Av >= 1)
// 4. Ley de Ohm y Potencia (V, I, R, P a partir de 2 variables conocidas)
// 5. Decodificador de Resistencias (4 y 5 bandas con dibujo dinámico)
// 6. Decodificador de Capacitores Cerámicos (3 dígitos a pF, nF, µF)
// 7. Calculadora NE555 Astable (Frecuencia, Periodo y Ciclo de Trabajo)
// ==========================================================================

// Serie comercial E12 estándar de laboratorio
const E12_VALUES = [
  1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2,
  10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82,
  100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820,
  1000, 1200, 1500, 1800, 2200, 2700, 3300, 3900, 4700, 5600, 6800, 8200,
  10000, 12000, 15000, 18000, 22000, 27000, 33000, 39000, 47000, 56000, 68000, 82000,
  100000, 120000, 150000, 180000, 220000, 270000, 330000, 390000, 470000, 560000, 680000, 820000,
  1000000
];

// Colores estándar de resistencias (código de colores internacional IEC 60062)
const COLOR_CODES = {
  0: { name: 'Negro', hex: '#1C1917', text: 'text-white', val: 0 },
  1: { name: 'Marrón', hex: '#78350F', text: 'text-white', val: 1 },
  2: { name: 'Rojo', hex: '#DC2626', text: 'text-white', val: 2 },
  3: { name: 'Naranja', hex: '#EA580C', text: 'text-white', val: 3 },
  4: { name: 'Amarillo', hex: '#EAB308', text: 'text-stone-900', val: 4 },
  5: { name: 'Verde', hex: '#16A34A', text: 'text-white', val: 5 },
  6: { name: 'Azul', hex: '#2563EB', text: 'text-white', val: 6 },
  7: { name: 'Violeta', hex: '#9333EA', text: 'text-white', val: 7 },
  8: { name: 'Gris', hex: '#64748B', text: 'text-white', val: 8 },
  9: { name: 'Blanco', hex: '#F8FAFC', text: 'text-stone-900', val: 9 }
};

const MULTIPLIERS = {
  0: { name: 'Negro (x1)', hex: '#1C1917', factor: 1, label: 'x1' },
  1: { name: 'Marrón (x10)', hex: '#78350F', factor: 10, label: 'x10' },
  2: { name: 'Rojo (x100)', hex: '#DC2626', factor: 100, label: 'x100' },
  3: { name: 'Naranja (x1k)', hex: '#EA580C', factor: 1000, label: 'x1k' },
  4: { name: 'Amarillo (x10k)', hex: '#EAB308', factor: 1000, label: 'x10k' },
  5: { name: 'Verde (x100k)', hex: '#16A34A', factor: 100000, label: 'x100k' },
  6: { name: 'Azul (x1M)', hex: '#2563EB', factor: 1000000, label: 'x1M' },
  '-1': { name: 'Dorado (x0.1)', hex: '#D4AF37', factor: 0.1, label: 'x0.1' },
  '-2': { name: 'Plateado (x0.01)', hex: '#C0C0C0', factor: 0.01, label: 'x0.01' }
};

const TOLERANCES = {
  'gold': { name: 'Dorado (±5%)', hex: '#D4AF37', percent: 5, label: '±5%' },
  'silver': { name: 'Plateado (±10%)', hex: '#C0C0C0', percent: 10, label: '±10%' },
  'brown': { name: 'Marrón (±1%)', hex: '#78350F', percent: 1, label: '±1%' },
  'red': { name: 'Rojo (±2%)', hex: '#DC2626', percent: 2, label: '±2%' },
  'green': { name: 'Verde (±0.5%)', hex: '#16A34A', percent: 0.5, label: '±0.5%' }
};

// Encuentra el valor comercial más cercano hacia arriba (serie E12)
function findClosestCommercial(targetVal) {
  if (targetVal <= 0) return 10;
  for (let val of E12_VALUES) {
    if (val >= targetVal) return val;
  }
  return E12_VALUES[E12_VALUES.length - 1];
}

// Formatea ohmios con prefijos de ingeniería (Ω, kΩ, MΩ)
function formatOhms(val) {
  if (isNaN(val) || val <= 0) return '0 Ω';
  if (val >= 1000000) {
    return (val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 2) + ' MΩ';
  }
  if (val >= 1000) {
    return (val / 1000).toFixed(val % 1000 === 0 ? 0 : 2) + ' kΩ';
  }
  return (val % 1 === 0 ? val : val.toFixed(1)) + ' Ω';
}

// Obtiene bandas para un resistor comercial (4 bandas)
function getResistorBands(resistorValue) {
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
    let rounded = Math.round(resistorValue * 10);
    firstDigit = Math.floor(rounded / 10);
    secondDigit = rounded % 10;
    multiplierExp = -1;
  }

  const band1 = COLOR_CODES[firstDigit] || COLOR_CODES[1];
  const band2 = COLOR_CODES[secondDigit] || COLOR_CODES[0];
  const band3 = MULTIPLIERS[multiplierExp] || MULTIPLIERS[0];
  const band4 = TOLERANCES['gold'];

  return { band1, band2, band3, band4, firstDigit, secondDigit };
}

// Modo activo de la calculadora
let activeCalcMode = 'led';

// Inicializador principal
function initCalculatorView() {
  const container = document.getElementById('calculadora-container');
  if (!container) return;

  // Restaurar última sub-calculadora de localStorage
  activeCalcMode = localStorage.getItem('protolab_calc_subtab') || 'led';

  container.innerHTML = `
    <div class="flex flex-col gap-6">
      
      <!-- Selector de Calculadoras (Sub-Tabs Horizontales y Responsivas) -->
      <div class="bg-warm-card-alt dark:bg-stone-900 p-1 rounded-xl border border-warm-border dark:border-stone-800 overflow-x-auto text-xs font-heading font-semibold flex items-center gap-1 no-scrollbar">
        <button onclick="setCalcMode('led')" id="btn-calc-led" class="calc-tab-btn py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap">
          <span class="material-symbols-outlined text-[17px]">lightbulb</span>
          <span>Resistencia LED</span>
        </button>
        <button onclick="setCalcMode('divider')" id="btn-calc-divider" class="calc-tab-btn py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap">
          <span class="material-symbols-outlined text-[17px]">tune</span>
          <span>Divisor de Voltaje</span>
        </button>
        <button onclick="setCalcMode('opamp')" id="btn-calc-opamp" class="calc-tab-btn py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap">
          <span class="material-symbols-outlined text-[17px]">speed</span>
          <span>Ganancia Op-Amp</span>
        </button>
        <button onclick="setCalcMode('ohm')" id="btn-calc-ohm" class="calc-tab-btn py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap">
          <span class="material-symbols-outlined text-[17px]">electric_meter</span>
          <span>Ley de Ohm / Potencia</span>
        </button>
        <button onclick="setCalcMode('res-bands')" id="btn-calc-res-bands" class="calc-tab-btn py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap">
          <span class="material-symbols-outlined text-[17px]">palette</span>
          <span>Decodificador Bandas</span>
        </button>
        <button onclick="setCalcMode('capacitor')" id="btn-calc-capacitor" class="calc-tab-btn py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap">
          <span class="material-symbols-outlined text-[17px]">disc_full</span>
          <span>Capacitores 3 Dígitos</span>
        </button>
        <button onclick="setCalcMode('timer555')" id="btn-calc-timer555" class="calc-tab-btn py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap">
          <span class="material-symbols-outlined text-[17px]">timer</span>
          <span>NE555 Astable</span>
        </button>
      </div>

      <!-- ========================================== -->
      <!-- PANEL 1: RESISTENCIA PARA LED              -->
      <!-- ========================================== -->
      <div id="panel-calc-led" class="calc-panel space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Controles de Entrada (5 de 12) -->
          <div class="lg:col-span-5 bg-warm-card dark:bg-[#252228] p-5 rounded-2xl border border-warm-border dark:border-stone-700 space-y-4">
            <h3 class="font-heading font-bold text-sm text-warm-charcoal dark:text-stone-200 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[18px]">tune</span>
              <span>Parámetros del Circuito LED</span>
            </h3>

            <!-- Voltaje de Fuente (Vin / Vcc) -->
            <div>
              <label class="block text-xs font-semibold text-warm-charcoal dark:text-stone-300 mb-1">Voltaje de la fuente (Vin / Vcc):</label>
              <div class="flex items-center gap-2">
                <input type="number" id="led-vcc-input" step="0.1" value="5.0" min="0.5" max="36" oninput="calculateLedResistor()" 
                       class="w-full bg-white dark:bg-stone-800 text-sm font-mono font-bold text-warm-charcoal dark:text-stone-100 px-3 py-2 rounded-xl border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel">
                <span class="font-mono text-xs text-warm-gray dark:text-stone-400 font-bold">V</span>
              </div>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <button type="button" onclick="setLedVcc(3.3)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">3.3V</button>
                <button type="button" onclick="setLedVcc(5.0)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">5.0V</button>
                <button type="button" onclick="setLedVcc(9.0)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">9.0V</button>
                <button type="button" onclick="setLedVcc(12.0)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">12V</button>
              </div>
            </div>

            <!-- Color y Caída directa del LED -->
            <div>
              <label class="block text-xs font-semibold text-warm-charcoal dark:text-stone-300 mb-1">Color y Caída Directa del LED (Vled):</label>
              <select id="led-color-select" onchange="onLedColorChange()" class="w-full bg-white dark:bg-stone-800 text-xs text-warm-charcoal dark:text-stone-200 px-3 py-2 rounded-xl border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel">
                <option value="1.8" selected>🔴 LED Rojo Estándar (~1.8V)</option>
                <option value="2.1">🟢 LED Verde Estándar (~2.1V)</option>
                <option value="2.0">🟡 LED Amarillo (~2.0V)</option>
                <option value="3.2">🔵 LED Azul Ultrabrillante (~3.2V)</option>
                <option value="3.2">⚪ LED Blanco Ultrabrillante (~3.2V)</option>
                <option value="1.3">🟣 LED Infrarrojo (~1.3V)</option>
              </select>
            </div>

            <!-- Corriente Deseada IF -->
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="text-xs font-semibold text-warm-charcoal dark:text-stone-300">Corriente del LED (IF):</label>
                <span id="led-current-val" class="font-mono text-xs font-bold text-primary">15 mA</span>
              </div>
              <input type="range" id="led-current-slider" min="5" max="30" value="15" step="1" oninput="onLedCurrentSlider(this.value)" 
                     class="w-full accent-primary-pastel cursor-pointer">
              <div class="flex justify-between text-[10px] text-warm-gray dark:text-stone-400 font-mono mt-1">
                <span>5 mA (Tenue)</span>
                <span>15 mA (Estándar Seguro)</span>
                <span>30 mA (Máximo)</span>
              </div>
            </div>

            <!-- Fórmula explicada -->
            <div class="p-3 bg-white dark:bg-stone-800/60 rounded-xl border border-warm-border dark:border-stone-700 font-mono text-[11px] text-warm-gray dark:text-stone-300 leading-relaxed">
              <span class="text-primary font-bold">Fórmula de Ley de Ohm:</span><br/>
              R = (Vin - Vled) / IF<br/>
              P = (Vin - Vled) · IF
            </div>

          </div>

          <!-- Resultados y Visualizador Físico (7 de 12) -->
          <div class="lg:col-span-7 space-y-4">
            
            <!-- Banner de Error Físico (Vin <= Vled) -->
            <div id="led-calc-error" class="hidden p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs flex items-start gap-3">
              <span class="material-symbols-outlined text-alert-red text-[22px] shrink-0 mt-0.5">error</span>
              <div>
                <strong class="text-alert-red font-heading uppercase tracking-wide block">Voltaje Insuficiente para Encender el LED</strong>
                <p id="led-error-message" class="text-warm-charcoal dark:text-stone-300 mt-1 leading-relaxed"></p>
              </div>
            </div>

            <!-- Contenedor de Métricas -->
            <div id="led-results-container" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="p-4 rounded-xl bg-warm-card dark:bg-[#252228] border border-warm-border dark:border-stone-700">
                  <span class="text-[11px] font-mono text-warm-gray dark:text-stone-400 uppercase">Valor Comercial Lab</span>
                  <div class="flex items-baseline gap-1 mt-1">
                    <span id="res-comm-value" class="font-mono text-2xl font-bold text-sage-dark dark:text-sage">220</span>
                    <span class="font-heading font-semibold text-sm text-warm-gray">Ω</span>
                  </div>
                  <span class="text-[10px] text-warm-gray dark:text-stone-400 mt-1 block">Serie E12 estándar (±5%)</span>
                </div>

                <div class="p-4 rounded-xl bg-warm-card dark:bg-[#252228] border border-warm-border dark:border-stone-700">
                  <span class="text-[11px] font-mono text-warm-gray dark:text-stone-400 uppercase">Cálculo Teórico</span>
                  <div class="flex items-baseline gap-1 mt-1">
                    <span id="res-theor-value" class="font-mono text-2xl font-bold text-primary">213.3</span>
                    <span class="font-heading font-semibold text-sm text-warm-gray">Ω</span>
                  </div>
                  <span class="text-[10px] text-warm-gray dark:text-stone-400 mt-1 block">Valor matemático exacto</span>
                </div>

                <div class="p-4 rounded-xl bg-warm-card dark:bg-[#252228] border border-warm-border dark:border-stone-700">
                  <span class="text-[11px] font-mono text-warm-gray dark:text-stone-400 uppercase">Potencia Disipada</span>
                  <div class="flex items-baseline gap-1 mt-1">
                    <span id="res-power-value" class="font-mono text-2xl font-bold text-warm-charcoal dark:text-stone-100">48</span>
                    <span class="font-heading font-semibold text-sm text-warm-gray">mW</span>
                  </div>
                  <div id="res-power-badge" class="mt-1"></div>
                </div>
              </div>

              <!-- Representación Gráfica del Resistor con Bandas -->
              <div id="led-resistor-graphic" class="bg-warm-card dark:bg-[#252228] p-5 rounded-2xl border border-warm-border dark:border-stone-700 space-y-4">
                <div class="flex items-center justify-between">
                  <h4 class="font-heading font-bold text-xs uppercase tracking-wider text-warm-charcoal dark:text-stone-200 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[17px] text-primary">palette</span>
                    <span>Código de Colores (Resistencia Comercial)</span>
                  </h4>
                  <span id="res-band-summary" class="font-mono text-xs font-bold text-primary bg-primary-soft dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-primary-border">220 Ω ±5%</span>
                </div>

                <div class="w-full py-6 bg-white dark:bg-[#1E1B20] rounded-xl border border-warm-border dark:border-stone-700 flex items-center justify-center overflow-x-auto select-none">
                  <div class="relative flex items-center w-72 sm:w-80 h-16">
                    <div class="h-2 w-14 bg-stone-300 dark:bg-stone-600 rounded-l-full shadow-inner"></div>
                    <div class="relative flex-1 h-14 bg-[#EADCC9] dark:bg-[#C9BAA7] rounded-2xl border border-[#D5C4AC] flex items-center justify-between px-6 shadow-sm overflow-hidden">
                      <div class="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/15 pointer-events-none"></div>
                      <div id="band-1-ui" class="w-4 h-full bg-red-600 relative z-10 flex items-end justify-center pb-1 shadow-xs">
                        <span id="band-1-label" class="text-[9px] font-mono font-bold text-white drop-shadow">2</span>
                      </div>
                      <div id="band-2-ui" class="w-4 h-full bg-red-600 relative z-10 flex items-end justify-center pb-1 shadow-xs">
                        <span id="band-2-label" class="text-[9px] font-mono font-bold text-white drop-shadow">2</span>
                      </div>
                      <div id="band-3-ui" class="w-4 h-full bg-amber-900 relative z-10 flex items-end justify-center pb-1 shadow-xs">
                        <span id="band-3-label" class="text-[9px] font-mono font-bold text-white drop-shadow">x10</span>
                      </div>
                      <div class="w-6"></div>
                      <div id="band-4-ui" class="w-4 h-full bg-[#D4AF37] relative z-10 flex items-end justify-center pb-1 shadow-xs">
                        <span class="text-[8px] font-mono font-bold text-stone-900 drop-shadow">5%</span>
                      </div>
                    </div>
                    <div class="h-2 w-14 bg-stone-300 dark:bg-stone-600 rounded-r-full shadow-inner"></div>
                  </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div class="p-2 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700">
                    <span class="text-[10px] font-mono text-warm-gray dark:text-stone-400 block">1ra Banda</span>
                    <span id="b1-name" class="font-mono font-bold text-warm-charcoal dark:text-stone-200 mt-0.5 block">Rojo (2)</span>
                  </div>
                  <div class="p-2 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700">
                    <span class="text-[10px] font-mono text-warm-gray dark:text-stone-400 block">2da Banda</span>
                    <span id="b2-name" class="font-mono font-bold text-warm-charcoal dark:text-stone-200 mt-0.5 block">Rojo (2)</span>
                  </div>
                  <div class="p-2 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700">
                    <span class="text-[10px] font-mono text-warm-gray dark:text-stone-400 block">Multiplicador</span>
                    <span id="b3-name" class="font-mono font-bold text-warm-charcoal dark:text-stone-200 mt-0.5 block">Marrón (x10)</span>
                  </div>
                  <div class="p-2 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700">
                    <span class="text-[10px] font-mono text-warm-gray dark:text-stone-400 block">Tolerancia</span>
                    <span class="font-mono font-bold text-warm-charcoal dark:text-stone-200 mt-0.5 block">Dorado (±5%)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- ========================================== -->
      <!-- PANEL 2: DIVISOR DE VOLTAJE RESISTIVO       -->
      <!-- ========================================== -->
      <div id="panel-calc-divider" class="calc-panel hidden space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div class="lg:col-span-5 bg-warm-card dark:bg-[#252228] p-5 rounded-2xl border border-warm-border dark:border-stone-700 space-y-4">
            <h3 class="font-heading font-bold text-sm text-warm-charcoal dark:text-stone-200 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[18px]">tune</span>
              <span>Parámetros del Divisor</span>
            </h3>

            <div>
              <label class="block text-xs font-semibold text-warm-charcoal dark:text-stone-300 mb-1">Voltaje de entrada (Vin):</label>
              <div class="flex items-center gap-2">
                <input type="number" id="div-vin-input" step="0.5" value="5.0" min="0.5" max="48" oninput="calculateVoltageDivider()" 
                       class="w-full bg-white dark:bg-stone-800 text-sm font-mono font-bold text-warm-charcoal dark:text-stone-100 px-3 py-2 rounded-xl border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel">
                <span class="font-mono text-xs text-warm-gray dark:text-stone-400 font-bold">V</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-warm-charcoal dark:text-stone-300 mb-1">Voltaje de salida deseado (Vout):</label>
              <div class="flex items-center gap-2">
                <input type="number" id="div-vout-input" step="0.1" value="2.5" min="0.1" max="47" oninput="calculateVoltageDivider()" 
                       class="w-full bg-white dark:bg-stone-800 text-sm font-mono font-bold text-warm-charcoal dark:text-stone-100 px-3 py-2 rounded-xl border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel">
                <span class="font-mono text-xs text-warm-gray dark:text-stone-400 font-bold">V</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-warm-charcoal dark:text-stone-300 mb-1">Resistencia R1 sugerida:</label>
              <select id="div-r1-select" onchange="calculateVoltageDivider()" class="w-full bg-white dark:bg-stone-800 text-xs text-warm-charcoal dark:text-stone-200 px-3 py-2 rounded-xl border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel font-mono">
                <option value="1000">1 kΩ (Consumo estándar ~1mA)</option>
                <option value="10000" selected>10 kΩ (Recomendado para Lab y ADC de Arduino)</option>
                <option value="47000">47 kΩ (Bajo consumo)</option>
                <option value="100000">100 kΩ (Muy bajo consumo)</option>
              </select>
            </div>

            <div class="p-3 bg-white dark:bg-stone-800/60 rounded-xl border border-warm-border dark:border-stone-700 font-mono text-[11px] text-warm-gray dark:text-stone-300 leading-relaxed">
              <span class="text-primary font-bold">Ecuación del Divisor Pasivo:</span><br/>
              Vout = Vin · [ R2 / (R1 + R2) ]<br/>
              <span class="text-[10px] text-warm-gray mt-1 block">Condición física: 0 &lt; Vout &lt; Vin</span>
            </div>
          </div>

          <div class="lg:col-span-7 space-y-4">
            <!-- Alerta de Validación Física del Divisor -->
            <div id="div-calc-error" class="hidden p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs flex items-start gap-3">
              <span class="material-symbols-outlined text-alert-red text-[22px] shrink-0 mt-0.5">error</span>
              <div>
                <strong class="text-alert-red font-heading uppercase tracking-wide block">Restricción Física de Divisor Pasivo</strong>
                <p id="div-error-message" class="text-warm-charcoal dark:text-stone-300 mt-1 leading-relaxed"></p>
              </div>
            </div>

            <div id="div-results-wrapper" class="bg-warm-card dark:bg-[#252228] p-5 rounded-2xl border border-warm-border dark:border-stone-700 space-y-4">
              <h4 class="font-heading font-bold text-sm text-warm-charcoal dark:text-stone-200">Resistencias Comerciales Recomendadas (E12)</h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-mono font-bold text-warm-gray dark:text-stone-400">R1 (Superior)</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-warm-card-alt dark:bg-stone-900 text-warm-charcoal dark:text-stone-300">Hacia Vin</span>
                  </div>
                  <div class="mt-2">
                    <span id="div-r1-res" class="font-mono text-2xl font-bold text-primary">10 kΩ</span>
                  </div>
                  <p class="text-[11px] text-warm-gray dark:text-stone-400 mt-1">Conectada entre el riel positivo (+Vin) y el nodo central.</p>
                </div>

                <div class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-mono font-bold text-warm-gray dark:text-stone-400">R2 (Inferior)</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-warm-card-alt dark:bg-stone-900 text-warm-charcoal dark:text-stone-300">Hacia GND</span>
                  </div>
                  <div class="mt-2">
                    <span id="div-r2-res" class="font-mono text-2xl font-bold text-sage-dark dark:text-sage">10 kΩ</span>
                  </div>
                  <p class="text-[11px] text-warm-gray dark:text-stone-400 mt-1">Conectada entre el nodo central (Vout) y tierra (GND).</p>
                </div>
              </div>

              <div class="p-4 bg-white dark:bg-stone-800 rounded-xl border border-warm-border dark:border-stone-700 space-y-2.5">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-warm-gray dark:text-stone-400">Voltaje real obtenido con valores comerciales:</span>
                  <span id="div-vout-real" class="font-mono font-bold text-warm-charcoal dark:text-stone-100 text-sm">2.50 V</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-warm-gray dark:text-stone-400">Error respecto al valor deseado:</span>
                  <span id="div-error-val" class="font-mono font-bold text-sage-dark dark:text-sage text-xs">0.0%</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-warm-gray dark:text-stone-400">Corriente consumida por el divisor:</span>
                  <span id="div-current-val" class="font-mono font-bold text-warm-charcoal dark:text-stone-200 text-xs">0.25 mA</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- ========================================== -->
      <!-- PANEL 3: AMPLIFICADOR NO INVERSOR (OP-AMP) -->
      <!-- ========================================== -->
      <div id="panel-calc-opamp" class="calc-panel hidden space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div class="lg:col-span-5 bg-warm-card dark:bg-[#252228] p-5 rounded-2xl border border-warm-border dark:border-stone-700 space-y-4">
            <h3 class="font-heading font-bold text-sm text-warm-charcoal dark:text-stone-200 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[18px]">speed</span>
              <span>Ganancia Deseada (Av)</span>
            </h3>

            <div>
              <label class="block text-xs font-semibold text-warm-charcoal dark:text-stone-300 mb-1">Ganancia de voltaje deseada (Av):</label>
              <div class="flex items-center gap-2">
                <input type="number" id="opamp-gain-input" step="0.5" value="11" min="0.1" max="1000" oninput="calculateOpampGain()" 
                       class="w-full bg-white dark:bg-stone-800 text-sm font-mono font-bold text-warm-charcoal dark:text-stone-100 px-3 py-2 rounded-xl border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel">
                <span class="font-mono text-xs text-warm-gray dark:text-stone-400 font-bold">V/V</span>
              </div>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <button type="button" onclick="setOpampGain(1)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">x1 (Buffer)</button>
                <button type="button" onclick="setOpampGain(2)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">x2</button>
                <button type="button" onclick="setOpampGain(5)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">x5</button>
                <button type="button" onclick="setOpampGain(11)" class="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">x11</button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-warm-charcoal dark:text-stone-300 mb-1">Resistencia de entrada R1 sugerida:</label>
              <select id="opamp-r1-select" onchange="calculateOpampGain()" class="w-full bg-white dark:bg-stone-800 text-xs text-warm-charcoal dark:text-stone-200 px-3 py-2 rounded-xl border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel font-mono">
                <option value="1000" selected>1 kΩ (Típico estándar en Lab)</option>
                <option value="2200">2.2 kΩ</option>
                <option value="10000">10 kΩ</option>
              </select>
            </div>

            <div class="p-3 bg-white dark:bg-stone-800/60 rounded-xl border border-warm-border dark:border-stone-700 font-mono text-[11px] text-warm-gray dark:text-stone-300 leading-relaxed">
              <span class="text-primary font-bold">Fórmula de Ganancia No Inversora:</span><br/>
              Av = 1 + ( Rf / R1 )<br/>
              <span class="text-[10px] text-warm-gray mt-1 block">Condición física: Av ≥ 1.0 (ganancia unitaria mínima)</span>
            </div>
          </div>

          <div class="lg:col-span-7 space-y-4">
            <!-- Alerta si Av < 1 -->
            <div id="opamp-calc-warning" class="hidden p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs flex items-start gap-3">
              <span class="material-symbols-outlined text-amber-700 text-[22px] shrink-0 mt-0.5">warning</span>
              <div>
                <strong class="text-amber-800 dark:text-amber-300 font-heading uppercase tracking-wide block">Limitación Topológica (Av &lt; 1)</strong>
                <p id="opamp-warning-message" class="text-warm-charcoal dark:text-stone-300 mt-1 leading-relaxed"></p>
              </div>
            </div>

            <div id="opamp-results-wrapper" class="bg-warm-card dark:bg-[#252228] p-5 rounded-2xl border border-warm-border dark:border-stone-700 space-y-4">
              <h4 class="font-heading font-bold text-sm text-warm-charcoal dark:text-stone-200">Valores Comerciales para LM741 / LM358</h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-mono font-bold text-warm-gray dark:text-stone-400">Resistencia Rf (Realimentación)</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-warm-card-alt dark:bg-stone-900 text-warm-charcoal dark:text-stone-300">Pin 6 a Pin 2</span>
                  </div>
                  <div class="mt-2">
                    <span id="opamp-rf-val" class="font-mono text-2xl font-bold text-primary">10 kΩ</span>
                  </div>
                  <p class="text-[11px] text-warm-gray dark:text-stone-400 mt-1">Conectada entre salida (Pin 6) y entrada inversora (Pin 2).</p>
                </div>

                <div class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-mono font-bold text-warm-gray dark:text-stone-400">Resistencia R1 (A Tierra)</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-warm-card-alt dark:bg-stone-900 text-warm-charcoal dark:text-stone-300">Pin 2 a GND</span>
                  </div>
                  <div class="mt-2">
                    <span id="opamp-r1-val" class="font-mono text-2xl font-bold text-sage-dark dark:text-sage">1 kΩ</span>
                  </div>
                  <p class="text-[11px] text-warm-gray dark:text-stone-400 mt-1">Conectada entre entrada inversora (Pin 2) y tierra (GND).</p>
                </div>
              </div>

              <div class="p-4 bg-white dark:bg-stone-800 rounded-xl border border-warm-border dark:border-stone-700 space-y-2">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-warm-gray dark:text-stone-400">Ganancia real obtenida con valores comerciales:</span>
                  <span id="opamp-gain-real" class="font-mono font-bold text-warm-charcoal dark:text-stone-100 text-sm">11.00 x</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-warm-gray dark:text-stone-400">Ejemplo práctico con entrada de 200 mV:</span>
                  <span id="opamp-sample-out" class="font-mono font-bold text-sage-dark dark:text-sage text-xs">Saldrán 2.20 V</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- ========================================== -->
      <!-- PANEL 4: LEY DE OHM Y POTENCIA (V, I, R, P)-->
      <!-- ========================================== -->
      <div id="panel-calc-ohm" class="calc-panel hidden space-y-6">
        <div class="bg-warm-card dark:bg-[#252228] p-5 rounded-2xl border border-warm-border dark:border-stone-700 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-warm-border dark:border-stone-700">
            <div>
              <h3 class="font-heading font-bold text-base text-warm-charcoal dark:text-stone-200 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-[20px]">electric_meter</span>
                <span>Calculadora Universal de Ley de Ohm y Potencia</span>
              </h3>
              <p class="text-xs text-warm-gray dark:text-stone-400 mt-0.5">Ingresa dos valores conocidos cualesquiera; el sistema calculará instantáneamente las dos incógnitas.</p>
            </div>
            <button onclick="resetOhmInputs()" class="text-xs font-mono px-2.5 py-1 rounded bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray hover:text-primary self-start sm:self-auto">
              Limpiar valores
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Voltaje V -->
            <div class="p-3.5 bg-white dark:bg-stone-800 rounded-xl border border-warm-border dark:border-stone-700 space-y-1">
              <label class="block text-xs font-bold text-warm-charcoal dark:text-stone-200">Voltaje (V):</label>
              <div class="flex items-center gap-1.5">
                <input type="number" id="ohm-v" step="any" placeholder="Ej. 12" oninput="calculateOhmLaw('v')"
                       class="w-full bg-warm-card-alt dark:bg-stone-900 text-sm font-mono font-bold text-warm-charcoal dark:text-stone-100 px-3 py-1.5 rounded-lg border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel">
                <span class="font-mono text-xs text-warm-gray font-bold">V</span>
              </div>
            </div>

            <!-- Corriente I -->
            <div class="p-3.5 bg-white dark:bg-stone-800 rounded-xl border border-warm-border dark:border-stone-700 space-y-1">
              <label class="block text-xs font-bold text-warm-charcoal dark:text-stone-200">Corriente (I):</label>
              <div class="flex items-center gap-1.5">
                <input type="number" id="ohm-i" step="any" placeholder="Ej. 0.05" oninput="calculateOhmLaw('i')"
                       class="w-full bg-warm-card-alt dark:bg-stone-900 text-sm font-mono font-bold text-warm-charcoal dark:text-stone-100 px-3 py-1.5 rounded-lg border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel">
                <select id="ohm-i-unit" onchange="calculateOhmLaw('i')" class="bg-warm-card-alt dark:bg-stone-900 text-xs font-mono font-bold text-warm-gray rounded-lg border border-warm-border dark:border-stone-700 py-1.5 px-1">
                  <option value="A">A</option>
                  <option value="mA" selected>mA</option>
                </select>
              </div>
            </div>

            <!-- Resistencia R -->
            <div class="p-3.5 bg-white dark:bg-stone-800 rounded-xl border border-warm-border dark:border-stone-700 space-y-1">
              <label class="block text-xs font-bold text-warm-charcoal dark:text-stone-200">Resistencia (R):</label>
              <div class="flex items-center gap-1.5">
                <input type="number" id="ohm-r" step="any" placeholder="Ej. 240" oninput="calculateOhmLaw('r')"
                       class="w-full bg-warm-card-alt dark:bg-stone-900 text-sm font-mono font-bold text-warm-charcoal dark:text-stone-100 px-3 py-1.5 rounded-lg border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel">
                <select id="ohm-r-unit" onchange="calculateOhmLaw('r')" class="bg-warm-card-alt dark:bg-stone-900 text-xs font-mono font-bold text-warm-gray rounded-lg border border-warm-border dark:border-stone-700 py-1.5 px-1">
                  <option value="ohm" selected>Ω</option>
                  <option value="kohm">kΩ</option>
                </select>
              </div>
            </div>

            <!-- Potencia P -->
            <div class="p-3.5 bg-white dark:bg-stone-800 rounded-xl border border-warm-border dark:border-stone-700 space-y-1">
              <label class="block text-xs font-bold text-warm-charcoal dark:text-stone-200">Potencia (P):</label>
              <div class="flex items-center gap-1.5">
                <input type="number" id="ohm-p" step="any" placeholder="Ej. 0.6" oninput="calculateOhmLaw('p')"
                       class="w-full bg-warm-card-alt dark:bg-stone-900 text-sm font-mono font-bold text-warm-charcoal dark:text-stone-100 px-3 py-1.5 rounded-lg border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel">
                <select id="ohm-p-unit" onchange="calculateOhmLaw('p')" class="bg-warm-card-alt dark:bg-stone-900 text-xs font-mono font-bold text-warm-gray rounded-lg border border-warm-border dark:border-stone-700 py-1.5 px-1">
                  <option value="W" selected>W</option>
                  <option value="mW">mW</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Rueda de Fórmulas y Estado de Cálculo -->
          <div id="ohm-status-box" class="p-3 rounded-xl bg-white dark:bg-stone-800 text-xs font-mono text-warm-gray dark:text-stone-300 border border-warm-border dark:border-stone-700 flex items-center justify-between">
            <span id="ohm-status-text">Ingresa dos parámetros para resolver el circuito automáticamente.</span>
            <span id="ohm-calc-formula" class="font-bold text-primary">V = I · R</span>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- PANEL 5: DECODIFICADOR DE BANDAS (4 Y 5)   -->
      <!-- ========================================== -->
      <div id="panel-calc-res-bands" class="calc-panel hidden space-y-6">
        <div class="bg-warm-card dark:bg-[#252228] p-5 rounded-2xl border border-warm-border dark:border-stone-700 space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-border dark:border-stone-700">
            <div>
              <h3 class="font-heading font-bold text-base text-warm-charcoal dark:text-stone-200 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-[20px]">palette</span>
                <span>Decodificador de Código de Colores de Resistencias</span>
              </h3>
              <p class="text-xs text-warm-gray dark:text-stone-400 mt-0.5">Selecciona los colores de cada anillo para calcular su valor nominal y rango de tolerancia.</p>
            </div>
            <!-- Selector 4 vs 5 bandas -->
            <div class="flex items-center bg-white dark:bg-stone-800 p-1 rounded-xl border border-warm-border dark:border-stone-700 text-xs font-mono">
              <button onclick="setBandMode(4)" id="btn-bands-4" class="px-3 py-1 rounded-lg font-bold bg-primary text-white shadow-xs">4 Bandas (5%)</button>
              <button onclick="setBandMode(5)" id="btn-bands-5" class="px-3 py-1 rounded-lg font-medium text-warm-gray hover:text-warm-charcoal dark:hover:text-stone-100">5 Bandas (1%)</button>
            </div>
          </div>

          <!-- Selectores de color -->
          <div id="band-selectors-container" class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <!-- Inyectado por JS -->
          </div>

          <!-- Visualizador del Resistor con Bandas Elegidas -->
          <div class="p-6 bg-white dark:bg-[#1E1B20] rounded-xl border border-warm-border dark:border-stone-700 flex flex-col items-center justify-center space-y-4">
            <div class="relative flex items-center w-80 sm:w-96 h-16 select-none">
              <div class="h-2.5 w-16 bg-stone-300 dark:bg-stone-600 rounded-l-full shadow-inner"></div>
              <div class="relative flex-1 h-14 bg-[#EADCC9] dark:bg-[#C9BAA7] rounded-2xl border border-[#D5C4AC] flex items-center justify-between px-6 shadow-sm overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/15 pointer-events-none"></div>
                <div id="dec-band-1" class="w-4 h-full relative z-10 flex items-end justify-center pb-1 shadow-xs"></div>
                <div id="dec-band-2" class="w-4 h-full relative z-10 flex items-end justify-center pb-1 shadow-xs"></div>
                <div id="dec-band-3" class="w-4 h-full relative z-10 flex items-end justify-center pb-1 shadow-xs"></div>
                <div id="dec-band-mult" class="w-4 h-full relative z-10 flex items-end justify-center pb-1 shadow-xs"></div>
                <div class="w-6"></div>
                <div id="dec-band-tol" class="w-4 h-full relative z-10 flex items-end justify-center pb-1 shadow-xs"></div>
              </div>
              <div class="h-2.5 w-16 bg-stone-300 dark:bg-stone-600 rounded-r-full shadow-inner"></div>
            </div>

            <!-- Lectura Grande del Valor -->
            <div class="text-center">
              <span id="dec-res-value" class="font-mono text-3xl font-bold text-warm-charcoal dark:text-stone-100">10 kΩ</span>
              <span id="dec-res-tol" class="font-mono text-base font-bold text-primary ml-1.5">±5%</span>
              <div id="dec-res-range" class="text-xs font-mono text-warm-gray dark:text-stone-400 mt-1">Rango admisible: 9.5 kΩ a 10.5 kΩ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- PANEL 6: CAPACITORES CERÁMICOS (3 DÍGITOS)  -->
      <!-- ========================================== -->
      <div id="panel-calc-capacitor" class="calc-panel hidden space-y-6">
        <div class="bg-warm-card dark:bg-[#252228] p-5 rounded-2xl border border-warm-border dark:border-stone-700 space-y-4">
          <div class="pb-3 border-b border-warm-border dark:border-stone-700">
            <h3 class="font-heading font-bold text-base text-warm-charcoal dark:text-stone-200 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[20px]">disc_full</span>
              <span>Decodificador de Capacitores Cerámicos y de Poliéster</span>
            </h3>
            <p class="text-xs text-warm-gray dark:text-stone-400 mt-0.5">Ingresa el código numérico de 3 dígitos grabado en el encapsulado para conocer su capacidad exacta.</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div class="lg:col-span-5 space-y-3">
              <div>
                <label class="block text-xs font-semibold text-warm-charcoal dark:text-stone-300 mb-1">Código del capacitor (3 dígitos):</label>
                <div class="flex items-center gap-2">
                  <input type="text" id="cap-code-input" maxlength="4" value="104" oninput="decodeCapacitor()"
                         placeholder="Ej. 104, 222, 473"
                         class="w-full bg-white dark:bg-stone-800 text-lg font-mono font-bold text-warm-charcoal dark:text-stone-100 px-3.5 py-2 rounded-xl border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel">
                </div>
              </div>

              <!-- Atajos de códigos comunes -->
              <div>
                <span class="text-[11px] font-mono text-warm-gray dark:text-stone-400 block mb-1.5 font-semibold">Valores típicos de laboratorio:</span>
                <div class="flex flex-wrap gap-1.5">
                  <button onclick="setCapCode('104')" class="text-xs font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">104 (100nF)</button>
                  <button onclick="setCapCode('103')" class="text-xs font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">103 (10nF)</button>
                  <button onclick="setCapCode('102')" class="text-xs font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">102 (1nF)</button>
                  <button onclick="setCapCode('222')" class="text-xs font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">222 (2.2nF)</button>
                  <button onclick="setCapCode('473')" class="text-xs font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">473 (47nF)</button>
                  <button onclick="setCapCode('105')" class="text-xs font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-warm-gray dark:text-stone-300 hover:text-primary">105 (1µF)</button>
                </div>
              </div>

              <!-- Regla de lectura explicada -->
              <div class="p-3 bg-white dark:bg-stone-800/60 rounded-xl border border-warm-border dark:border-stone-700 font-mono text-[11px] text-warm-gray dark:text-stone-300 leading-relaxed">
                <span class="text-primary font-bold">Regla de los 3 dígitos (en pF):</span><br/>
                • 1er y 2do dígito = Valor significativo<br/>
                • 3er dígito = Cantidad de ceros (multiplicador en pF)<br/>
                Ejemplo 104 = 10 seguido de 4 ceros = 100,000 pF.
              </div>
            </div>

            <!-- Desglose de Resultados en las 3 escalas -->
            <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-center">
                <span class="text-[10px] font-mono text-warm-gray dark:text-stone-400 uppercase font-semibold">Picofaradios (pF)</span>
                <div class="font-mono text-xl font-bold text-warm-charcoal dark:text-stone-100 mt-1" id="cap-pf">100,000 pF</div>
                <span class="text-[10px] text-warm-gray mt-1 block">Escala base</span>
              </div>

              <div class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-center">
                <span class="text-[10px] font-mono text-warm-gray dark:text-stone-400 uppercase font-semibold">Nanofaradios (nF)</span>
                <div class="font-mono text-xl font-bold text-primary mt-1" id="cap-nf">100 nF</div>
                <span class="text-[10px] text-warm-gray mt-1 block">Uso habitual en Lab</span>
              </div>

              <div class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-center">
                <span class="text-[10px] font-mono text-warm-gray dark:text-stone-400 uppercase font-semibold">Microfaradios (µF)</span>
                <div class="font-mono text-xl font-bold text-sage-dark dark:text-sage mt-1" id="cap-uf">0.1 µF</div>
                <span class="text-[10px] text-warm-gray mt-1 block">Filtros y desacoplo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- PANEL 7: TEMPORIZADOR NE555 ASTABLE        -->
      <!-- ========================================== -->
      <div id="panel-calc-timer555" class="calc-panel hidden space-y-6">
        <div class="bg-warm-card dark:bg-[#252228] p-5 rounded-2xl border border-warm-border dark:border-stone-700 space-y-4">
          <div class="pb-3 border-b border-warm-border dark:border-stone-700">
            <h3 class="font-heading font-bold text-base text-warm-charcoal dark:text-stone-200 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[20px]">timer</span>
              <span>Calculadora de Temporizador NE555 en Modo Astable (Oscilador)</span>
            </h3>
            <p class="text-xs text-warm-gray dark:text-stone-400 mt-0.5">Calcula la frecuencia de onda cuadrada, periodo y porcentaje de ciclo de trabajo a partir de R1, R2 y C1.</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div class="lg:col-span-5 space-y-3.5">
              <div>
                <label class="block text-xs font-semibold text-warm-charcoal dark:text-stone-300 mb-1">Resistencia R1 (Vcc a Pin 7):</label>
                <div class="flex items-center gap-2">
                  <input type="number" id="t555-r1" value="10" step="0.5" min="1" oninput="calculate555Astable()"
                         class="w-full bg-white dark:bg-stone-800 text-sm font-mono font-bold text-warm-charcoal dark:text-stone-100 px-3 py-1.5 rounded-xl border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel">
                  <span class="font-mono text-xs text-warm-gray font-bold">kΩ</span>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-warm-charcoal dark:text-stone-300 mb-1">Resistencia R2 (Pin 7 a Pin 6/2):</label>
                <div class="flex items-center gap-2">
                  <input type="number" id="t555-r2" value="47" step="0.5" min="1" oninput="calculate555Astable()"
                         class="w-full bg-white dark:bg-stone-800 text-sm font-mono font-bold text-warm-charcoal dark:text-stone-100 px-3 py-1.5 rounded-xl border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel">
                  <span class="font-mono text-xs text-warm-gray font-bold">kΩ</span>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-warm-charcoal dark:text-stone-300 mb-1">Capacitor C1 (Temporización):</label>
                <div class="flex items-center gap-2">
                  <input type="number" id="t555-c" value="10" step="0.1" min="0.001" oninput="calculate555Astable()"
                         class="w-full bg-white dark:bg-stone-800 text-sm font-mono font-bold text-warm-charcoal dark:text-stone-100 px-3 py-1.5 rounded-xl border border-warm-border dark:border-stone-700 focus:outline-none focus:border-primary-pastel">
                  <select id="t555-c-unit" onchange="calculate555Astable()" class="bg-white dark:bg-stone-800 text-xs font-mono font-bold text-warm-gray rounded-xl border border-warm-border dark:border-stone-700 py-1.5 px-2">
                    <option value="uF" selected>µF</option>
                    <option value="nF">nF</option>
                  </select>
                </div>
              </div>

              <div class="p-3 bg-white dark:bg-stone-800/60 rounded-xl border border-warm-border dark:border-stone-700 font-mono text-[11px] text-warm-gray dark:text-stone-300 leading-relaxed">
                <span class="text-primary font-bold">Fórmulas Astable 555:</span><br/>
                • f = 1.44 / [(R1 + 2·R2) · C]<br/>
                • Thigh = 0.693 · (R1 + R2) · C<br/>
                • Tlow = 0.693 · R2 · C
              </div>
            </div>

            <div class="lg:col-span-7 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-center">
                  <span class="text-[10px] font-mono text-warm-gray dark:text-stone-400 uppercase font-semibold">Frecuencia (f)</span>
                  <div id="t555-freq" class="font-mono text-2xl font-bold text-primary mt-1">1.38 Hz</div>
                  <span class="text-[10px] text-warm-gray mt-1 block">Oscilaciones por segundo</span>
                </div>

                <div class="p-4 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 text-center">
                  <span class="text-[10px] font-mono text-warm-gray dark:text-stone-400 uppercase font-semibold">Periodo Total (T)</span>
                  <div id="t555-period" class="font-mono text-2xl font-bold text-sage-dark dark:text-sage mt-1">723 ms</div>
                  <span class="text-[10px] text-warm-gray mt-1 block">Duración de un ciclo completo</span>
                </div>
              </div>

              <div class="p-4 bg-white dark:bg-stone-800 rounded-xl border border-warm-border dark:border-stone-700 space-y-2">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-warm-gray dark:text-stone-400">Tiempo en nivel ALTO (Thigh):</span>
                  <span id="t555-thigh" class="font-mono font-bold text-warm-charcoal dark:text-stone-200">395 ms</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-warm-gray dark:text-stone-400">Tiempo en nivel BAJO (Tlow):</span>
                  <span id="t555-tlow" class="font-mono font-bold text-warm-charcoal dark:text-stone-200">326 ms</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-warm-gray dark:text-stone-400">Ciclo de Trabajo (Duty Cycle):</span>
                  <span id="t555-duty" class="font-mono font-bold text-primary">54.8 %</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  // Inicializar sub-modo activo
  setCalcMode(activeCalcMode);

  // Ejecutar cálculos iniciales
  calculateLedResistor();
  calculateVoltageDivider();
  calculateOpampGain();
  initBandDecoder();
  decodeCapacitor();
  calculate555Astable();
}

// ==========================================================================
// CONTROLADOR DE SUB-TABS
// ==========================================================================
function setCalcMode(mode) {
  activeCalcMode = mode;
  localStorage.setItem('protolab_calc_subtab', mode);

  document.querySelectorAll('.calc-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.calc-tab-btn').forEach(b => {
    b.className = "calc-tab-btn py-2 px-3 rounded-lg transition-all text-warm-gray dark:text-stone-400 hover:text-warm-charcoal dark:hover:text-stone-100 flex items-center gap-1.5 whitespace-nowrap";
  });

  const activePanel = document.getElementById('panel-calc-' + mode);
  const activeBtn = document.getElementById('btn-calc-' + mode);
  if (activePanel) activePanel.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.className = "calc-tab-btn py-2 px-3 rounded-lg transition-all bg-white dark:bg-stone-800 text-primary dark:text-primary-pastel shadow-xs border border-primary-border flex items-center gap-1.5 whitespace-nowrap font-bold";
  }
}

// ==========================================================================
// 1. CÁLCULO DE RESISTENCIA LED CON VALIDACIONES Y POTENCIA REACTIVA
// ==========================================================================
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
  const errorBox = document.getElementById('led-calc-error');
  const errorMsg = document.getElementById('led-error-message');
  const resultsContainer = document.getElementById('led-results-container');

  if (!vccInput || !colorSelect || !currentSlider) return;

  const vcc = parseFloat(vccInput.value);
  const vled = parseFloat(colorSelect.value);
  const i_mA = parseFloat(currentSlider.value) || 15;
  const i_A = i_mA / 1000;

  // VALIDACIÓN FÍSICA: Vin <= Vled
  if (isNaN(vcc) || vcc <= vled) {
    if (errorBox && errorMsg) {
      errorBox.classList.remove('hidden');
      errorMsg.textContent = `El voltaje de alimentación (${(vcc || 0).toFixed(1)}V) es menor o igual a la caída directa del LED seleccionado (${vled.toFixed(1)}V). Un diodo semiconductor no conducirá corriente ni encenderá hasta superar este umbral de tensión.`;
    }
    // Ocultar resultados no válidos
    const commEl = document.getElementById('res-comm-value');
    const theorEl = document.getElementById('res-theor-value');
    const powerEl = document.getElementById('res-power-value');
    const badgeEl = document.getElementById('res-power-badge');
    const graphicEl = document.getElementById('led-resistor-graphic');

    if (commEl) commEl.textContent = '--';
    if (theorEl) theorEl.textContent = '--';
    if (powerEl) powerEl.textContent = '0';
    if (badgeEl) {
      badgeEl.innerHTML = `<span class="text-[10px] text-warm-gray font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800">Sin conducción (LED apagado)</span>`;
    }
    if (graphicEl) graphicEl.style.opacity = '0.4';
    return;
  }

  // Si Vin > Vled, flujo normal
  if (errorBox) errorBox.classList.add('hidden');
  const graphicEl = document.getElementById('led-resistor-graphic');
  if (graphicEl) graphicEl.style.opacity = '1';

  // R = (Vcc - Vled) / I
  const theoreticalR = (vcc - vled) / i_A;
  const commercialR = findClosestCommercial(theoreticalR);

  // Potencia real disipada por la resistencia comercial en el circuito:
  // I_real = (Vcc - Vled) / R_commercial
  const realCurrent_A = (vcc - vled) / commercialR;
  const powerWatts = (realCurrent_A * realCurrent_A) * commercialR;
  const power_mW = Math.round(powerWatts * 1000);

  // Actualizar DOM
  const commEl = document.getElementById('res-comm-value');
  const theorEl = document.getElementById('res-theor-value');
  const powerEl = document.getElementById('res-power-value');
  const summaryEl = document.getElementById('res-band-summary');
  const badgeEl = document.getElementById('res-power-badge');

  if (commEl) commEl.textContent = commercialR >= 1000 ? (commercialR / 1000).toFixed(commercialR % 1000 === 0 ? 0 : 1) + ' k' : commercialR;
  if (theorEl) theorEl.textContent = theoreticalR >= 1000 ? (theoreticalR / 1000).toFixed(2) + ' k' : theoreticalR.toFixed(1);
  if (powerEl) powerEl.textContent = power_mW;
  if (summaryEl) summaryEl.textContent = formatOhms(commercialR) + ' ±5%';

  // Badge reactivo de potencia térmica (1/4 W = 250 mW)
  if (badgeEl) {
    if (power_mW < 150) {
      badgeEl.innerHTML = `<span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sage-soft text-sage-dark dark:bg-emerald-950/40 dark:text-emerald-300 border border-sage/40">✓ Seguro (&lt; 150 mW, 1/4W frío)</span>`;
    } else if (power_mW < 250) {
      badgeEl.innerHTML = `<span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300">⚠️ Precaución (${power_mW} mW): resistencia tibia (límite 1/4W)</span>`;
    } else {
      badgeEl.innerHTML = `<span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-alert-red dark:bg-red-950/60 dark:text-red-300 border border-red-300 animate-pulse">🚨 Crítico (${power_mW} mW ≥ 250mW): ¡Se quemará de 1/4W! Usa 1/2W o baja corriente</span>`;
    }
  }

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

// ==========================================================================
// 2. DIVISOR DE VOLTAJE CON VALIDACIONES ESTRICTAS
// ==========================================================================
function calculateVoltageDivider() {
  const vinInput = document.getElementById('div-vin-input');
  const voutInput = document.getElementById('div-vout-input');
  const r1Select = document.getElementById('div-r1-select');
  const errorBox = document.getElementById('div-calc-error');
  const errorMsg = document.getElementById('div-error-message');
  const wrapper = document.getElementById('div-results-wrapper');

  if (!vinInput || !voutInput || !r1Select) return;

  const vin = parseFloat(vinInput.value);
  const voutDesired = parseFloat(voutInput.value);
  const r1 = parseFloat(r1Select.value) || 10000;

  // VALIDACIÓN FÍSICA: 0 < Vout < Vin
  if (isNaN(vin) || isNaN(voutDesired) || voutDesired >= vin || voutDesired <= 0) {
    if (errorBox && errorMsg) {
      errorBox.classList.remove('hidden');
      if (voutDesired >= vin) {
        errorMsg.textContent = `Un divisor resistivo pasivo solo puede atenuar tensión (0 < Vout < Vin). No es físicamente posible obtener ${voutDesired}V a partir de ${vin}V de entrada con resistencias pasivas. Para elevar voltaje se requiere un convertidor activo elevador (Boost DC-DC).`;
      } else {
        errorMsg.textContent = `El voltaje de salida deseado debe ser mayor a 0V.`;
      }
    }
    if (wrapper) wrapper.style.opacity = '0.35';
    const r2El = document.getElementById('div-r2-res');
    const realEl = document.getElementById('div-vout-real');
    const errEl = document.getElementById('div-error-val');
    const currEl = document.getElementById('div-current-val');
    if (r2El) r2El.textContent = '--';
    if (realEl) realEl.textContent = '--';
    if (errEl) errEl.textContent = '--';
    if (currEl) currEl.textContent = '--';
    return;
  }

  // Flujo normal válido
  if (errorBox) errorBox.classList.add('hidden');
  if (wrapper) wrapper.style.opacity = '1';

  // R2 = (Vout * R1) / (Vin - Vout)
  const theoreticalR2 = (voutDesired * r1) / (vin - voutDesired);
  const commercialR2 = findClosestCommercial(theoreticalR2);

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
  if (errEl) {
    errEl.textContent = errorPercent.toFixed(1) + '%';
    errEl.className = errorPercent < 2 
      ? 'font-mono font-bold text-sage-dark dark:text-sage text-xs' 
      : 'font-mono font-bold text-amber-700 dark:text-amber-300 text-xs';
  }
  if (currEl) currEl.textContent = current_mA.toFixed(2) + ' mA';
}

// ==========================================================================
// 3. AMPLIFICADOR NO INVERSOR CON VALIDACIÓN AV >= 1
// ==========================================================================
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
  const warningBox = document.getElementById('opamp-calc-warning');
  const warningMsg = document.getElementById('opamp-warning-message');

  if (!gainInput || !r1Select) return;

  const gain = parseFloat(gainInput.value);
  const r1 = parseFloat(r1Select.value) || 1000;

  // VALIDACIÓN: Av < 1.0
  if (isNaN(gain) || gain < 1.0) {
    if (warningBox && warningMsg) {
      warningBox.classList.remove('hidden');
      warningMsg.textContent = `La configuración no-inversora tiene una ganancia mínima unitaria (Av = 1 + Rf/R1 ≥ 1). No puede atenuar señales por debajo de su amplitud original (Av < 1). Para atenuar se requiere un divisor de tensión previo o un amplificador inversor.`;
    }
  } else {
    if (warningBox) warningBox.classList.add('hidden');
  }

  // Cálculo
  let commercialRf = 0;
  if (gain <= 1.0 || isNaN(gain)) {
    commercialRf = 0; // Seguidor de tensión (Buffer)
  } else {
    const theoreticalRf = (gain - 1) * r1;
    commercialRf = findClosestCommercial(theoreticalRf);
  }

  const realGain = commercialRf === 0 ? 1.0 : (1 + (commercialRf / r1));
  const sampleVin = 0.2; // 200mV
  const sampleVout = sampleVin * realGain;

  // Actualizar DOM
  const rfEl = document.getElementById('opamp-rf-val');
  const r1El = document.getElementById('opamp-r1-val');
  const gainRealEl = document.getElementById('opamp-gain-real');
  const sampleOutEl = document.getElementById('opamp-sample-out');

  if (rfEl) rfEl.textContent = commercialRf === 0 ? '0 Ω (Buffer / Seguidor)' : formatOhms(commercialRf);
  if (r1El) r1El.textContent = commercialRf === 0 ? 'No conectado (Abierto)' : formatOhms(r1);
  if (gainRealEl) gainRealEl.textContent = realGain.toFixed(2) + ' x';
  if (sampleOutEl) sampleOutEl.textContent = `Saldrán ${(sampleVout).toFixed(2)} V`;
}

// ==========================================================================
// 4. LEY DE OHM Y POTENCIA (V, I, R, P)
// ==========================================================================
let lastOhmEdited = [];

function calculateOhmLaw(fieldChanged) {
  if (!lastOhmEdited.includes(fieldChanged)) {
    lastOhmEdited.push(fieldChanged);
    if (lastOhmEdited.length > 2) {
      lastOhmEdited.shift();
    }
  }

  const vIn = document.getElementById('ohm-v');
  const iIn = document.getElementById('ohm-i');
  const rIn = document.getElementById('ohm-r');
  const pIn = document.getElementById('ohm-p');
  const statusText = document.getElementById('ohm-status-text');
  const formulaText = document.getElementById('ohm-calc-formula');

  const iUnit = document.getElementById('ohm-i-unit').value;
  const rUnit = document.getElementById('ohm-r-unit').value;
  const pUnit = document.getElementById('ohm-p-unit').value;

  // Convertir a unidades base (V, A, Ohm, W)
  let v = parseFloat(vIn.value);
  let i = parseFloat(iIn.value);
  let r = parseFloat(rIn.value);
  let p = parseFloat(pIn.value);

  if (!isNaN(i)) i = (iUnit === 'mA') ? i / 1000 : i;
  if (!isNaN(r)) r = (rUnit === 'kohm') ? r * 1000 : r;
  if (!isNaN(p)) p = (pUnit === 'mW') ? p / 1000 : p;

  const hasV = !isNaN(v) && v > 0;
  const hasI = !isNaN(i) && i > 0;
  const hasR = !isNaN(r) && r > 0;
  const hasP = !isNaN(p) && p > 0;

  let count = (hasV ? 1 : 0) + (hasI ? 1 : 0) + (hasR ? 1 : 0) + (hasP ? 1 : 0);

  if (count < 2) {
    if (statusText) statusText.textContent = "Ingresa al menos 2 valores conocidos para calcular el resto.";
    return;
  }

  let formulaUsed = "";

  // Casos de resolución matemática
  if (hasV && hasI) {
    r = v / i;
    p = v * i;
    formulaUsed = "R = V / I  |  P = V · I";
  } else if (hasV && hasR) {
    i = v / r;
    p = (v * v) / r;
    formulaUsed = "I = V / R  |  P = V² / R";
  } else if (hasV && hasP) {
    i = p / v;
    r = (v * v) / p;
    formulaUsed = "I = P / V  |  R = V² / P";
  } else if (hasI && hasR) {
    v = i * r;
    p = (i * i) * r;
    formulaUsed = "V = I · R  |  P = I² · R";
  } else if (hasI && hasP) {
    v = p / i;
    r = p / (i * i);
    formulaUsed = "V = P / I  |  R = P / I²";
  } else if (hasR && hasP) {
    v = Math.sqrt(p * r);
    i = Math.sqrt(p / r);
    formulaUsed = "V = √(P · R)  |  I = √(P / R)";
  }

  // Reflejar resultados formateados
  if (vIn && (!hasV || lastOhmEdited.includes('v') === false)) vIn.value = v.toFixed(2);
  if (iIn && (!hasI || lastOhmEdited.includes('i') === false)) {
    iIn.value = (iUnit === 'mA') ? (i * 1000).toFixed(2) : i.toFixed(4);
  }
  if (rIn && (!hasR || lastOhmEdited.includes('r') === false)) {
    rIn.value = (rUnit === 'kohm') ? (r / 1000).toFixed(2) : r.toFixed(1);
  }
  if (pIn && (!hasP || lastOhmEdited.includes('p') === false)) {
    pIn.value = (pUnit === 'mW') ? (p * 1000).toFixed(1) : p.toFixed(3);
  }

  if (statusText) statusText.textContent = "✓ Circuito resuelto con éxito.";
  if (formulaText) formulaText.textContent = formulaUsed;
}

function resetOhmInputs() {
  lastOhmEdited = [];
  document.getElementById('ohm-v').value = '';
  document.getElementById('ohm-i').value = '';
  document.getElementById('ohm-r').value = '';
  document.getElementById('ohm-p').value = '';
  document.getElementById('ohm-status-text').textContent = "Valores limpiados. Ingresa 2 parámetros.";
  document.getElementById('ohm-calc-formula').textContent = "V = I · R";
}

// ==========================================================================
// 5. DECODIFICADOR DE BANDAS (4 Y 5 BANDAS)
// ==========================================================================
let currentBandMode = 4;
let selectedBands = { b1: 1, b2: 0, b3: 0, mult: 2, tol: 'gold' };

function setBandMode(mode) {
  currentBandMode = mode;
  const b4 = document.getElementById('btn-bands-4');
  const b5 = document.getElementById('btn-bands-5');
  if (mode === 4) {
    b4.className = "px-3 py-1 rounded-lg font-bold bg-primary text-white shadow-xs";
    b5.className = "px-3 py-1 rounded-lg font-medium text-warm-gray hover:text-warm-charcoal dark:hover:text-stone-100";
  } else {
    b5.className = "px-3 py-1 rounded-lg font-bold bg-primary text-white shadow-xs";
    b4.className = "px-3 py-1 rounded-lg font-medium text-warm-gray hover:text-warm-charcoal dark:hover:text-stone-100";
  }
  renderBandSelectors();
  updateBandDecoder();
}

function initBandDecoder() {
  renderBandSelectors();
  updateBandDecoder();
}

function renderBandSelectors() {
  const container = document.getElementById('band-selectors-container');
  if (!container) return;

  const colorOptions = Object.keys(COLOR_CODES).map(k => {
    return `<option value="${k}">${COLOR_CODES[k].name} (${COLOR_CODES[k].val})</option>`;
  }).join('');

  const multOptions = Object.keys(MULTIPLIERS).map(k => {
    return `<option value="${k}">${MULTIPLIERS[k].name}</option>`;
  }).join('');

  const tolOptions = Object.keys(TOLERANCES).map(k => {
    return `<option value="${k}">${TOLERANCES[k].name}</option>`;
  }).join('');

  let html = `
    <div class="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700">
      <label class="block text-[11px] font-mono text-warm-gray dark:text-stone-400 mb-1">1ra Banda</label>
      <select id="dec-sel-b1" onchange="onBandChange()" class="w-full text-xs font-mono py-1 px-1 rounded bg-warm-card-alt dark:bg-stone-900 border border-warm-border dark:border-stone-700">
        ${colorOptions}
      </select>
    </div>
    <div class="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700">
      <label class="block text-[11px] font-mono text-warm-gray dark:text-stone-400 mb-1">2da Banda</label>
      <select id="dec-sel-b2" onchange="onBandChange()" class="w-full text-xs font-mono py-1 px-1 rounded bg-warm-card-alt dark:bg-stone-900 border border-warm-border dark:border-stone-700">
        ${colorOptions}
      </select>
    </div>
  `;

  if (currentBandMode === 5) {
    html += `
      <div class="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700">
        <label class="block text-[11px] font-mono text-warm-gray dark:text-stone-400 mb-1">3ra Banda (Dígito)</label>
        <select id="dec-sel-b3" onchange="onBandChange()" class="w-full text-xs font-mono py-1 px-1 rounded bg-warm-card-alt dark:bg-stone-900 border border-warm-border dark:border-stone-700">
          ${colorOptions}
        </select>
      </div>
    `;
  }

  html += `
    <div class="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700">
      <label class="block text-[11px] font-mono text-warm-gray dark:text-stone-400 mb-1">Multiplicador</label>
      <select id="dec-sel-mult" onchange="onBandChange()" class="w-full text-xs font-mono py-1 px-1 rounded bg-warm-card-alt dark:bg-stone-900 border border-warm-border dark:border-stone-700">
        ${multOptions}
      </select>
    </div>
    <div class="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700">
      <label class="block text-[11px] font-mono text-warm-gray dark:text-stone-400 mb-1">Tolerancia</label>
      <select id="dec-sel-tol" onchange="onBandChange()" class="w-full text-xs font-mono py-1 px-1 rounded bg-warm-card-alt dark:bg-stone-900 border border-warm-border dark:border-stone-700">
        ${tolOptions}
      </select>
    </div>
  `;

  container.innerHTML = html;

  // Restaurar selecciones actuales
  const s1 = document.getElementById('dec-sel-b1');
  const s2 = document.getElementById('dec-sel-b2');
  const s3 = document.getElementById('dec-sel-b3');
  const sm = document.getElementById('dec-sel-mult');
  const st = document.getElementById('dec-sel-tol');
  if (s1) s1.value = selectedBands.b1;
  if (s2) s2.value = selectedBands.b2;
  if (s3) s3.value = selectedBands.b3;
  if (sm) sm.value = selectedBands.mult;
  if (st) st.value = selectedBands.tol;
}

function onBandChange() {
  const s1 = document.getElementById('dec-sel-b1');
  const s2 = document.getElementById('dec-sel-b2');
  const s3 = document.getElementById('dec-sel-b3');
  const sm = document.getElementById('dec-sel-mult');
  const st = document.getElementById('dec-sel-tol');

  if (s1) selectedBands.b1 = parseInt(s1.value);
  if (s2) selectedBands.b2 = parseInt(s2.value);
  if (s3) selectedBands.b3 = parseInt(s3.value);
  if (sm) selectedBands.mult = parseInt(sm.value);
  if (st) selectedBands.tol = st.value;

  updateBandDecoder();
}

function updateBandDecoder() {
  const b1UI = document.getElementById('dec-band-1');
  const b2UI = document.getElementById('dec-band-2');
  const b3UI = document.getElementById('dec-band-3');
  const bMultUI = document.getElementById('dec-band-mult');
  const bTolUI = document.getElementById('dec-band-tol');

  const valEl = document.getElementById('dec-res-value');
  const tolEl = document.getElementById('dec-res-tol');
  const rangeEl = document.getElementById('dec-res-range');

  const c1 = COLOR_CODES[selectedBands.b1] || COLOR_CODES[1];
  const c2 = COLOR_CODES[selectedBands.b2] || COLOR_CODES[0];
  const c3 = COLOR_CODES[selectedBands.b3] || COLOR_CODES[0];
  const cm = MULTIPLIERS[selectedBands.mult] || MULTIPLIERS[2];
  const ct = TOLERANCES[selectedBands.tol] || TOLERANCES['gold'];

  if (b1UI) b1UI.style.backgroundColor = c1.hex;
  if (b2UI) b2UI.style.backgroundColor = c2.hex;
  if (bMultUI) bMultUI.style.backgroundColor = cm.hex;
  if (bTolUI) bTolUI.style.backgroundColor = ct.hex;

  let totalOhms = 0;
  if (currentBandMode === 4) {
    if (b3UI) b3UI.style.display = 'none';
    const baseNum = c1.val * 10 + c2.val;
    totalOhms = baseNum * cm.factor;
  } else {
    if (b3UI) {
      b3UI.style.display = 'flex';
      b3UI.style.backgroundColor = c3.hex;
    }
    const baseNum = c1.val * 100 + c2.val * 10 + c3.val;
    totalOhms = baseNum * cm.factor;
  }

  const tolPerc = ct.percent;
  const minOhms = totalOhms * (1 - tolPerc / 100);
  const maxOhms = totalOhms * (1 + tolPerc / 100);

  if (valEl) valEl.textContent = formatOhms(totalOhms);
  if (tolEl) tolEl.textContent = ct.label;
  if (rangeEl) rangeEl.textContent = `Rango admisible (${ct.label}): ${formatOhms(minOhms)} a ${formatOhms(maxOhms)}`;
}

// ==========================================================================
// 6. DECODIFICADOR DE CAPACITORES CERÁMICOS (3 DÍGITOS)
// ==========================================================================
function setCapCode(code) {
  const input = document.getElementById('cap-code-input');
  if (input) {
    input.value = code;
    decodeCapacitor();
  }
}

function decodeCapacitor() {
  const input = document.getElementById('cap-code-input');
  const pfEl = document.getElementById('cap-pf');
  const nfEl = document.getElementById('cap-nf');
  const ufEl = document.getElementById('cap-uf');

  if (!input || !pfEl || !nfEl || !ufEl) return;

  const raw = input.value.trim();
  if (raw.length === 0) {
    pfEl.textContent = '--';
    nfEl.textContent = '--';
    ufEl.textContent = '--';
    return;
  }

  const num = parseInt(raw);
  if (isNaN(num)) {
    pfEl.textContent = 'Inválido';
    nfEl.textContent = 'Inválido';
    ufEl.textContent = 'Inválido';
    return;
  }

  let pF = 0;
  if (raw.length <= 2) {
    pF = num; // Valores directos en pF (ej. 22 = 22pF)
  } else {
    const d1 = parseInt(raw[0]);
    const d2 = parseInt(raw[1]);
    const mult = parseInt(raw[2]);
    pF = (d1 * 10 + d2) * Math.pow(10, mult);
  }

  const nF = pF / 1000;
  const uF = pF / 1000000;

  pfEl.textContent = pF.toLocaleString() + ' pF';
  nfEl.textContent = (nF % 1 === 0 ? nF : nF.toFixed(2)) + ' nF';
  ufEl.textContent = (uF < 0.001 ? uF.toExponential(2) : (uF % 1 === 0 ? uF : uF.toFixed(4))) + ' µF';
}

// ==========================================================================
// 7. CALCULADORA NE555 ASTABLE
// ==========================================================================
function calculate555Astable() {
  const r1In = document.getElementById('t555-r1');
  const r2In = document.getElementById('t555-r2');
  const cIn = document.getElementById('t555-c');
  const cUnit = document.getElementById('t555-c-unit')?.value || 'uF';

  const freqEl = document.getElementById('t555-freq');
  const periodEl = document.getElementById('t555-period');
  const thighEl = document.getElementById('t555-thigh');
  const tlowEl = document.getElementById('t555-tlow');
  const dutyEl = document.getElementById('t555-duty');

  if (!r1In || !r2In || !cIn || !freqEl) return;

  const r1 = (parseFloat(r1In.value) || 10) * 1000; // a Ohms
  const r2 = (parseFloat(r2In.value) || 47) * 1000; // a Ohms
  let c = parseFloat(cIn.value) || 10;
  c = (cUnit === 'uF') ? c * 1e-6 : c * 1e-9; // a Faradios

  // Fórmulas Astable 555
  // Thigh = 0.693 * (R1 + R2) * C
  // Tlow = 0.693 * R2 * C
  // T = Thigh + Tlow
  // f = 1.44 / ((R1 + 2*R2) * C)
  const tHigh_s = 0.693 * (r1 + r2) * c;
  const tLow_s = 0.693 * r2 * c;
  const tTotal_s = tHigh_s + tLow_s;
  const freq_hz = 1.44 / ((r1 + 2 * r2) * c);
  const dutyCycle = (tHigh_s / tTotal_s) * 100;

  // Formato
  if (freq_hz >= 1000) {
    freqEl.textContent = (freq_hz / 1000).toFixed(2) + ' kHz';
  } else {
    freqEl.textContent = freq_hz.toFixed(2) + ' Hz';
  }

  if (tTotal_s >= 1) {
    periodEl.textContent = tTotal_s.toFixed(2) + ' s';
  } else {
    periodEl.textContent = (tTotal_s * 1000).toFixed(1) + ' ms';
  }

  thighEl.textContent = (tHigh_s >= 1) ? tHigh_s.toFixed(2) + ' s' : (tHigh_s * 1000).toFixed(1) + ' ms';
  tlowEl.textContent = (tLow_s >= 1) ? tLow_s.toFixed(2) + ' s' : (tLow_s * 1000).toFixed(1) + ' ms';
  dutyEl.textContent = dutyCycle.toFixed(1) + ' %';
}

// Escuchar cambios globales de voltaje de referencia del laboratorio
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
