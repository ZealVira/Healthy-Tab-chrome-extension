// ========================
// Water Tracker Elements
// ========================
const goalInput = document.getElementById('goal-input');
const goalValue = document.getElementById('goal-value');
const setGoalButton = document.getElementById('set-goal-btn');
const glassesContainer = document.getElementById('glasses-container');
const resetButton = document.getElementById('reset-btn');
const currentIntake = document.getElementById('current-intake');

// ========================
// State Variables
// ========================
let totalGlasses = 8;
let filledGlasses = 0;
let lastFillTime = 0;

// ========================
// Goal Input Live Update
// ========================
goalInput.addEventListener('input', () => {
    goalValue.textContent = goalInput.value;
});

// ========================
// Set New Goal
// ========================
setGoalButton.addEventListener('click', () => {
    totalGlasses = parseInt(goalInput.value);
    filledGlasses = 0;
    currentIntake.textContent = filledGlasses;

    chrome.storage.local.set({
        dailyGoal: totalGlasses,
        filledGlasses,
        lastFillTime: 0
    }, () => {
        renderGlasses();
        updateProgressBar();
    });
});

// ========================
// Render Glasses
// ========================
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

        // glass click event
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
                //time.textContent = now.toLocaleString([], { hour: '2-digit', minute: '2-digit' });

                //time.innerHTML = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                chrome.storage.local.get(['dailyHistory', 'dailyGoal'], (result) => {
                    const history = result.dailyHistory || {};
                    const today = new Date().toISOString().split('T')[0]; // Correct Date Format
                    const percentage = Math.round((filledGlasses / totalGlasses) * 100); // Correct Calculation

                    history[today] = percentage; // Store percentage correctly

                    chrome.storage.local.set({
                        filledGlasses,
                        lastFillTime,
                        dailyHistory: history
                    }, () => {
                        updateProgressBar();
                        loadFullMonthCalendar(); // Live update the calendar

                        // 🎉 Trigger achievement animation if goal is met
                        if (filledGlasses >= totalGlasses) {
                            showAchievementAnimation();

                            //update the streak counter
                            const todayStr = new Date().toISOString().split('T')[0];
                            if(lastStreakDate !== todayStr){
                                const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                                if (lastStreakDate === yesterdayStr || lastStreakDate === null){
                                    currentStreak++;
                                } else{
                                    currentStreak = 1;
                                }

                                lastStreakDate = todayStr;

                                chrome.storage.local.set({
                                    streak: currentStreak,
                                    lastStreakDate
                                }, () => {
                                    document.getElementById('counter').textContent = `${currentStreak || 0} days`;
                                });

                            }
                        }
                    });
                });
            }
        });
    }
}

// ========================
// Update Progress Bar
// ========================
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');

    const progress = (filledGlasses / totalGlasses) * 100;
    progressBar.style.width = `${progress}%`;
    progressPercentage.textContent = `${Math.round(progress)}% completed`;
}

// ========================
// Reset Button
// ========================
resetButton.addEventListener('click', () => {
    filledGlasses = 0;
    lastFillTime = 0;
    currentIntake.textContent = filledGlasses;

    chrome.storage.local.set({
        filledGlasses,
        lastFillTime
    }, () => {
        renderGlasses();
        updateProgressBar();
        loadWaterHistory();
        loadStreakData();
    });
});


// ========================
// Show Achievement Animation
// ========================
function showAchievementAnimation() {
    const animContainer = document.getElementById('achievement-animation');
    animContainer.classList.remove('hidden');
    achievementAnim.goToAndPlay(0, true);

    // Hide animation after it completes (or after 6 seconds)
    setTimeout(() => {
        animContainer.classList.add('hidden');
    }, 30000); // Adjust timing to match your animation length
}


// ========================
// Load Initial State
// ========================
chrome.storage.local.get(['dailyGoal', 'filledGlasses', 'lastFillTime'], (result) => {
    totalGlasses = result.dailyGoal || 8;
    filledGlasses = result.filledGlasses || 0;
    lastFillTime = result.lastFillTime || 0;

    goalInput.value = totalGlasses;
    goalValue.textContent = totalGlasses;
    currentIntake.textContent = filledGlasses;

    renderGlasses();
    updateProgressBar();
    // loadHistory();
    loadWaterHistory()
});



// ========================
// Daily Reset Alarm
// ========================
chrome.alarms.create('dailyReset', {
    when: getNext11PM(),
    periodInMinutes: 1440
});

function getNext11PM() {
    const now = new Date();
    const next = new Date();
    next.setHours(18, 0, 0, 0);

    if (now > next) next.setDate(next.getDate() + 1);
    return next.getTime();
}

// ========================
// On Daily Reset
// ========================
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyReset') {
        const today = new Date().toLocaleDateString();

        chrome.storage.local.get(['filledGlasses', 'dailyGoal', 'dailyHistory'], (result) => {
            const history = result.dailyHistory || {};
            const percentage = result.dailyGoal ? Math.round((result.filledGlasses / result.dailyGoal) * 100) : 0;

            history[today] = percentage;

            // Keep only the last 31 days
            const keys = Object.keys(history);
            if (keys.length > 31) {
                delete history[keys[0]];
            }

            chrome.storage.local.set({
                filledGlasses: 0,
                lastFillTime: 0,
                dailyHistory: history
            }, () => {
                currentIntake.textContent = 0;
                renderGlasses();
                updateProgressBar();
                loadWaterHistory();
                
            });
        });
    }
});


// Simulate chrome.storage.local with localStorage
const chromeStorage = {
    get: (keys, callback) => {
        let data = {};
        if (keys === null) {
            Object.keys(localStorage).forEach(key => {
                if (key.includes('2025')) { // Only pick water history keys
                    data[key] = parseInt(localStorage.getItem(key));
                }
            });
        }
        callback(data);
    },
    set: (items, callback) => {
        Object.entries(items).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });
        if (callback) callback();
    }
};


function loadFullMonthCalendar() {
    const calendarContainer = document.getElementById('calendar');
    calendarContainer.innerHTML = '';

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    chrome.storage.local.get(['dailyHistory', 'dailyGoal'], (result) => {
        const history = result.dailyHistory || {};
        const goal = result.dailyGoal || 8;

        // calendarContainer.innerHTML = `<h3>${today.toLocaleString('default', { month: 'long' })} ${currentYear}</h3>`;
        
        for (let day = 1; day <= totalDays; day++) {
            const dayBox = document.createElement('div');
            dayBox.classList.add('calendar-day');

            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // const glassesDrank = history[dateString] || 0;
            const percentage = history[dateString] || 0;

            const thisDate = new Date(currentYear, currentMonth, day);

            if (thisDate > today) {
                // Future date
                dayBox.textContent = day;
                dayBox.style.backgroundColor = '#e0e0e0';
                dayBox.style.color = '#9e9e9e';
            } else if (percentage >= 100) {
                // Goal Met
                dayBox.textContent = '🔥';
                dayBox.title = `${formatDate(dateString)} - Goal Met`;
            } else {
                // Goal Not Met
                dayBox.textContent = day;
                dayBox.title = `${formatDate(dateString)} - ${percentage}% completed`;
            }

            // Highlight Today
            if (thisDate.toDateString() === today.toDateString()) {
                dayBox.style.border = '2px solid #00bcd4';
                dayBox.style.backgroundColor = '#e0f7fa';
                if (percentage >= 100) {
                    // Goal Met
                    dayBox.textContent = '🔥';
                    dayBox.title = `${formatDate(dateString)} - Goal Met`;
                }
            }

            calendarContainer.appendChild(dayBox);
        }
    });
}

function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}


// open apps menu
const appsIcon = document.getElementById('apps-icon');
const appsMenu = document.getElementById('apps-menu');

appsIcon.addEventListener('click', () => {
  appsMenu.classList.toggle('show');
});

// Close the menu if clicked outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#apps-menu') && !e.target.closest('#apps-icon')) {
    appsMenu.classList.remove('show');
  }
});


// Handle Chrome search input
document.getElementById('chrome-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query.startsWith('http://') || query.startsWith('https://')) {
            window.open(query, '_self');
        } else {
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            window.open(googleSearchUrl, '_self');
        }
    }
});



// ========================
// initial load features
// ========================
let achievementAnim;

document.addEventListener('DOMContentLoaded', () => {
    loadFullMonthCalendar();
    loadStreakData();
    achievementAnim = lottie.loadAnimation({
        container: document.getElementById('achievement-animation'),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'achievement.json' // Your animation file
    });
});


// ========================
// mood buttons
// ========================

let mood = 'neutral';
window.addEventListener("DOMContentLoaded",()=>{
    getQuoteForMood(mood);
})

async function getQuoteForMood(mood) {
  const moodToCategory = {
    happy: 'happiness',
    neutral: 'life',
    sad: 'Motivation',
    angry: 'Hope'
  };

  // Get the correct category name
  const categoryName = moodToCategory[mood] || 'life';
  
  // Option A: Query parameter version
  const url = `https://get-quotes-api.p.rapidapi.com/category/${categoryName}`;

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '88b311700amshf231adf70ffaacdp170283jsn299808f2c642',
      'x-rapidapi-host': 'get-quotes-api.p.rapidapi.com',
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const result = await response.json();
    const quotesArray = result.quotes;
    // Handle API response (adjust based on actual response format)
    if (Array.isArray(quotesArray) && quotesArray.length > 0) {
      const randomQuote = quotesArray[Math.floor(Math.random() * quotesArray.length)];
      return {
                quote: randomQuote.quote || randomQuote.text || "No quote text found"
            };
    }
    return { quote: "Take a deep breath. ❤️", author: "-Anonymous" };
    
  } catch (error) {
    console.error("Error fetching quote:", error);
    return "Sometimes life is tough, but you're tougher. ❤️";
  }
}


document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const selectedMood = btn.dataset.mood;

        document.getElementById("tip").textContent = "Loading Quote....";
        // document.getElementById("author").textContent = "";

        const { quote } = await getQuoteForMood(selectedMood);

        document.getElementById("tip").textContent = `"${quote}"`;
        // document.getElementById("author").textContent = `– ${author}`;

        const moodLog = {
            date: new Date().toISOString(),
            mood: selectedMood,
            quote: quote
        };
        
        chrome.storage.sync.set({ [Date.now()]: moodLog }, () => {
            console.log('Mood logged:', moodLog);
        });
    });
});


// ========================
// Streak counter
// ========================
// let currentStreak = 0;
// let lastStreakDate = null;

// chrome.storage.local.get(['streak','lastStreakDate'],(res) => {
//     currentStreak = res.streak || null;
//     lastStreakDate = res.lastStreakDate||null;
//     document.getElementById('counter').textContent=`${currentStreak || 0} days`;
// });

function loadStreakData() {
  chrome.storage.local.get(['streak', 'lastStreakDate'], (res) => {
    const currentStreak = res.streak || 0;
    const lastStreakDate = res.lastStreakDate || null;

    const counterEl = document.getElementById('counter');
    if (counterEl) {
      counterEl.textContent = `${currentStreak} days`;
    } else {
      console.warn("Element with id 'counter' not found.");
    }

    // Optionally return values if needed later
    return { currentStreak, lastStreakDate };
  });
}


// ========================
// calander icon
// ========================
document.addEventListener('DOMContentLoaded', () => {
  // Set day name and number in icon
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  document.getElementById('day-name').textContent = dayNames[now.getDay()];
  document.getElementById('day-number').textContent = now.getDate();

  // Handle click on calendar icon
  document.getElementById('calendar-icon').addEventListener('click', () => {
    const calendarPopup = document.getElementById('calendar-popup');
    calendarPopup.classList.toggle('hidden');
    if (!calendarPopup.classList.contains('hidden')) {
      loadFullMonthCalendar(); // Call your existing function
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const calendarCard = document.getElementById('calendar-icon');
  const calendarModal = document.getElementById('calendar-modal');
  const closeBtn = document.getElementById('close-calendar');

  calendarCard.addEventListener('click', () => {
    calendarModal.classList.remove('hidden');
    calendarModal.style.display = 'block';
    loadFullMonthCalendar();
  });

  closeBtn.addEventListener('click', () => {
    calendarModal.classList.add('hidden');
    calendarModal.style.display = 'none';
  });

  // Optional: Click outside modal to close
  window.addEventListener('click', (e) => {
    if (e.target === calendarModal) {
      calendarModal.classList.add('hidden');
      calendarModal.style.display = 'none';
    }
  });
});



// ========================
// Screen time
// ========================
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById('toggle-time-settings');
  const panel = document.getElementById('time-settings-panel');
  const saveBtn = document.getElementById('saveLimit');
  const timeInput = document.getElementById('timeLimit');
  const statusText = document.getElementById('status');
  const closeBtn = document.getElementById('closeModalBtn');
  const screenTimeModal = document.getElementById('screenTimeModal');

  let limitMinutes = parseInt(localStorage.getItem('screenTimeLimit')) || 5;
  let startTime = Date.now();

  // Toggle time setting panel
  toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('show');
  });

  // Hide panel if clicked outside
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) {
      panel.classList.remove('show');
    }
  });

  // Save limit button
  saveBtn?.addEventListener('click', () => {
    const val = parseInt(timeInput.value);
    if (!isNaN(val) && val > 0) {
      limitMinutes = val;
      localStorage.setItem('screenTimeLimit', val);
      statusText.textContent = `Limit set to ${val} minutes ✅`;
      panel.classList.remove('show');
      startTime = Date.now();
    } else {
      statusText.textContent = 'Please enter a valid number';
    }
  });

  // Show the modal
  function showModal() {
    screenTimeModal.style.display = 'flex';
  }

  // Hide the modal
  function closeModal() {
    screenTimeModal.style.display = 'none';
  }

  // Attach close button
  closeBtn?.addEventListener('click', closeModal);

  // Time checking every 30 seconds
  setInterval(() => {
    const now = Date.now();
    const elapsedMin = (now - startTime) / (1000 * 60);
    if (elapsedMin >= limitMinutes) {
      showModal();
      startTime = Date.now(); // Reset after showing modal
    }
  }, 30000);

  // Reset time if tab becomes visible again
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      startTime = Date.now();
    }
  });
});