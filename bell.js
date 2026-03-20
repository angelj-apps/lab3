// bell.js

function playTelephoneBell(audioCtx) {

    const startTime = audioCtx.currentTime;

    // 1️⃣ Master gain node to control overall volume and envelope
    const masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);

    // Exponential decay over ~3 seconds
    masterGain.gain.setValueAtTime(1, startTime);
    masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + 3);

    // 2️⃣ Define partials: frequency (Hz) and relative amplitude
    const partials = [
        { freq: 450, amp: 1.0 },   // fundamental
        { freq: 900, amp: 0.6 },
        { freq: 1350, amp: 0.3 },
        { freq: 1800, amp: 0.2 }
    ];

    // 3️⃣ Create oscillators for each partial
    partials.forEach(partial => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = partial.freq;
        osc.detune.value = (Math.random() - 0.5) * 15; // ±7.5 cents

        // Gain node for this partial's amplitude
        const gain = audioCtx.createGain();
        gain.gain.value = partial.amp;

        osc.connect(gain).connect(masterGain);

        osc.start(startTime + Math.random() * 0.01);
        osc.stop(startTime + 3.5); // slightly longer than envelope
        

      
    // Short strike (20 ms)
const noise = audioCtx.createBufferSource();
const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.02, audioCtx.sampleRate);
const data = buffer.getChannelData(0);

// small amplitude to avoid clipping
for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5; // small value
}

noise.buffer = buffer;

const noiseGain = audioCtx.createGain();
// start a little lower and decay very fast
noiseGain.gain.setValueAtTime(0.1, startTime);
noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.02);

noise.connect(noiseGain).connect(masterGain);

// start & stop exactly at strike
noise.start(startTime);
noise.stop(startTime + 0.9);
        
    });
}

// Example usage:

// 1. Create AudioContext
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 2. Play bell on button click
window.onload = () => {
    const bellBtn = document.getElementById('bellBtn');
    bellBtn.addEventListener('click', () => {
        audioCtx.resume();
        playTelephoneBell(audioCtx);
    });
};