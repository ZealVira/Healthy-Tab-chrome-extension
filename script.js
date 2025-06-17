// Health tips
const tips = [
  "Drink a glass of water 💧",
  "Take a deep breath 🌬️",
  "Stretch your legs 🧘",
  "Look away from the screen 👀",
  "Smile 😄 You’re awesome!"
];

document.getElementById("tip").textContent = tips[Math.floor(Math.random() * tips.length)];
document.getElementById("tip").classList.remove("hidden");

// Elements
const goalInput = document.getElementById('goal-input');
const goalValue = document.getElementById('goal-value');
const setGoalButton = document.getElementById('set-goal-btn');
const glassesContainer = document.getElementById('glasses-container');
const resetButton = document.getElementById('reset-btn');
const currentIntake = document.getElementById('current-intake');

// State
let totalGlasses = 8;
let filledGlasses = 0;
let lastFillTime = 0;

// Set goal slider live update
goalInput.addEventListener('input', () => {
    goalValue.textContent = goalInput.value;
});

// Set goal button
setGoalButton.addEventListener('click', () => {
    totalGlasses = parseInt(goalInput.value);
    filledGlasses = 0;
    currentIntake.textContent = filledGlasses;

    chrome.storage.local.set({
        dailyGoal: totalGlasses,
        filledGlasses,
        lastFillTime: 0
    }, () => { renderGlasses();
        updateProgressBar();
     });
});

// Render glasses
function renderGlasses() {
    glassesContainer.innerHTML = '';

    for (let i = 0; i < totalGlasses; i++) {
        const glassWrapper = document.createElement('div');
        glassWrapper.classList.add('glass');

        const animationContainer = document.createElement('div');
        animationContainer.id = `glass-${i}`;

        glassWrapper.appendChild(animationContainer);
        glassesContainer.appendChild(glassWrapper);

        const glassAnim = lottie.loadAnimation({
            container: animationContainer,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: 'fill_water_glass.json'
        });

        glassAnim.addEventListener('DOMLoaded', () => {
            glassAnim.goToAndStop(0, true);

            if (i < filledGlasses) {
                glassAnim.goToAndStop(glassAnim.totalFrames, true);
            }
        });

        glassWrapper.addEventListener('click', () => {
            const now = Date.now();
            if (i === filledGlasses) {
                if (now - lastFillTime < 60000) {
                    alert('Please wait at least 1 minute before recording the next glass!');
                    return;
                }

                glassAnim.play();
                filledGlasses++;
                lastFillTime = now;
                currentIntake.textContent = filledGlasses;

                chrome.storage.local.set({
                    filledGlasses,
                    lastFillTime
                });
                updateProgressBar();
            }
        });
    }
}

// Update progress bar
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');

    const progress = (filledGlasses / totalGlasses) * 100;
    progressBar.style.width = `${progress}%`;
    progressPercentage.textContent = `${Math.round(progress)}% completed`;
}


// Reset button
resetButton.addEventListener('click', () => {
    filledGlasses = 0;
    lastFillTime = 0;
    currentIntake.textContent = filledGlasses;

    chrome.storage.local.set({
        filledGlasses,
        lastFillTime
    }, () => { renderGlasses();
        updateProgressBar();
    });
});

// Load initial values
chrome.storage.local.get(['dailyGoal', 'filledGlasses', 'lastFillTime'], (result) => {
    totalGlasses = result.dailyGoal || 8;
    filledGlasses = result.filledGlasses || 0;
    lastFillTime = result.lastFillTime || 0;

    goalInput.value = totalGlasses;
    goalValue.textContent = totalGlasses;
    currentIntake.textContent = filledGlasses;

    renderGlasses();
    updateProgressBar();
});

// Schedule 11 PM reset alarm
chrome.alarms.create('dailyReset', {
    when: getNext11PM(),
    periodInMinutes: 1440
});

function getNext11PM() {
    const now = new Date();
    const next = new Date();
    next.setHours(23, 0, 0, 0);

    if (now > next) next.setDate(next.getDate() + 1);
    return next.getTime();
}

// Listen for alarm and log data
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyReset') {
        const today = new Date().toLocaleDateString();

        chrome.storage.local.get(['filledGlasses', 'dailyHistory'], (result) => {
            const history = result.dailyHistory || {};
            history[today] = result.filledGlasses || 0;

            chrome.storage.local.set({
                filledGlasses: 0,
                lastFillTime: 0,
                dailyHistory: history
            }, () => {
                currentIntake.textContent = 0;
                renderGlasses();
                updateProgressBar();
            });
        });
    }
});

