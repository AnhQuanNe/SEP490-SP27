/**
 * graphAudio.js
 * Tiện ích âm thanh ngũ cung cổ truyền dùng Web Audio API cho Đồ thị Tri thức.
 */

// Web Audio API âm thanh chuông dân gian đa âm sắc theo thang ngũ cung
export function playTraditionalChime(pitchMultiplier = 1) {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Tần số nốt ngũ cung (E5 - 659.25Hz * pitchMultiplier)
        osc.type = 'sine';
        const startFreq = 659.25 * pitchMultiplier;
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.33, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.65);
    } catch {
        // Trình duyệt chặn autoplay âm thanh
    }
}

export default playTraditionalChime;
