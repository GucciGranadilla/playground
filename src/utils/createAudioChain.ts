/**
 * Creates a shared processing chain: highpass → highshelf → gain → destination.
 * Returns the entry node to connect a source to.
 */
export function createAudioChain(
  ctx: AudioContext,
  gainValue: number,
): AudioNode {
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 180;
  hp.Q.value = 0.7;

  const shelf = ctx.createBiquadFilter();
  shelf.type = "highshelf";
  shelf.frequency.value = 6000;
  shelf.gain.value = 4;

  const gain = ctx.createGain();
  gain.gain.value = gainValue;

  hp.connect(shelf);
  shelf.connect(gain);
  gain.connect(ctx.destination);

  return hp;
}
