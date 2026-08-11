export function speakToken(token: string) {
  if (!("speechSynthesis" in window)) {
    alert("Speech synthesis is not supported.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(token);

  utterance.rate = 0.8;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}