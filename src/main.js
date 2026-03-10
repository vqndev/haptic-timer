import './style.css'

document.querySelector('#app').innerHTML = `
  <h1>Haptic Timer</h1>

  <div class="field">
    <label for="interval">Interval (seconds)</label>
    <input type="number" id="interval" value="30" min="1" max="300" inputmode="numeric" />
  </div>

  <div class="field">
    <label for="intensity">Vibration intensity: <span id="intensity-val">200</span>ms</label>
    <input type="range" id="intensity" min="50" max="1000" value="200" step="50" />
  </div>

  <div class="buttons">
    <button id="start-btn">Start</button>
    <button id="stop-btn" disabled>Stop</button>
  </div>

  <div id="status">Stopped</div>
  <div id="countdown"></div>
  <div id="vibrate-indicator"></div>
`

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

  // Initial vibrate to get user gesture permission & confirm it works
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

  if (navigator.vibrate) navigator.vibrate(0) // cancel any ongoing vibration

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
