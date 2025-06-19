// // Health tips
// const tips = [
//   "Drink a glass of water 💧",
//   "Take a deep breath 🌬️",
//   "Stretch your legs 🧘",
//   "Look away from the screen 👀",
//   "Smile 😄 You’re awesome!"
// ];

// document.getElementById("tip").textContent = tips[Math.floor(Math.random() * tips.length)];
// document.getElementById("tip").classList.remove("hidden");

// // Elements
// const goalInput = document.getElementById('goal-input');
// const goalValue = document.getElementById('goal-value');
// const setGoalButton = document.getElementById('set-goal-btn');
// const glassesContainer = document.getElementById('glasses-container');
// const resetButton = document.getElementById('reset-btn');
// const currentIntake = document.getElementById('current-intake');

// // State
// let totalGlasses = 8;
// let filledGlasses = 0;
// let lastFillTime = 0;

// // Set goal slider live update
// goalInput.addEventListener('input', () => {
//     goalValue.textContent = goalInput.value;
// });

// // Set goal button
// setGoalButton.addEventListener('click', () => {
//     totalGlasses = parseInt(goalInput.value);
//     filledGlasses = 0;
//     currentIntake.textContent = filledGlasses;

//     chrome.storage.local.set({
//         dailyGoal: totalGlasses,
//         filledGlasses,
//         lastFillTime: 0
//     }, () => { renderGlasses();
//         updateProgressBar();
//      });
// });

// // Render glasses
// function renderGlasses() {
//     glassesContainer.innerHTML = '';

//     for (let i = 0; i < totalGlasses; i++) {
//         const glassWrapper = document.createElement('div');
//         glassWrapper.classList.add('glass');

//         const animationContainer = document.createElement('div');
//         animationContainer.id = `glass-${i}`;

//         glassWrapper.appendChild(animationContainer);
//         glassesContainer.appendChild(glassWrapper);

//         const glassAnim = lottie.loadAnimation({
//             container: animationContainer,
//             renderer: 'svg',
//             loop: false,
//             autoplay: false,
//             path: 'fill_water_glass.json'
//         });

//         glassAnim.addEventListener('DOMLoaded', () => {
//             glassAnim.goToAndStop(0, true);

//             if (i < filledGlasses) {
//                 glassAnim.goToAndStop(glassAnim.totalFrames, true);
//             }
//         });

//         glassWrapper.addEventListener('click', () => {
//             const now = Date.now();
//             if (i === filledGlasses) {
//                 if (now - lastFillTime < 60000) {
//                     alert('Please wait at least 1 minute before recording the next glass!');
//                     return;
//                 }

//                 glassAnim.play();
//                 filledGlasses++;
//                 lastFillTime = now;
//                 currentIntake.textContent = filledGlasses;

//                 chrome.storage.local.set({
//                     filledGlasses,
//                     lastFillTime
//                 });
//                 updateProgressBar();
//             }
//         });
//     }
// }

// // Update progress bar
// function updateProgressBar() {
//     const progressBar = document.getElementById('progress-bar');
//     const progressPercentage = document.getElementById('progress-percentage');

//     const progress = (filledGlasses / totalGlasses) * 100;
//     progressBar.style.width = `${progress}%`;
//     progressPercentage.textContent = `${Math.round(progress)}% completed`;
// }


// // Reset button
// resetButton.addEventListener('click', () => {
//     filledGlasses = 0;
//     lastFillTime = 0;
//     currentIntake.textContent = filledGlasses;

//     chrome.storage.local.set({
//         filledGlasses,
//         lastFillTime
//     }, () => { renderGlasses();
//         updateProgressBar();
//     });
// });

// // Load initial values
// chrome.storage.local.get(['dailyGoal', 'filledGlasses', 'lastFillTime'], (result) => {
//     totalGlasses = result.dailyGoal || 8;
//     filledGlasses = result.filledGlasses || 0;
//     lastFillTime = result.lastFillTime || 0;

//     goalInput.value = totalGlasses;
//     goalValue.textContent = totalGlasses;
//     currentIntake.textContent = filledGlasses;

//     renderGlasses();
//     updateProgressBar();
// });

// // Schedule 11 PM reset alarm
// chrome.alarms.create('dailyReset', {
//     when: getNext11PM(),
//     periodInMinutes: 1440
// });

// function getNext11PM() {
//     const now = new Date();
//     const next = new Date();
//     next.setHours(23, 0, 0, 0);

//     if (now > next) next.setDate(next.getDate() + 1);
//     return next.getTime();
// }

// // Listen for alarm and log data
// chrome.alarms.onAlarm.addListener((alarm) => {
//     if (alarm.name === 'dailyReset') {
//         const today = new Date().toLocaleDateString();

//         chrome.storage.local.get(['filledGlasses', 'dailyHistory'], (result) => {
//             const history = result.dailyHistory || {};
//             history[today] = result.filledGlasses || 0;

//             chrome.storage.local.set({
//                 filledGlasses: 0,
//                 lastFillTime: 0,
//                 dailyHistory: history
//             }, () => {
//                 currentIntake.textContent = 0;
//                 renderGlasses();
//                 updateProgressBar();
//             });
//         });
//     }
// });


// //  Water History Calendar
// const calendarEl = document.getElementById('calendar');
// const dayDetails = document.getElementById('day-details');

// // For quick testing, run this once in your JS file:


// // function loadWaterHistory() {
// //     chrome.storage.local.get(null, (data) => {
// //         renderCalendar(data);
// //     });
// // }

// // function renderCalendar(historyData) {
// //     calendarEl.innerHTML = '';

// //     const now = new Date();
// //     const year = now.getFullYear();
// //     const month = now.getMonth(); // 0 = January
// //     const daysInMonth = new Date(year, month + 1, 0).getDate();

// //     for (let day = 1; day <= daysInMonth; day++) {
// //         const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
// //         const percentage = historyData[dateStr] || 0;

// //         const dayBox = document.createElement('div');
// //         dayBox.classList.add('day');

// //         if (percentage >= 100) {
// //             dayBox.classList.add('met');
// //             dayBox.textContent = '🔥';
// //         } else if (percentage > 0) {
// //             dayBox.classList.add('partial');
// //             dayBox.textContent = '💧';
// //         } else {
// //             dayBox.classList.add('none');
// //             dayBox.textContent = '';
// //         }

// //         dayBox.addEventListener('click', () => {
// //             dayDetails.classList.remove('hidden');
// //             dayDetails.innerHTML = `
// //                 <strong>Date:</strong> ${dateStr}<br>
// //                 <strong>Water Intake:</strong> ${percentage}%
// //             `;
// //         });

// //         calendarEl.appendChild(dayBox);
// //     }

// //     // Show weekly avg if today is Sunday
// //     if (now.getDay() === 0) { // Sunday
// //         const avg = calculateWeeklyAverage(historyData);
// //         alert(`Weekly Average Water Intake: ${avg.toFixed(2)}%`);
// //     }
// // }

// // function calculateWeeklyAverage(historyData) {
// //     const now = new Date();
// //     let total = 0;
// //     let count = 0;

// //     for (let i = 0; i < 7; i++) {
// //         const date = new Date();
// //         date.setDate(now.getDate() - i);
// //         const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
// //         if (historyData[dateStr] !== undefined) {
// //             total += historyData[dateStr];
// //             count++;
// //         }
// //     }
// //     return count > 0 ? total / count : 0;
// // }

// // // Call this on your history page load
// // loadWaterHistory();



// // Insert dummy data (run this only once for testing, then you can remove or comment it)
// // chrome.storage.local.set({
// //     "2025-06-17": 100,
// //     "2025-06-18": 80,
// //     "2025-06-19": 50,
// //     "2025-06-20": 100
// // }, () => {
// //     console.log('Dummy data added!');
// // });

// // // Load Water History Calendar
// // function loadWaterHistory() {
// //     const calendarContainer = document.getElementById('calendar');
// //     calendarContainer.innerHTML = ''; // Clear previous content

// //     chrome.storage.local.get(null, (data) => {
// //         console.log('Loaded history data:', data);

// //         // If no data, show message
// //         if (Object.keys(data).length === 0) {
// //             calendarContainer.innerHTML = '<p>No water intake history yet.</p>';
// //             return;
// //         }

// //         const sortedDates = Object.keys(data).sort();

// //         sortedDates.forEach(date => {
// //             const percentage = data[date];
// //             const dayBox = document.createElement('div');
// //             dayBox.classList.add('calendar-day');

// //             // Show fire emoji if goal met, water emoji if not met
// //             dayBox.textContent = percentage >= 100 ? '🔥' : '💧';
// //             dayBox.title = `${date} - ${percentage}% intake`;

// //             calendarContainer.appendChild(dayBox);
// //         });
// //     });
// // }

// // // Run this when page loads
// // document.addEventListener('DOMContentLoaded', () => {
// //     loadWaterHistory();
// // });


// // Dummy last 7 days water data
// const waterHistory = [
//     { date: '2025-06-17', percentage: 100 },
//     { date: '2025-06-16', percentage: 80 },
//     { date: '2025-06-15', percentage: 100 },
//     { date: '2025-06-14', percentage: 60 },
//     { date: '2025-06-13', percentage: 90 },
//     { date: '2025-06-12', percentage: 100 },
//     { date: '2025-06-11', percentage: 50 }
// ];

// const timeline = document.getElementById('timeline');

// function loadTimeline() {
//     timeline.innerHTML = '';
//     waterHistory.forEach(record => {
//         const item = document.createElement('div');
//         item.classList.add('timeline-item');

//         const icon = document.createElement('div');
//         icon.classList.add('timeline-icon');
//         icon.textContent = record.percentage >= 100 ? '🔥' : '💧';

//         const details = document.createElement('div');
//         details.classList.add('timeline-details');
//         details.innerHTML = `<strong>${formatDate(record.date)}</strong> - ${record.percentage}%`;

//         const progressBar = document.createElement('div');
//         progressBar.classList.add('percentage-bar');
//         progressBar.style.width = `${record.percentage}%`;

//         details.appendChild(progressBar);

//         item.appendChild(icon);
//         item.appendChild(details);
//         timeline.appendChild(item);

//         // Optional: Click to show details
//         item.addEventListener('click', () => {
//             alert(`Date: ${record.date}\nWater Intake: ${record.percentage}%`);
//         });
//     });
// }

// function formatDate(dateString) {
//     const options = { month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString(undefined, options);
// }

// loadTimeline();



// // ========================
// // Load History Timeline
// // ========================
// // Inject dummy history for testing
// chrome.storage.local.set({
//     dailyHistory: {
//         '6/11/2025': 80,
//         '6/12/2025': 100,
//         '6/13/2025': 50,
//         '6/14/2025': 90,
//         '6/15/2025': 60,
//         '6/16/2025': 100,
//         '6/17/2025': 75
//     }
// }, () => {
//     console.log('Dummy data added');
//     loadHistory(); // Force load history after adding dummy data
// });


// function loadHistory() {
//     chrome.storage.local.get('dailyHistory', (result) => {
//         const history = result.dailyHistory || {};
//         const timeline = document.getElementById('timeline');
//         timeline.innerHTML = '';

//         const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a)).slice(0, 7);

//         sortedDates.forEach(date => {
//             const percentage = history[date];

//             const item = document.createElement('div');
//             item.classList.add('timeline-item');

//             const icon = document.createElement('div');
//             icon.classList.add('timeline-icon');
//             icon.textContent = percentage >= 100 ? '🔥' : '💧';

//             const details = document.createElement('div');
//             details.classList.add('timeline-details');
//             details.innerHTML = `<strong>${formatDate(date)}</strong> - ${percentage}%`;

//             const progressBar = document.createElement('div');
//             progressBar.classList.add('percentage-bar');
//             progressBar.style.width = `${percentage}%`;

//             details.appendChild(progressBar);
//             item.appendChild(icon);
//             item.appendChild(details);
//             timeline.appendChild(item);

//             item.addEventListener('click', () => {
//                 alert(`Date: ${date}\nWater Intake: ${percentage}%`);
//             });
//         });
//     });
// }

// // ========================
// // Format Date for Display
// // ========================
// function formatDate(dateString) {
//     const options = { month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString(undefined, options);
// }





// ========================
// Health Tips (Optional)
// ========================
const tips = [
    "Drink a glass of water 💧",
    "Take a deep breath 🌬️",
    "Stretch your legs 🧘",
    "Look away from the screen 👀",
    "Smile 😄 You’re awesome!"
];

document.getElementById("tip").textContent = tips[Math.floor(Math.random() * tips.length)];
document.getElementById("tip").classList.remove("hidden");

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
    next.setHours(23, 0, 0, 0);

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
                loadWaterHistory()
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

// Dummy data (run this once for testing)
// chromeStorage.set({
//     "2025-06-13": 100,
//     "2025-06-14": 100,
//     "2025-06-15": 100,
//     "2025-06-16": 100,
//     "2025-06-17": 100,
//     "2025-06-18": 80,
//     "2025-06-19": 50,
//     "2025-06-20": 100,
//     "2025-06-21": 60,
//     "2025-06-22": 100,
//     "2025-06-23": 70
// }, () => {
//     console.log('Dummy data added!');
//     loadWaterHistory(); // Load calendar after adding dummy data
// });


// ========================
// Load Water History Calendar
// ========================

// function loadWaterHistory() {
//     const calendarContainer = document.getElementById('calendar');
//     calendarContainer.innerHTML = '';

//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth(); // 0-indexed
//     const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate(); // Total days in the month

//     chromeStorage.get(null, (data) => {
//         console.log('Loaded history data:', data);
//         calendarContainer.innerHTML = `<h3>${today.toLocaleString('default', { month: 'long' })} ${currentYear}</h3>`;
        
//         for (let day = 1; day <= totalDays; day++) {
//             const dayBox = document.createElement('div');
//             dayBox.classList.add('calendar-day');

//             const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
//             const percentage = data[dateString] || 0;

//             const thisDate = new Date(currentYear, currentMonth, day);

//             if (thisDate > today) {
//                 // Future date
//                 dayBox.textContent = day;
//                 dayBox.style.backgroundColor = '#e0e0e0';
//                 dayBox.style.color = '#9e9e9e';
//             } else if (percentage >= 100) {
//                 // Target met
//                 dayBox.textContent = '🔥';
//                 dayBox.title = `${formatDate(dateString)} - Target met!`;
//             } else {
//                 // Target not met
//                 dayBox.textContent = day;
//                 dayBox.title = `${formatDate(dateString)} - ${percentage}% intake`;
//             }

//             // Highlight today
//             if (thisDate.toDateString() === today.toDateString()) {
//                 dayBox.style.border = '2px solid #00bcd4';
//                 dayBox.style.backgroundColor = '#e0f7fa';
//             }

//             calendarContainer.appendChild(dayBox);
//         }
//     });
// }

// function formatDate(dateString) {
//     const options = { month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString(undefined, options);
// }

// // On page load
// document.addEventListener('DOMContentLoaded', () => {
//     loadWaterHistory();
// });


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
            window.open(query, '_blank');
        } else {
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            window.open(googleSearchUrl, '_blank');
        }
    }
});



// ========================
// initial load features
// ========================
let achievementAnim;

document.addEventListener('DOMContentLoaded', () => {
    loadFullMonthCalendar();
    achievementAnim = lottie.loadAnimation({
        container: document.getElementById('achievement-animation'),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'achievement.json' // Your animation file
    });
});
