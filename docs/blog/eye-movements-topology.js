/* Two small, self-contained teaching experiments. No participant data or dependencies. */
(() => {
  'use strict';
  const gazeSvg = document.getElementById('tda-gaze');
  const delaySvg = document.getElementById('tda-delay');
  const ripsSvg = document.getElementById('tda-rips');
  if (!gazeSvg || !delaySvg || !ripsSvg) return;

  const N = 48;
  const samples = Array.from({length: N}, (_, i) => {
    const angle = 2 * Math.PI * i / N;
    const radius = .79 + .065 * Math.sin(3 * angle);
    return {x: radius * Math.cos(angle), y: radius * Math.sin(angle)};
  });
  // 19 and 48 are coprime, so this is a permutation of exactly the same points.
  const shuffled = Array.from({length: N}, (_, i) => samples[(i * 19) % N]);
  let order = 'smooth';
  const tauInput = document.getElementById('tda-tau');
  const tauOutput = document.getElementById('tda-tau-value');
  const delayExplanation = document.getElementById('tda-delay-explanation');
  const point = (x, y) => x.toFixed(2) + ',' + y.toFixed(2);
  const circle = (x, y, r, fill, extra) => '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="' + r + '" fill="' + fill + '" ' + (extra || '') + '/>';
  const path = (points, color, width, opacity) =>
    '<polyline points="' + points.map(p => point(p.x, p.y)).join(' ') +
    '" fill="none" stroke="' + color + '" stroke-width="' + width +
    '" stroke-opacity="' + opacity + '" stroke-linecap="round" stroke-linejoin="round"/>';
  const axisLines = '<path d="M 38 17 V 211 H 303" fill="none" stroke="#c7d7df" stroke-width="1.4"/>' +
    '<path d="M 38 114 H 303 M 172 17 V 211" fill="none" stroke="#ebf0f3" stroke-dasharray="4 5"/>';
  const label = (x, y, text) => '<text x="' + x + '" y="' + y + '" fill="#708994" font-size="10" font-family="Inter,Arial,sans-serif">' + text + '</text>';
  const frame = (points, xLabel, yLabel) => {
    const coords = points.map(p => ({x: 172 + p.x * 109, y: 114 - p.y * 88}));
    return axisLines + label(275, 230, xLabel) + label(12, 18, yLabel) +
      path(coords, '#2b86a7', 1.8, .8) +
      coords.map((p, i) => circle(p.x, p.y, i === 0 ? 4.4 : 2.15, i === 0 ? '#e27f50' : '#307e9e', '')).join('');
  };

  function renderDelay() {
    const s = order === 'smooth' ? samples : shuffled;
    const tau = Number(tauInput.value);
    tauOutput.textContent = tau + (tau === 1 ? ' sample' : ' samples');
    gazeSvg.innerHTML = frame(s, 'x', 'y');
    const pairs = [];
    for (let i = 0; i + tau < s.length; i++) pairs.push({x:s[i].x, y:s[i + tau].x});
    delaySvg.innerHTML = frame(pairs, 'xₜ', 'xₜ₊τ');
    delayExplanation.textContent = order === 'smooth'
      ? 'The eye moves smoothly around the positions. In delay coordinates, a regular curve appears because consecutive measurements are related.'
      : 'The locations are unchanged, but the order is scrambled. The delay-coordinate view now looks quite different: temporal relationships matter.';
    gazeSvg.setAttribute('aria-label', order === 'smooth' ? 'Smooth synthetic gaze trajectory visiting circularly arranged positions.' : 'The same gaze positions visited in a shuffled order.');
    delaySvg.setAttribute('aria-label', 'Delay-coordinate plot for ' + order + ' order at a delay of ' + tau + ' samples.');
  }
  document.querySelectorAll('[data-order]').forEach(button => {
    button.addEventListener('click', () => {
      order = button.dataset.order;
      document.querySelectorAll('[data-order]').forEach(b => {
        const active = b.dataset.order === order;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      renderDelay();
    });
  });
  tauInput.addEventListener('input', renderDelay);

  const ring = Array.from({length: 12}, (_, i) => {
    const angle = i * 2 * Math.PI / 12 - Math.PI / 2;
    return {x: 166 + 87 * Math.cos(angle), y: 140 + 87 * Math.sin(angle)};
  });
  const cloud = ring.concat([{x:33, y:37}]);
  const epsilonInput = document.getElementById('tda-epsilon');
  const epsilonOutput = document.getElementById('tda-epsilon-value');
  const beta0Output = document.getElementById('tda-beta0');
  const beta1Output = document.getElementById('tda-beta1');
  const ripsDescription = document.getElementById('tda-rips-description');
  const count = cloud.length;
  const distances = Array.from({length:count}, (_, i) => Array.from({length:count}, (_, j) => Math.hypot(cloud[i].x - cloud[j].x, cloud[i].y - cloud[j].y)));

  function homology(epsilon) {
    const parent = Array.from({length:count}, (_, i) => i);
    const find = i => {
      while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; }
      return i;
    };
    const edges = [], triangles = [], edgeIds = new Map();
    const connected = Array.from({length:count}, () => Array(count).fill(false));
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (distances[i][j] <= epsilon + 1e-9) {
          edgeIds.set(i + ':' + j, edges.length);
          edges.push([i,j]);
          connected[i][j] = true;
          parent[find(i)] = find(j);
        }
      }
    }
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (!connected[i][j]) continue;
        for (let k = j + 1; k < count; k++) {
          if (connected[i][k] && connected[j][k]) triangles.push([i,j,k]);
        }
      }
    }
    const beta0 = new Set(parent.map((_, i) => find(i))).size;
    // Exact rank of the triangle boundary map over F2.
    // beta1 = dim ker(partial1) - rank(partial2).
    const pivots = new Map();
    let rank2 = 0;
    for (const [i,j,k] of triangles) {
      let vector = (1n << BigInt(edgeIds.get(i + ':' + j))) ^
                   (1n << BigInt(edgeIds.get(i + ':' + k))) ^
                   (1n << BigInt(edgeIds.get(j + ':' + k)));
      while (vector) {
        const pivot = vector.toString(2).length - 1;
        if (pivots.has(pivot)) vector ^= pivots.get(pivot);
        else { pivots.set(pivot, vector); rank2++; break; }
      }
    }
    return {edges, triangles, beta0, beta1:edges.length - count + beta0 - rank2};
  }

  function renderRips() {
    const epsilon = Number(epsilonInput.value);
    const {edges,triangles,beta0,beta1} = homology(epsilon);
    epsilonOutput.textContent = 'ε = ' + epsilon;
    beta0Output.textContent = String(beta0);
    beta1Output.textContent = String(beta1);
    const disks = cloud.map(p => circle(p.x,p.y,epsilon/2,'#e7f2f7','stroke="#c6e4ee" stroke-width=".7" fill-opacity=".26"')).join('');
    const faces = triangles.map(([i,j,k]) =>
      '<polygon points="' + [cloud[i],cloud[j],cloud[k]].map(p => point(p.x,p.y)).join(' ') +
      '" fill="#59aec0" fill-opacity=".12" stroke="none"/>').join('');
    const lines = edges.map(([i,j]) =>
      '<line x1="' + cloud[i].x.toFixed(2) + '" y1="' + cloud[i].y.toFixed(2) +
      '" x2="' + cloud[j].x.toFixed(2) + '" y2="' + cloud[j].y.toFixed(2) +
      '" stroke="#45869e" stroke-width="1.3" stroke-opacity=".65"/>').join('');
    const points = cloud.map(p => circle(p.x,p.y,4.2,'#236b89','stroke="white" stroke-width="1.2"')).join('');
    ripsSvg.innerHTML = disks + faces + lines + points;
    ripsSvg.setAttribute('aria-label', 'Vietoris–Rips complex at epsilon ' + epsilon +
      ', with ' + beta0 + ' connected components and ' + beta1 + ' independent loops.');
    ripsDescription.textContent = beta1 > 0
      ? 'A one-dimensional hole survives at this scale. Watch what happens when enough triangles appear to fill it.'
      : beta0 > 1
        ? 'There are still ' + beta0 + ' disconnected pieces. Increase ε to make nearby points join.'
        : 'The cloud is connected, but no independent one-dimensional hole remains at this scale.';
  }
  epsilonInput.addEventListener('input', renderRips);
  document.querySelectorAll('[data-epsilon]').forEach(button => {
    button.addEventListener('click', () => {
      epsilonInput.value = button.dataset.epsilon;
      renderRips();
    });
  });
  renderDelay();
  renderRips();
})();
