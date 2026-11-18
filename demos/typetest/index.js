//Random quotes api (falls back to local quotes if the API is unreachable)
const quoteApiUrl = "https://api.quotable.io/random?minLength=80&maxLength=100";
const fallbackQuotes = [
    "The only way to learn a new programming language is by writing programs in it, again and again, until it feels natural.",
    "Simplicity is prerequisite for reliability, and the best code is often the code you decided not to write at all.",
    "Programs must be written for people to read, and only incidentally for machines to execute on a computer.",
    "First solve the problem, then write the code, and remember that every bug you fix teaches you something new.",
    "Practice does not make perfect; practice makes permanent, so type slowly and accurately before you try to be fast.",
];
const quoteSection = document.getElementById("quote");
const userInput = document.getElementById("quote-input");

let quote = "";
let time = 60;
let timer = "";
let mistakes = 0;
let finished = false;

//Display random quotes
const renderNewQuote = async () => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const response = await fetch(quoteApiUrl, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) throw new Error(response.status);
        const data = await response.json();
        quote = data.content;
    } catch (err) {
        quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    }

    //Array of chars in quote
    let arr = quote.split("").map((value) => {
        return "<span class='quote-chars'>" + value + "</span>";
    });
    quoteSection.innerHTML = arr.join("");
};

//Logic to compare input words with quote
userInput.addEventListener("input", () => {
    let quoteChars = document.querySelectorAll(".quote-chars");
    quoteChars = Array.from(quoteChars);

    //Array of user input chars
    let userInputChars = userInput.value.split("");
    //Loop through each char in quote
    quoteChars.forEach((char, index) => {
        //Check chars with quote chars
        if (char.innerText == userInputChars[index]) {
            char.classList.add("success");
        }
        //If user hasn't entered anything or backspaced
        else if (userInputChars[index] == null) {
            if (char.classList.contains("success")) {
                char.classList.remove("success");
            } else {
                char.classList.remove("fail");
            }
        }
        //if user entered wrong char
        else {
            if (!char.classList.contains("fail")) {
                //increament and displaying mistakes
                mistakes++;
                char.classList.add("fail");
            }
            document.getElementById("mistakes").innerText = mistakes;
        }

    });

    //End test once every char is correct
    if (quoteChars.length && quoteChars.every((element) => element.classList.contains("success"))) {
        displayResult();
    }

});

//Update timer
function updateTimer() {
    if (time == 0) {
        //End test if reaches 0
        displayResult();
    } else {
        document.getElementById("timer").innerText = --time + "s";
    }
}

//Set timer
const timeReduce = () => {
    time = 60;
    timer = setInterval(updateTimer, 1000);
};

//End test
const displayResult = () => {
    if (finished) return;
    finished = true;
    //Display result div
    document.querySelector(".result").style.display = "block";
    clearInterval(timer);
    document.getElementById("stop-test").style.display = "none";
    userInput.disabled = true;
    // elapsed time in minutes (at least one second, to avoid dividing by zero)
    const timeTaken = Math.max(60 - time, 1) / 60;
    const typed = userInput.value.length;
    document.getElementById("wpm").innerText = (typed / 5 / timeTaken).toFixed(2) + " wpm";
    const accuracy = typed ? Math.max(0, Math.round(((typed - mistakes) / typed) * 100)) : 0;
    document.getElementById("accuracy").innerText = accuracy + "%";
};

//Start test
const startTest = () => {
    mistakes = 0;
    finished = false;
    timer = "";
    userInput.disabled = false;
    timeReduce();
    document.getElementById("start-test").style.display = "none";
    document.getElementById("stop-test").style.display = "block";
};

window.onload = () => {
    userInput.value = "";
    document.getElementById("start-test").style.display = "block";
    document.getElementById("stop-test").style.display = "none";
    userInput.disabled = true;
    renderNewQuote();
}