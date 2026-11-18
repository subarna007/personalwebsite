const timerRef = document.querySelector(".current-time");
const hourInput = document.getElementById("hour-input");
const minuteInput = document.getElementById("minute-input");
const activeAlarms = document.querySelector(".alarms-list");
const setAlarm = document.getElementById("set");
const clearAllButton = document.querySelector(".clear");
// Alarm tone generated with the Web Audio API (no audio file needed)
const alarmSound = (() => {
    let ctx = null;
    let timer = null;
    const beep = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    };
    return {
        play() {
            if (timer) return;
            ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
            ctx.resume();
            beep();
            timer = setInterval(beep, 700);
        },
        pause() {
            clearInterval(timer);
            timer = null;
        },
    };
})();

// "HH:MM:SS" in 24-hour format (toLocaleTimeString can return "24:00" at midnight)
const timeString = (date) =>
    [date.getHours(), date.getMinutes(), date.getSeconds()].map((v) => String(v).padStart(2, "0")).join(":");

let alarmIndex = 0;
let alarmsArray = [];
let initialHour = 0;
let initialMinute = 0;

// Helper function to append a leading zero to single-digit values
const appendZero = (value) => (value < 10 ? "0" + value : value);

// Function to display the time and trigger alarms
const displayTimer = () => {
    const date = new Date();
    const currentTime = timeString(date);
    timerRef.textContent = currentTime;

    // Check if it's time to trigger alarms
    alarmsArray.forEach((alarm) => {
        if (alarm.isActive && alarm.time === currentTime.slice(0, 5)) {
            alarmSound.play();
        }
    });
};

// Function to create a new alarm
const createAlarm = (hour, minute) => {
    alarmIndex += 1;

    // Create an alarm object
    const alarmObj = {
        id: `${alarmIndex}_${hour}_${minute}`,
        time: `${appendZero(hour)}:${appendZero(minute)}`,
        isActive: false
    };

    // Add alarm to the array and create it's Ui representation
    alarmsArray.push(alarmObj);
    const alarmDiv = document.createElement("div");
    alarmDiv.className = "alarm";
    alarmDiv.dataset.id = alarmObj.id;
    alarmDiv.innerHTML = `<span>${alarmObj.time}</span>`;

    // Create a checkbox to activate/deactivate the alarm
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => toggleAlarm(alarmObj));
    alarmDiv.appendChild(checkbox);

    // Create a delete button for the alarm
    const deleteButton = document.createElement("button");
    // Fontawesome
    deleteButton.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
    deleteButton.className = "deleteButton";
    deleteButton.addEventListener("click", () => deleteAlarm(alarmObj));
    alarmDiv.appendChild(deleteButton);

    // Add the alarm Ui to the list of active alarms
    activeAlarms.appendChild(alarmDiv);
};

// Function to toggle the alarm's active state
const toggleAlarm = (alarm) => {
    alarm.isActive = !alarm.isActive;
    if (alarm.isActive) {
        const currentTime = timeString(new Date()).slice(0, 5);
        if (alarm.time === currentTime) {
            alarmSound.play();
        }
    } else {
        alarmSound.pause();
    }
};

// Function to delete an alarm
const deleteAlarm = (alarm) => {
    const index = alarmsArray.indexOf(alarm);
    if (index > -1) {
        alarmsArray.splice(index, 1);
        alarmSound.pause();
        document.querySelector(`[data-id="${alarm.id}"]`).remove();
    }
};

// Event listener for clearing all alarms
clearAllButton.addEventListener("click", () => {
    alarmsArray = [];
    activeAlarms.innerHTML = "";
    alarmSound.pause();
});

// Event listener for setting a new alarm
setAlarm.addEventListener("click", () => {
    // Parse the input values, default to 0 if empty or NaN
    let hour = parseInt(hourInput.value) || 0;
    let minute = parseInt(minuteInput.value) || 0;

    // Validate the input values
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        alert("Invalid hour or minute. Please enter values within the valid range!");
        return;
    }

    // Check if an alarm with the same time already exists
    if (!alarmsArray.some(alarm => alarm.time === `${appendZero(hour)}:${appendZero(minute)}`)) {
        createAlarm(hour, minute);
    }

    // Clear input fields
    [hourInput.value, minuteInput.value] = ["", ""];
});

// Initialize the timer and input fields
window.onload = () => {
    setInterval(displayTimer, 1000);
    [hourInput.value, minuteInput.value] = ["", ""];
};