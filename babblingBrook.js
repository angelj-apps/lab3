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
startBtn.addEventListener("click", () => {

    // 1. Create AudioContext
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // 2. Create two BrownNoise sources
    const bn1 = createBrownNoise(audioCtx); // main sound
    const bn2 = createBrownNoise(audioCtx); // modulator

    // LPFs
    const lpf1 = audioCtx.createBiquadFilter();
    lpf1.type = "lowpass";
    lpf1.frequency.value = 300;

    const lpf2 = audioCtx.createBiquadFilter();
    lpf2.type = "lowpass";
    lpf2.frequency.value = 20;

    //Create RHPF
    const rhpf = audioCtx.createBiquadFilter();
    rhpf.type = "highpass";
    rhpf.Q.value = 40;

    //Create GainNode to scale modulator
    const modGain = audioCtx.createGain();
    modGain.gain.value = 600; // scales LPF2 output

    //Create ConstantSourceNode to add 500 Hz offset
    const offset = audioCtx.createConstantSource();
    offset.offset.value = 300;  //<---s
    offset.start();

    //Connect nodes
    bn1.connect(lpf1).connect(rhpf).connect(audioCtx.destination); // main sound
    bn2.connect(lpf2).connect(modGain).connect(rhpf.frequency);     // modulation
    offset.connect(rhpf.frequency);                                 

    //Start sources
    bn1.start();
    bn2.start();

    // Optional: disable button to prevent multiple clicks
    startBtn.disabled = true;
});