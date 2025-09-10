function createPitchDetector({ method='yin', sampleRate }) {
  // If Pitchfinder is loaded, its algorithms return a FUNCTION (not an object).
  const pf = window.Pitchfinder || window.pitchfinder || null;

  let algoFn = null;
  if (pf) {
    try {
      if (method==='yin' && typeof pf.YIN === 'function') algoFn = pf.YIN({ sampleRate });
      else if (method==='amdf' && typeof pf.AMDF === 'function') algoFn = pf.AMDF({ sampleRate });
      else if (typeof pf.YIN === 'function') algoFn = pf.YIN({ sampleRate });
    } catch (_) { /* fall through */ }
  }

  // Fallback: simple autocorrelation in case library is absent
  function acfDetect(frame, sr) {
    const buf = frame, n = buf.length;
    let bestLag = -1, bestCorr = 0;
    const minF=50, maxF=1000;
    const minLag = Math.floor(sr / maxF);
    const maxLag = Math.floor(sr / minF);
    for (let lag=minLag; lag<=Math.min(maxLag, n-1); lag++) {
      let sum=0;
      for (let i=0; i<n-lag; i++) sum += buf[i]*buf[i+lag];
      if (sum > bestCorr) { bestCorr = sum; bestLag = lag; }
    }
    if (bestLag > 0) return sr / bestLag;
    return null;
  }

  if (typeof algoFn === 'function') {
    return { getPitch(frame) {
      const f = algoFn(frame, sampleRate);
      return (Number.isFinite(f) && f>0) ? f : null;
    }};
  }

  return { getPitch(frame) {
    const f = acfDetect(frame, sampleRate);
    return (Number.isFinite(f) && f>0) ? f : null;
  }};
}

window.detectors = window.detectors || {};
window.detectors.createPitchDetector = createPitchDetector;