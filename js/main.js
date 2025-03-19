// Multiple workout options
const workoutOptions = {
  beginner: {
    name: "Beginner",
    sets: [20, 14, 18, 12, 12]
  },
  intermediate: {
    name: "Intermediate",
    sets: [24, 18, 18, 12, 8]
  },
  advanced: {
    name: "Advanced",
    sets: [26, 20, 14, 12, 10]
  }
};

// Config

// Default workout
let selectedWorkout = "intermediate";
let pushupSets = [...workoutOptions[selectedWorkout].sets];
// const pushupSets = [15, 12, 10, 8, 5]; // Push-ups per set
const restTimeSeconds = 60; // Rest time between sets

// State variables
let currentSetIndex = 0;
let isResting = false;
let timerInterval = null;
let restTimeRemaining = restTimeSeconds;
let workoutStartTime = null;
let workoutEndTime = null;

// DOM Elements
const workoutSelection = document.getElementById('workout-selection');
const workoutDisplay = document.getElementById('workout-display');
const restDisplay = document.getElementById('rest-display');
const workoutCompleteDisplay = document.getElementById('workout-complete');
const currentSetEl = document.getElementById('current-set');
const totalSetsEl = document.getElementById('total-sets');
const repsDisplay = document.getElementById('reps-display');
const timerDisplay = document.getElementById('timer-display');
const progressDotsContainer = document.getElementById('progress-dots');
const completeBtn = document.getElementById('complete-btn');
const skipBtn = document.getElementById('skip-btn');
const newWorkoutBtn = document.getElementById('new-workout-btn');
const totalPushupsEl = document.getElementById('total-pushups');
const totalTimeEl = document.getElementById('total-time');

// Initialize the app
function initApp() {

  // Set up workout selection buttons
  const workoutButtons = document.querySelectorAll('.workout-select-btn');
  workoutButtons.forEach(button => {
    button.addEventListener('click', function() {
      selectedWorkout = this.getAttribute('data-workout');
      pushupSets = [...workoutOptions[selectedWorkout].sets];
      startNewWorkout();
    });
  });

  // Set up the total sets display
  totalSetsEl.textContent = pushupSets.length;
  
  // Create progress dots
  createProgressDots();
  
  // Set up the first set
  updateSetDisplay();
  
  // Add event listeners
  completeBtn.addEventListener('click', completeSet);
  skipBtn.addEventListener('click', skipRest);
  newWorkoutBtn.addEventListener('click', startNewWorkout);
  
  // Record start time
  workoutStartTime = new Date();
  
  // Initialize the app for PWA functionality
  initializePWA();
}

function createProgressDots() {
  progressDotsContainer.innerHTML = '';
  for (let i = 0; i < pushupSets.length; i++) {
    const dot = document.createElement('div');
    dot.className = i === currentSetIndex ? 'progress-dot active' : 'progress-dot';
    progressDotsContainer.appendChild(dot);
  }
}

function updateSetDisplay() {
  // Update the current set number
  currentSetEl.textContent = currentSetIndex + 1;
  
  // Update the reps display
  repsDisplay.textContent = pushupSets[currentSetIndex];
  
  // Update progress dots
  const dots = progressDotsContainer.querySelectorAll('.progress-dot');
  dots.forEach((dot, index) => {
    dot.className = 'progress-dot';
    if (index < currentSetIndex) {
      dot.classList.add('completed');
    } else if (index === currentSetIndex) {
      dot.classList.add('active');
    }
  });
}

function completeSet() {
  // Show rest timer
  workoutDisplay.classList.add('hidden');
  restDisplay.classList.remove('hidden');
  workoutSelection.classList.add('hidden');
  
  isResting = true;
  restTimeRemaining = restTimeSeconds;
  timerDisplay.textContent = restTimeRemaining;
  
  // Start the timer
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  restTimeRemaining--;
  timerDisplay.textContent = restTimeRemaining;
  
  if (restTimeRemaining <= 0) {
    clearInterval(timerInterval);
    finishRest();
  }
}

function skipRest() {
  clearInterval(timerInterval);
  finishRest();
}

function finishRest() {
  isResting = false;
  
  // Move to the next set
  currentSetIndex++;
  
  if (currentSetIndex < pushupSets.length) {
    // Show the next set
    restDisplay.classList.add('hidden');
    workoutDisplay.classList.remove('hidden');
    updateSetDisplay();
  } else {
    // Workout complete
    completeWorkout();
  }
}

function completeWorkout() {
  workoutEndTime = new Date();
  
  // Calculate workout statistics
  const totalPushups = pushupSets.reduce((sum, reps) => sum + reps, 0);
  const totalTimeSeconds = Math.floor((workoutEndTime - workoutStartTime) / 1000);
  const minutes = Math.floor(totalTimeSeconds / 60);
  const seconds = totalTimeSeconds % 60;
  
  // Update stats display
  totalPushupsEl.textContent = totalPushups;
  totalTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  // Show workout complete screen
  restDisplay.classList.add('hidden');
  workoutDisplay.classList.add('hidden');
  workoutCompleteDisplay.classList.remove('hidden');
}

function startNewWorkout() {
  // Reset state
  currentSetIndex = 0;
  isResting = false;
  clearInterval(timerInterval);
  workoutStartTime = new Date();

  // Get the selected workout
  pushupSets = [...workoutOptions[selectedWorkout].sets];
  
  // Reset UI
  workoutCompleteDisplay.classList.add('hidden');
  workoutDisplay.classList.remove('hidden');
  workoutSelection.classList.remove('hidden');
  updateSetDisplay();
  createProgressDots(); // Recreate progress dots in case set count changed
}

function initializePWA() {
  // Register service worker for PWA functionality
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);