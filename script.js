(() => {
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');

  const startStopBtn = document.getElementById('startStop');
  const stepBtn = document.getElementById('step');
  const randomBtn = document.getElementById('randomize');
  const clearBtn = document.getElementById('clear');
  const speedInput = document.getElementById('speed');
  const rowsInput = document.getElementById('rows');
  const colsInput = document.getElementById('cols');
  const resizeBtn = document.getElementById('resizeGrid');
  const gridlinesToggle = document.getElementById('gridlinesToggle');
  const presetSelect = document.getElementById('presetSelect');
  const applyPresetBtn = document.getElementById('applyPreset');

  let rows = parseInt(rowsInput.value, 10) || 50;
  let cols = parseInt(colsInput.value, 10) || 50;
  let grid = createGrid(rows, cols);
  let running = false;
  let timer = null;

  function createGrid(r, c) {
    const a = new Array(r);
    for (let i = 0; i < r; i++) {
      a[i] = new Uint8Array(c);
    }
    return a;
  }

  function randomizeGrid() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid[r][c] = Math.random() < 0.3 ? 1 : 0;
      }
    }
    render();
  }

  const PRESETS = {
    'Glider': [
      '.O.',
      '..O',
      'OOO'
    ],
    'Lightweight spaceship': [
      '.O..O',
      'O....',
      'O...O',
      'OOOO.'
    ],
    'Pulsar': [
      '..OOO...OOO..',
      '..............',
      '.O....O.O....O.',
      '.O....O.O....O.',
      '.O....O.O....O.',
      '..OOO...OOO..',
      '..............',
      '..OOO...OOO..',
      '.O....O.O....O.',
      '.O....O.O....O.',
      '.O....O.O....O.',
      '..............',
      '..OOO...OOO..'
    ],
    'Gosper glider gun': [
      '........................O...........',
      '......................O.O...........',
      '............OO......OO............OO',
      '...........O...O....OO............OO',
      'OO........O.....O...OO..............',
      'OO........O...O.OO....O.O...........',
      '..........O.....O......O.O..........',
      '...........O...O....................',
      '............OO.....................'
    ]
  };

  function applyPreset(name) {
    const lines = PRESETS[name];
    if (!lines) return;
    // clear and center pattern
    clearGrid();
    const patternRows = lines.length;
    const patternCols = Math.max(...lines.map(l => l.length));
    const startR = Math.floor((rows - patternRows) / 2);
    const startC = Math.floor((cols - patternCols) / 2);
    for (let pr = 0; pr < patternRows; pr++) {
      const line = lines[pr];
      for (let pc = 0; pc < line.length; pc++) {
        const ch = line[pc];
        if (ch === 'O' || ch === 'o') {
          const r = startR + pr;
          const c = startC + pc;
          if (r >= 0 && r < rows && c >= 0 && c < cols) grid[r][c] = 1;
        }
      }
    }
    render();
  }

  function clearGrid() {
    for (let r = 0; r < rows; r++) grid[r].fill(0);
    render();
  }

  function countNeighbors(r, c) {
    let sum = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = (r + dr + rows) % rows;
        const nc = (c + dc + cols) % cols;
        sum += grid[nr][nc];
      }
    }
    return sum;
  }

  function step() {
    const next = createGrid(rows, cols);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const n = countNeighbors(r, c);
        if (grid[r][c]) {
          next[r][c] = (n === 2 || n === 3) ? 1 : 0;
        } else {
          next[r][c] = (n === 3) ? 1 : 0;
        }
      }
    }
    grid = next;
    render();
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * devicePixelRatio);
    canvas.height = Math.floor(rect.height * devicePixelRatio);
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    render();
  }

  window.addEventListener('resize', resizeCanvas);

  function render() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    const cellW = w / cols;
    const cellH = h / rows;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // draw cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c]) {
          ctx.fillStyle = '#222';
          ctx.fillRect(c * cellW, r * cellH, Math.ceil(cellW), Math.ceil(cellH));
        }
      }
    }

    // grid lines when enabled or large enough
    if (gridlinesToggle && (gridlinesToggle.checked || (cellW > 6 && cellH > 6))) {
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.beginPath();
      for (let r = 0; r <= rows; r++) {
        ctx.moveTo(0, r * cellH + 0.5);
        ctx.lineTo(w, r * cellH + 0.5);
      }
      for (let c = 0; c <= cols; c++) {
        ctx.moveTo(c * cellW + 0.5, 0);
        ctx.lineTo(c * cellW + 0.5, h);
      }
      ctx.stroke();
    }
  }

  function canvasCoordsToCell(x, y) {
    const rect = canvas.getBoundingClientRect();
    const cx = x - rect.left;
    const cy = y - rect.top;
    const c = Math.floor((cx / rect.width) * cols);
    const r = Math.floor((cy / rect.height) * rows);
    return { r, c };
  }

  canvas.addEventListener('click', e => {
    const { r, c } = canvasCoordsToCell(e.clientX, e.clientY);
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[r][c] = grid[r][c] ? 0 : 1;
      render();
    }
  });

  // keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.isContentEditable)) return;
    if (e.code === 'Space') {
      e.preventDefault(); startStopBtn.click();
      return;
    }
    const key = (e.key || '').toLowerCase();
    if (key === 'n') stepBtn.click();
    if (key === 'r') randomBtn.click();
    if (key === 'c') clearBtn.click();
    if (key === 'g') { if (gridlinesToggle) { gridlinesToggle.checked = !gridlinesToggle.checked; render(); } }
  });

  startStopBtn.addEventListener('click', () => {
    running = !running;
    startStopBtn.textContent = running ? 'Stop' : 'Start';
    if (running) startTimer(); else stopTimer();
  });

  function startTimer() {
    stopTimer();
    const speed = Math.max(1, parseInt(speedInput.value, 10) || 8);
    const interval = Math.round(1000 / speed);
    timer = setInterval(step, interval);
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  stepBtn.addEventListener('click', () => { step(); });
  randomBtn.addEventListener('click', () => { randomizeGrid(); });
  clearBtn.addEventListener('click', () => { clearGrid(); });

  resizeBtn.addEventListener('click', () => {
    const r = Math.max(10, Math.min(200, parseInt(rowsInput.value, 10) || 50));
    const c = Math.max(10, Math.min(200, parseInt(colsInput.value, 10) || 50));
    rows = r; cols = c;
    grid = createGrid(rows, cols);
    render();
  });

  applyPresetBtn.addEventListener('click', () => {
    const name = presetSelect.value;
    if (name) applyPreset(name);
  });

  // start values
  function init() {
    // set a sensible canvas height
    const main = canvas.parentElement;
    canvas.style.height = '640px';
    canvas.style.width = '100%';
    resizeCanvas();
    randomizeGrid();
  }

  init();
})();
