// main.js

// Function to create BrownNoise
function createBrownNoise(audioCtx) {
    const bufferSize = 10 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const brown = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * brown) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }
    const brownNoise = audioCtx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;
    return brownNoise;
}

const startBtn = document.getElementById("startBtn");
const brookLabel = document.getElementById("brookLabel");
const brookIcon = document.getElementById("brookIcon");
let brookNodes = null;

const PLAY_ICON = '<path d="M3 2.5v11l9-5.5-9-5.5z"/>';
const STOP_ICON = '<path d="M3 3h10v10H3V3z"/>';

function setBrookButtonState(playing) {
    startBtn.disabled = false;
    startBtn.classList.toggle("is-playing", playing);
    brookLabel.textContent = playing ? "Stop Sound" : "Start Sound";
    brookIcon.innerHTML = playing ? STOP_ICON : PLAY_ICON;
}

function startBrook() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const bn1 = createBrownNoise(audioCtx);
    const bn2 = createBrownNoise(audioCtx);

    const lpf1 = audioCtx.createBiquadFilter();
    lpf1.type = "lowpass";
    lpf1.frequency.value = 300;

    const lpf2 = audioCtx.createBiquadFilter();
    lpf2.type = "lowpass";
    lpf2.frequency.value = 20;

    const rhpf = audioCtx.createBiquadFilter();
    rhpf.type = "highpass";
    rhpf.Q.value = 40;

    const modGain = audioCtx.createGain();
    modGain.gain.value = 600;

    const offset = audioCtx.createConstantSource();
    offset.offset.value = 300;
    offset.start();

    bn1.connect(lpf1).connect(rhpf).connect(audioCtx.destination);
    bn2.connect(lpf2).connect(modGain).connect(rhpf.frequency);
    offset.connect(rhpf.frequency);

    bn1.start();
    bn2.start();

    brookNodes = { audioCtx, bn1, bn2, offset };
    setBrookButtonState(true);
}

function stopBrook() {
    if (!brookNodes) return;

    const { audioCtx, bn1, bn2, offset } = brookNodes;
    try {
        bn1.stop();
        bn2.stop();
        offset.stop();
        audioCtx.close();
    } finally {
        brookNodes = null;
        setBrookButtonState(false);
    }
}

startBtn.addEventListener("click", () => {
    if (brookNodes) {
        stopBrook();
    } else {
        startBrook();
    }
});
