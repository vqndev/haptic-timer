import './style.css'

let activeTab = 'timer'

document.querySelector('#app').innerHTML = `
  <div class="tabs">
    <button class="tab active" data-tab="timer">Timer</button>
    <button class="tab" data-tab="tap">Tap</button>
  </div>

  <div id="tab-timer" class="tab-content active">
    <h1>Haptic Timer</h1>

    <div class="field">
      <label for="interval">Interval (seconds)</label>
      <input type="number" id="interval" value="30" min="1" max="300" inputmode="numeric" />
    </div>

    <div class="field">
      <label for="intensity">Vibration duration: <span id="intensity-val">200</span>ms</label>
      <input type="range" id="intensity" min="50" max="1000" value="200" step="50" />
    </div>

    <div class="buttons">
      <button id="start-btn">Start</button>
      <button id="stop-btn" disabled>Stop</button>
    </div>

    <div id="status">Stopped</div>
    <div id="countdown"></div>
    <div id="vibrate-indicator"></div>
  </div>

  <div id="tab-tap" class="tab-content">
    <h1>Tap & Hold</h1>
    <p class="tap-desc">Press and hold the area below to vibrate continuously. Release to stop.</p>
    <div id="tap-zone">
      <div id="tap-label">HOLD TO VIBRATE</div>
    </div>
  </div>
`

// --- Tabs ---
const tabs = document.querySelectorAll('.tab')
const tabContents = document.querySelectorAll('.tab-content')

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'))
    tabContents.forEach(tc => tc.classList.remove('active'))
    tab.classList.add('active')
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active')
    activeTab = tab.dataset.tab

    // Stop timer if switching away
    if (activeTab !== 'timer') stop()
    // Stop tap vibration if switching away
    if (activeTab !== 'tap') stopTapVibrate()
  })
})

// --- Timer Tab ---
const intervalInput = document.getElementById('interval')
const intensitySlider = document.getElementById('intensity')
const intensityVal = document.getElementById('intensity-val')
const startBtn = document.getElementById('start-btn')
const stopBtn = document.getElementById('stop-btn')
const statusEl = document.getElementById('status')
const countdownEl = document.getElementById('countdown')
const indicatorEl = document.getElementById('vibrate-indicator')

let timerInterval = null
let remaining = 0

intensitySlider.addEventListener('input', () => {
  intensityVal.textContent = intensitySlider.value
})

function vibrate() {
  const ms = parseInt(intensitySlider.value)
  if (navigator.vibrate) {
    navigator.vibrate(ms)
  }
  indicatorEl.textContent = 'BUZZ!'
  setTimeout(() => {
    indicatorEl.textContent = ''
  }, Math.min(ms, 800))
}

function tick() {
  remaining--
  if (remaining <= 0) {
    vibrate()
    remaining = parseInt(intervalInput.value)
  }
  countdownEl.textContent = remaining + 's'
}

function start() {
  const secs = parseInt(intervalInput.value)
  if (!secs || secs < 1) return
  vibrate()
  remaining = secs
  countdownEl.textContent = remaining + 's'
  statusEl.textContent = 'Running'
  statusEl.className = 'running'
  timerInterval = setInterval(tick, 1000)
  startBtn.disabled = true
  stopBtn.disabled = false
  intervalInput.disabled = true
}

function stop() {
  clearInterval(timerInterval)
  timerInterval = null
  if (navigator.vibrate) navigator.vibrate(0)
  statusEl.textContent = 'Stopped'
  statusEl.className = ''
  countdownEl.textContent = ''
  indicatorEl.textContent = ''
  startBtn.disabled = false
  stopBtn.disabled = true
  intervalInput.disabled = false
}

startBtn.addEventListener('click', start)
stopBtn.addEventListener('click', stop)

// --- Tap Tab ---
const tapZone = document.getElementById('tap-zone')
const tapLabel = document.getElementById('tap-label')
let tapVibrateInterval = null

let tapActive = false

function startTapVibrate() {
  tapActive = true
  tapZone.classList.add('active')
  tapLabel.textContent = 'VIBRATING'
  pulseVibrate()
}

function pulseVibrate() {
  if (!tapActive) return
  if (navigator.vibrate) {
    navigator.vibrate(100)
  }
  tapVibrateInterval = setTimeout(pulseVibrate, 100)
}

function stopTapVibrate() {
  tapActive = false
  tapZone.classList.remove('active')
  tapLabel.textContent = 'HOLD TO VIBRATE'
  clearTimeout(tapVibrateInterval)
  tapVibrateInterval = null
}

tapZone.addEventListener('mousedown', startTapVibrate)
tapZone.addEventListener('touchstart', (e) => {
  e.preventDefault()
  startTapVibrate()
})

tapZone.addEventListener('mouseup', stopTapVibrate)
tapZone.addEventListener('mouseleave', stopTapVibrate)
tapZone.addEventListener('touchend', stopTapVibrate)
tapZone.addEventListener('touchcancel', stopTapVibrate)
