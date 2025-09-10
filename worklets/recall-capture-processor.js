class RecallCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buf = new Float32Array(0);
    this.frameSize = 2048; // analysis frame size
  }
  
  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) return true;
    
    const ch0 = input[0]; // Float32Array of length 128 per render quantum
    
    // Append to rolling buffer
    const merged = new Float32Array(this.buf.length + ch0.length);
    merged.set(this.buf, 0);
    merged.set(ch0, this.buf.length);
    this.buf = merged;
    
    // While we have at least one frame, post it to main thread
    while (this.buf.length >= this.frameSize) {
      const frame = this.buf.slice(0, this.frameSize);
      this.port.postMessage(frame, [frame.buffer]); // transfer
      this.buf = this.buf.slice(this.frameSize);
    }
    
    return true;
  }
}

registerProcessor('recall-capture', RecallCaptureProcessor);