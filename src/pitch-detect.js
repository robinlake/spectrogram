// https://github.com/cwilso/PitchDetect/pull/23
// https://github.com/dalatant/PitchDetect/blob/b0d5d28d2803d852dd85d2a1e53c22bcedba4cbf/js/pitchdetect.js
// https://github.com/peterkhayes/pitchfinder

// Thesis http://hellanicus.lib.aegean.gr/handle/11610/8650
// Implementation https://www.mathworks.com/matlabcentral/fileexchange/54663-yin-tuner

// More at https://ccrma.stanford.edu/~jos/parshl/Peak_Detection_Steps_3.html

function autoCorrelate(buf, sampleRate, eps = 0.001, threshold = 0.2) {
    // Implements the ACF2+ algorithm
    let SIZE = buf.length
    let rms = 0
  
    for (let i = 0; i < SIZE; i++) {
      const val = buf[i]
      rms += val * val
    }
    rms = Math.sqrt(rms / SIZE)
  
    // not enough signal
    if (rms < eps) return -1
  
    // trim
    let r1 = 0, r2 = SIZE - 1
    for (let i = 0; i < SIZE / 2; i++)
      if (Math.abs(buf[i]) < threshold) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++)
      if (Math.abs(buf[SIZE - i]) < threshold) { r2 = SIZE - i; break; }
  
    buf = buf.slice(r1, r2)
    SIZE = buf.length
  
    // autocorrelation
    const c = new Array(SIZE).fill(0)
    for (let i = 0; i < SIZE; i++)
      for (let j = 0; j < SIZE - i; j++)
        c[i] += buf[j] * buf[j + i];
  
    // find first dip
    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;
  
    // interpolation
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);
  
    return sampleRate / T0;
  }
  
  const sampleRate = 44100
  const bufferSize = 1024
  const buffer = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]
  console.log(autoCorrelate(buffer, sampleRate))
  
  
  // Stolen from https://www.zigtuner.com/
  // @TODO test test test
  function sf(buf, sampleRate, eps = 0.001) {
    var g = buf;
    const SIZE = buf.length
    const mat = Array(SIZE).fill(0)
  
    for (let c = 0; c < SIZE; c++)
      for (let k = 0; k < SIZE - c; k++)
          mat[c] += buf[k] * buf[k + c];
  
    // not enough signal
    const rms = Math.sqrt(mat[0] / SIZE)
    if (rms < eps) return -1
  
      // mat.findIndex((e, i, m) < m[i] < m[i + 1]) || SIZE - 1
      // mat.indexOf(Math.max(mat.slice(c)))
    let d = 0
    for (d; mat[d] > mat[d + 1]; ++d); // find first non-decreasing row?
    for (k = g = -1; d < SIZE; d++) if (mat[d] > g) g = mat[k = d];
    let T0 = k
    const x1 = mat[T0 - 1], x2 = mat[T0], x3 = mat[T0 + 1]
    const a = (x1 + x3 - 2 * x2) / 2
    const b = (x3 - x1) / 2
    if (a) T0 = T0 - b / (2 * a)
    return sampleRate / T0
  }
  console.log(sf(buffer, sampleRate))
  
  
  /**
   * Implements the normalized square difference function. See section 4 (and
   * the explanation before) in the MPM article. This calculation can be
   * optimized by using an FFT. The results should remain the same.
   * 
   * @param audioBuffer
   *            The buffer with audio information.
   */
  // Stolen from https://github.com/JorenSix/TarsosDSP/blob/d9583528b9573a97c220d19e6d9ab2929e9bd1c5/src/core/be/tarsos/dsp/pitch/McLeodPitchMethod.java#L179-L197
  function normalizedSquareDifference(nsdf, audioBuffer) {
    for (let tau = 0; tau < audioBuffer.length; tau++) {
      let acf = 0
      let divisorM = 0
      for (let i = 0; i < audioBuffer.length - tau; i++) {
        const a = audioBuffer[i]
        const b = audioBuffer[i + tau]
        acf += a * b
        divisorM += a * a + b * b
      }
      nsdf[tau] = 2 * acf / divisorM
    }
  }
  
  
  
  var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  
  function noteFromPitch(frequency) {
    return Math.round(12 * (Math.log(frequency / 440) / Math.log(2))) + 69;
  }
  
  function frequencyFromNoteNumber(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }
  
  function centsOffFromPitch(frequency, note) {
    return Math.floor(1200 * Math.log(frequency / frequencyFromNoteNumber(note)) / Math.log(2));
  }
  
  
  
  const audioContext = new AudioContext()
  const buflen = 2048
  const buf = new Float32Array(buflen)
  let mediaStreamSource, analyser
  
  const detectorElem = document.querySelector('#detector')
  const pitchElem = document.querySelector('#pitch')
  const noteElem = document.querySelector('#note')
  const detuneElem = document.querySelector('#detune')
  const detuneAmount = document.querySelector('#detune_amt')
  
  
  function updatePitch(now) {
    requestAnimationFrame(updatePitch)
  
    analyser.getFloatTimeDomainData(buf)
  
    const ac = sf(buf, audioContext.sampleRate)
    
    if (ac === -1) {
      detectorElem.className = "vague";
      pitchElem.textContent = "--";
      noteElem.textContent = "-";
      detuneElem.className = "";
      detuneAmount.textContent = "--";
    } else {
      const pitch = ac
      const note = noteFromPitch(pitch)
      const detune = centsOffFromPitch(pitch, note)
      detectorElem.className = 'confident'
      pitchElem.textContent = Math.round(pitch)
      noteElem.textContent = noteStrings[note % 12]
      if (detune == 0) {
        detuneElem.className = ""
        detuneAmount.textContent = "--"
      } else {
        detuneElem.className = detune < 0 ? 'flat' : 'sharp'
        detuneAmount.textContent = Math.abs(detune)
      }
    }
  }
  
  function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);
  
    // Connect it to the destination.
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 2048
    mediaStreamSource.connect(analyser)
    updatePitch()
  }
  
  navigator.mediaDevices.getUserMedia({
      audio: true
    })
    .then((stream) => {
      gotStream(stream)
    })
    .catch((err) => {
      /* handle that error */
    })
  