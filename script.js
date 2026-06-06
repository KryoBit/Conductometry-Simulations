function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.currentTarget.classList.add('active');
    if (id === 'basics') updateState();
    else if (id === 'sa-sb') updateSA();
    else if (id === 'wa-wb') updateWA();
}

const sliders = {
    V: document.getElementById('v-slider'),
    L: document.getElementById('l-slider'),
    A: document.getElementById('a-slider'),
    C: document.getElementById('c-slider'),
    Z: document.getElementById('z-slider'),
    Lambda: document.getElementById('lambda-slider')
};
const labels = {
    V: document.getElementById('val-v'),
    L: document.getElementById('val-l'),
    A: document.getElementById('val-a'),
    C: document.getElementById('val-c'),
    Z: document.getElementById('val-z'),
    Lambda: document.getElementById('val-lambda')
};
const outputs = {
    cell: document.getElementById('out-cell'),
    kappa: document.getElementById('out-kappa'),
    G: document.getElementById('out-g'),
    R: document.getElementById('out-r'),
    I: document.getElementById('out-i')
};

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

let state = { V: 2.0, L: 2.5, A: 4.0, C: 0.050, Z: 1, Lambda: 150 };
let particles = [];
let bubbles = [];

for (let i = 0; i < 30; i++) {
    bubbles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2
    });
}

class Particle {
    constructor() {
        this.reset();
        this.isPositive = Math.random() > 0.5;
        this.x = (canvas.width / 2) + (Math.random() - 0.5) * (state.L * 80);
    }
    reset() {
        this.y = canvas.height / 2 + (Math.random() - 0.5) * (state.A * 40);
        this.isPositive = Math.random() > 0.5;
    }
    update(E, speedMultiplier, leftBound, rightBound, upperBound, lowerBound) {
        let velocity = speedMultiplier * E;
        if (this.isPositive) {
            this.x += velocity;
        } else {
            this.x -= velocity;
        }
        this.y += (Math.random() - 0.5) * 2;
        if (this.y < upperBound) this.y = upperBound;
        if (this.y > lowerBound) this.y = lowerBound;
        if (this.x < leftBound || this.x > rightBound) {
            this.x = this.isPositive ? leftBound + 5 : rightBound - 5;
            this.reset();
        }
    }
    draw(ctx) {
        ctx.beginPath();
        const radius = this.isPositive ? (3.5 - state.Z * 0.5) : (2.5 + state.Z * 0.5);
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.shadowBlur = 4;
        ctx.shadowColor = this.isPositive ? 'rgba(255, 77, 77, 0.6)' : 'rgba(77, 121, 255, 0.6)';
        ctx.fillStyle = this.isPositive ? '#ff4d4d' : '#4d79ff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x - radius / 3, this.y - radius / 3, radius / 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
    }
}

function updateState() {
    Object.keys(sliders).forEach(key => {
        state[key] = parseFloat(sliders[key].value);
    });
    labels.V.innerText = state.V.toFixed(1) + ' V';
    labels.L.innerText = state.L.toFixed(1) + ' cm';
    labels.A.innerText = state.A.toFixed(1) + ' cm²';
    labels.C.innerText = state.C.toFixed(3) + ' M';
    labels.Z.innerText = state.Z;
    labels.Lambda.innerText = state.Lambda + ' S·cm²/mol';

    const cellConstant = state.L / state.A;
    const kappa = (state.C * state.Lambda * state.Z) / 1000;
    const G = kappa / cellConstant;
    const R = 1 / G;
    const I = state.V * G;

    outputs.cell.innerText = cellConstant.toFixed(2) + ' cm⁻¹';
    outputs.kappa.innerText = kappa.toFixed(4) + ' S/cm';
    outputs.G.innerText = G.toFixed(4) + ' S';
    outputs.R.innerText = R.toFixed(2) + ' Ω';
    outputs.I.innerText = (I * 1000).toFixed(2) + ' mA';

    const visualParticleCount = Math.floor(20 + (state.C / 0.2) * 180);
    while (particles.length < visualParticleCount) particles.push(new Particle());
    while (particles.length > visualParticleCount) particles.pop();
}

const saInputs = {
    v1: document.getElementById('sa-v1'),
    n2: document.getElementById('sa-n2'),
    v2: document.getElementById('sa-v2')
};
const saLabels = {
    v1: document.getElementById('sa-val-v1'),
    n2: document.getElementById('sa-val-n2'),
    v2: document.getElementById('sa-val-v2')
};
const saOutputs = {
    n1: document.getElementById('sa-out-n1'),
    str: document.getElementById('sa-out-str'),
    g: document.getElementById('sa-out-g')
};
const saCanvas = document.getElementById('saCanvas');
const saCtx = saCanvas.getContext('2d');

let sa_maxV2 = 0;
let wa_maxV2 = 0;
const n1_intern = 0.1;

function resetSA() {
    sa_maxV2 = 0;
    saInputs.v2.value = 0;
    updateSA();
}

function resetWA() {
    wa_maxV2 = 0;
    waInputs.v2.value = 0;
    updateWA();
}

function updateSA() {
    const v1 = parseFloat(saInputs.v1.value);
    const n2 = parseFloat(saInputs.n2.value);
    const v2_added = parseFloat(saInputs.v2.value);

    sa_maxV2 = Math.max(sa_maxV2, v2_added);

    saLabels.v1.innerText = v1 + ' mL';
    saLabels.n2.innerText = n2.toFixed(2) + ' N';
    saLabels.v2.innerText = v2_added + ' mL';

    const n1_calc = (n2 * v2_added) / v1;
    const strength = n1_calc * 36.5;

    saOutputs.n1.innerText = n1_calc.toFixed(3) + ' N';
    saOutputs.str.innerText = strength.toFixed(2) + ' g/L';

    const v2_endpoint = (n1_intern * v1) / n2;

    const resultsPanel = document.getElementById('sa-results');
    const hintPanel = document.getElementById('sa-hint');

    if (Math.abs(v2_added - v2_endpoint) <= 0.2) {
        resultsPanel.classList.remove('results-hidden');
        hintPanel.innerText = "Equivalence Point Reached!";
        hintPanel.style.color = "#2ecc71";
    } else if (v2_added > v2_endpoint + 0.2) {
        resultsPanel.classList.add('results-hidden');
        hintPanel.innerText = "END POINT EXCEEDED!";
        hintPanel.style.color = "#d63031";
    } else {
        resultsPanel.classList.add('results-hidden');
        hintPanel.innerText = "Titrate to find equivalence point...";
        hintPanel.style.color = "#ff7675";
    }

    let G = 0;
    const totalVol = v1 + v2_added;
    if (v2_added <= v2_endpoint) {
        const h_mol = (n1_intern * v1 - n2 * v2_added) / 1000;
        const na_mol = (n2 * v2_added) / 1000;
        const cl_mol = (n1_intern * v1) / 1000;
        G = (h_mol * 350 + na_mol * 50 + cl_mol * 75) / (totalVol / 1000) * 0.001;
    } else {
        const na_mol = (n2 * v2_added) / 1000;
        const cl_mol = (n1_intern * v1) / 1000;
        const oh_mol = (n2 * (v2_added - v2_endpoint)) / 1000;
        G = (na_mol * 50 + cl_mol * 75 + oh_mol * 200) / (totalVol / 1000) * 0.001;
    }
    saOutputs.g.innerText = G.toFixed(4) + ' S';

    drawTitrationCurve(saCtx, v1, n2, n1_intern, v2_added, sa_maxV2, 'SA');
}

const waInputs = {
    v1: document.getElementById('wa-v1'),
    n2: document.getElementById('wa-n2'),
    v2: document.getElementById('wa-v2')
};
const waLabels = {
    v1: document.getElementById('wa-val-v1'),
    n2: document.getElementById('wa-val-n2'),
    v2: document.getElementById('wa-val-v2')
};
const waOutputs = {
    n1: document.getElementById('wa-out-n1'),
    str: document.getElementById('wa-out-str'),
    g: document.getElementById('wa-out-g')
};
const waCanvas = document.getElementById('waCanvas');
const waCtx = waCanvas.getContext('2d');

function updateWA() {
    const v1 = parseFloat(waInputs.v1.value);
    const n2 = parseFloat(waInputs.n2.value);
    const v2_added = parseFloat(waInputs.v2.value);

    wa_maxV2 = Math.max(wa_maxV2, v2_added);

    waLabels.v1.innerText = v1 + ' mL';
    waLabels.n2.innerText = n2.toFixed(2) + ' N';
    waLabels.v2.innerText = v2_added + ' mL';

    const n1_calc = (n2 * v2_added) / v1;
    const strength = n1_calc * 60;

    waOutputs.n1.innerText = n1_calc.toFixed(3) + ' N';
    waOutputs.str.innerText = strength.toFixed(2) + ' g/L';

    const v2_endpoint = (n1_intern * v1) / n2;

    const resultsPanel = document.getElementById('wa-results');
    const hintPanel = document.getElementById('wa-hint');

    if (Math.abs(v2_added - v2_endpoint) <= 0.2) {
        resultsPanel.classList.remove('results-hidden');
        hintPanel.innerText = "Equivalence Point Reached!";
        hintPanel.style.color = "#2ecc71";
    } else if (v2_added > v2_endpoint + 0.2) {
        resultsPanel.classList.add('results-hidden');
        hintPanel.innerText = "END POINT EXCEEDED!";
        hintPanel.style.color = "#d63031";
    } else {
        resultsPanel.classList.add('results-hidden');
        hintPanel.innerText = "Titrate to find equivalence point...";
        hintPanel.style.color = "#ff7675";
    }

    let G = 0;
    const totalVol = v1 + v2_added;
    if (v2_added <= v2_endpoint) {
        const salt_mol = (n2 * v2_added) / 1000;
        G = (salt_mol * (40 + 73)) / (totalVol / 1000) * 0.001 + 0.0001;
    } else {
        const salt_mol = (n1_intern * v1) / 1000;
        G = (salt_mol * (40 + 73)) / (totalVol / 1000) * 0.001 + 0.0001;
    }
    waOutputs.g.innerText = G.toFixed(4) + ' S';

    drawTitrationCurve(waCtx, v1, n2, n1_intern, v2_added, wa_maxV2, 'WA');
}

function drawTitrationCurve(cCtx, v1, n2, n1, v2_current, v2_max, type) {
    cCtx.clearRect(0, 0, 500, 300);
    cCtx.beginPath();
    cCtx.strokeStyle = '#0984e3';
    cCtx.lineWidth = 2;

    const margin = 40;
    const w = 500 - 2 * margin;
    const h = 300 - 2 * margin;

    cCtx.strokeStyle = '#636e72';
    cCtx.moveTo(margin, margin); cCtx.lineTo(margin, 300 - margin); cCtx.lineTo(500 - margin, 300 - margin);
    cCtx.stroke();

    cCtx.fillStyle = '#636e72';
    cCtx.font = '10px Arial';
    cCtx.fillText('Volume added (mL)', 250, 290);
    cCtx.save();
    cCtx.translate(15, 150);
    cCtx.rotate(-Math.PI / 2);
    cCtx.fillText('Conductance (G)', 0, 0);
    cCtx.restore();

    const maxLimit = 80;
    const v2_endpoint = (n1 * v1) / n2;

    cCtx.beginPath();
    cCtx.strokeStyle = '#0984e3';
    for (let v = 0; v <= v2_max; v += 1) {
        let g_val = 0;
        const cur_total = v1 + v;
        if (type === 'SA') {
            if (v <= v2_endpoint) g_val = ((n1 * v1 - n2 * v) * 350 + (n2 * v) * 50 + (n1 * v1) * 75) / (cur_total);
            else g_val = ((n2 * v) * 50 + (n1 * v1) * 75 + (n2 * (v - v2_endpoint)) * 200) / (cur_total);
        } else {
            if (v <= v2_endpoint) g_val = (n2 * v * (40 + 73)) / (cur_total) + 1;
            else g_val = (n1 * v1 * (40 + 73)) / (cur_total) + 1;
        }
        const px = margin + (v / maxLimit) * w;
        const py = (300 - margin) - (g_val / (type === 'SA' ? 250 : 25)) * h;
        if (v === 0) cCtx.moveTo(px, py);
        else cCtx.lineTo(px, py);
    }
    cCtx.stroke();

    const curX = margin + (v2_current / maxLimit) * w;
    let g_cur = 0;
    if (type === 'SA') {
        if (v2_current <= v2_endpoint) g_cur = ((n1 * v1 - n2 * v2_current) * 350 + (n2 * v2_current) * 50 + (n1 * v1) * 75) / (v1 + v2_current);
        else g_cur = ((n2 * v2_current) * 50 + (n1 * v1) * 75 + (n2 * (v2_current - v2_endpoint)) * 200) / (v1 + v2_current);
    } else {
        if (v2_current <= v2_endpoint) g_cur = (n2 * v2_current * (40 + 73)) / (v1 + v2_current) + 1;
        else g_cur = (n1 * v1 * (40 + 73)) / (v1 + v2_current) + 1;
    }
    const curY = (300 - margin) - (g_cur / (type === 'SA' ? 250 : 25)) * h;
    cCtx.beginPath();
    cCtx.fillStyle = '#ff7675';
    cCtx.arc(curX, curY, 5, 0, Math.PI * 2);
    cCtx.fill();
}

function drawSimulation() {
    if (document.getElementById('basics').classList.contains('active')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        bubbles.forEach(b => {
            b.y -= b.speed;
            if (b.y < -10) b.y = canvas.height + 10;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
        });

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const L_px = state.L * 80;
        const A_px = state.A * 40;
        const leftElectrodeX = centerX - L_px / 2;
        const rightElectrodeX = centerX + L_px / 2;
        const electrodeY = centerY - A_px / 2;

        const gradient = ctx.createLinearGradient(leftElectrodeX, 0, rightElectrodeX, 0);
        gradient.addColorStop(0, 'rgba(0, 123, 255, 0.05)');
        gradient.addColorStop(0.5, 'rgba(0, 123, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 123, 255, 0.05)');
        ctx.fillStyle = gradient;
        ctx.fillRect(leftElectrodeX, electrodeY, L_px, A_px);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(leftElectrodeX, electrodeY, L_px, 2);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let gx = leftElectrodeX; gx <= rightElectrodeX; gx += 20) {
            ctx.beginPath(); ctx.moveTo(gx, electrodeY); ctx.lineTo(gx, electrodeY + A_px); ctx.stroke();
        }
        for (let gy = electrodeY; gy <= electrodeY + A_px; gy += 20) {
            ctx.beginPath(); ctx.moveTo(leftElectrodeX, gy); ctx.lineTo(rightElectrodeX, gy); ctx.stroke();
        }

        const electrodeGrad = ctx.createLinearGradient(0, electrodeY, 0, electrodeY + A_px);
        electrodeGrad.addColorStop(0, '#2d3436');
        electrodeGrad.addColorStop(0.5, '#636e72');
        electrodeGrad.addColorStop(1, '#2d3436');
        ctx.fillStyle = electrodeGrad;
        ctx.fillRect(leftElectrodeX - 12, electrodeY, 12, A_px);
        ctx.fillRect(rightElectrodeX, electrodeY, 12, A_px);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(leftElectrodeX - 12, electrodeY, 4, A_px);
        ctx.fillRect(rightElectrodeX, electrodeY, 4, A_px);

        ctx.fillStyle = '#2d3436';
        ctx.font = 'bold 12px Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Anode (+)', leftElectrodeX - 6, electrodeY - 15);
        ctx.fillText('Cathode (-)', rightElectrodeX + 6, electrodeY - 15);

        const E = state.V / state.L;
        const speedMultiplier = (state.Lambda / 450) * 0.5;
        particles.forEach(p => {
            p.update(E, speedMultiplier, leftElectrodeX, rightElectrodeX, electrodeY, electrodeY + A_px);
            p.draw(ctx);
        });
    }
    requestAnimationFrame(drawSimulation);
}

Object.values(sliders).forEach(slider => slider.addEventListener('input', updateState));
Object.values(saInputs).forEach(input => input.addEventListener('input', updateSA));
Object.values(waInputs).forEach(input => input.addEventListener('input', updateWA));

updateState();
updateSA();
updateWA();
drawSimulation();
