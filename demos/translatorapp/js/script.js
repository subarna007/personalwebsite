const fromText = document.querySelector(".from-text");
const toText = document.querySelector(".to-text");
const exchageIcon = document.querySelector(".exchange");
const selectTag = document.querySelectorAll("select");
const icons = document.querySelectorAll(".row i");
const translateBtn = document.querySelector("button");

selectTag.forEach((tag, id) => {
    for (let country_code in countries) {
        let selected = id == 0 ? country_code == "en-GB" ? "selected" : "" : country_code == "de-DE" ? "selected" : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
    }
});

exchageIcon.addEventListener("click", () => {
    let tempText = fromText.value,
        tempLang = selectTag[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
});

fromText.addEventListener("keyup", () => {
    if (!fromText.value) {
        toText.value = "";
    }
});

translateBtn.addEventListener("click", () => {
    let text = fromText.value.trim(),
        translateFrom = selectTag[0].value,
        translateTo = selectTag[1].value;
    if (!text) return;
    toText.setAttribute("placeholder", "Translating...");
    // MyMemory free API (no key needed; limited to about 500 characters per request)
    let apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${translateFrom}|${translateTo}`;
    fetch(apiUrl).then(res => res.json()).then(data => {
        if (data.responseStatus !== 200 && data.responseStatus !== "200") {
            throw new Error(data.responseDetails || "Translation failed");
        }
        toText.value = data.responseData.translatedText;
        toText.setAttribute("placeholder", "Translation");
    }).catch(err => {
        toText.value = "";
        toText.setAttribute("placeholder", "Could not translate: " + err.message);
    });
});

icons.forEach(icon => {
    icon.addEventListener("click", ({ target }) => {
        if (!fromText.value || !toText.value) return;
        if (target.classList.contains("fa-copy")) {
            if (target.id == "from") {
                navigator.clipboard.writeText(fromText.value);
            } else {
                navigator.clipboard.writeText(toText.value);
            }
        } else {
            let utterance;
            if (target.id == "from") {
                utterance = new SpeechSynthesisUtterance(fromText.value);
                utterance.lang = selectTag[0].value;
            } else {
                utterance = new SpeechSynthesisUtterance(toText.value);
                utterance.lang = selectTag[1].value;
            }
            speechSynthesis.speak(utterance);
        }
    });
});