const textarea = document.querySelector("textarea"),
    voiceList = document.querySelector("select"),
    speechBtn = document.querySelector("button");

const synth = window.speechSynthesis;
let statusTimer = null;

function loadVoices() {
    // voiceschanged can fire more than once, so rebuild the list instead of appending
    const current = voiceList.value;
    voiceList.innerHTML = "";
    for (const voice of synth.getVoices()) {
        const option = document.createElement("option");
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        if (voice.name === current || (!current && voice.name === "Google US English")) {
            option.selected = true;
        }
        voiceList.appendChild(option);
    }
}

function setButton(label) {
    speechBtn.innerText = label;
}

function textToSpeech(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = synth.getVoices().find(v => v.name === voiceList.value);
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
        clearInterval(statusTimer);
        setButton("Convert To Speech");
    };
    synth.speak(utterance);
}

if (!synth) {
    setButton("Speech not supported");
    speechBtn.disabled = true;
} else {
    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);

    speechBtn.addEventListener("click", e => {
        e.preventDefault();
        const text = textarea.value.trim();
        if (!text) return;

        if (!synth.speaking) {
            textToSpeech(text);
            setButton("Pause Speech");
        } else if (synth.paused) {
            synth.resume();
            setButton("Pause Speech");
        } else {
            synth.pause();
            setButton("Resume Speech");
        }
    });
}
