import Cookies from 'js-cookie'
import './snake.css'

// ============================================================================
// CONSTANTS
// ============================================================================

const GRID_W = 20
const GRID_H = 20
const CELL_SIZE = 28

const BASE_SPEED = 200  // ms between ticks
const MIN_SPEED = 70
const SPEED_BOOST_EVERY = 5  // food eaten before speed boost
const SPEED_BOOST_AMOUNT = 15

const FOOD_EMOJIS = ['🎥', '1️⃣', '🎮', '🔊', '🎞️', '📺', '👤', '🥁']

const EMOJI = {
    wall: '🟥',
    head: '🟩',
    body: '🟨',
    dead: '🟥',
    emptyDark: '⬛',
    emptyLight: '⬜',
}

const DIR = {
    UP:    { x:  0, y: -1 },
    DOWN:  { x:  0, y:  1 },
    LEFT:  { x: -1, y:  0 },
    RIGHT: { x:  1, y:  0 },
}

// ============================================================================
// STATE
// ============================================================================

/** @type {HTMLCanvasElement} */
let canvas
/** @type {CanvasRenderingContext2D} */
let ctx

let snake = []           // [{x, y}, ...] — head is index 0
let direction = DIR.RIGHT
let nextDirection = DIR.RIGHT
let food = null          // {x, y}
let currentFoodEmoji = ''
let score = 0
let bestScore = 0
let speed = BASE_SPEED
let tickTimer = null
let touchStart = null
let darkMode = false

/** @type {'idle' | 'playing' | 'paused' | 'over'} */
let gameState = 'idle'

// ============================================================================
// INIT
// ============================================================================

function init() {
    canvas = document.getElementById('game-canvas')
    ctx = canvas.getContext('2d')

    canvas.width  = GRID_W * CELL_SIZE
    canvas.height = GRID_H * CELL_SIZE

    darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        darkMode = e.matches
        if (gameState !== 'playing') renderFrame()
    })

    if (Cookies.get('cookie-consent') === 'true') {
        bestScore = parseInt(localStorage.getItem('titlequest-snake-best') || '0')
    }
    document.getElementById('best-score').textContent = bestScore

    resetGame()
    renderFrame()

    document.addEventListener('keydown', onKey)

    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchend',   onTouchEnd,   { passive: false })

    document.getElementById('start-btn').addEventListener('click', () => {
        if (gameState === 'paused') {
            resumeGame()
        } else {
            startGame()
        }
    })
}

// ============================================================================
// GAME CONTROL
// ============================================================================

function resetGame() {
    const midX = Math.floor(GRID_W / 2)
    const midY = Math.floor(GRID_H / 2)
    snake = [
        { x: midX,     y: midY },
        { x: midX - 1, y: midY },
        { x: midX - 2, y: midY },
    ]
    direction     = { ...DIR.RIGHT }
    nextDirection = { ...DIR.RIGHT }
    score = 0
    speed = BASE_SPEED
    document.getElementById('score').textContent = '0'
    placeFood()
}

function startGame() {
    resetGame()
    gameState = 'playing'
    hideOverlay()
    clearInterval(tickTimer)
    tickTimer = setInterval(tick, speed)
}

function pauseGame() {
    gameState = 'paused'
    clearInterval(tickTimer)
    showOverlay('⏸ Paused', 'Press P, Space, or click to resume', 'Resume')
}

function resumeGame() {
    gameState = 'playing'
    hideOverlay()
    clearInterval(tickTimer)
    tickTimer = setInterval(tick, speed)
}

function endGame() {
    gameState = 'over'
    clearInterval(tickTimer)
    renderDead()
    setTimeout(() => {
        showOverlay('Game Over', `You scored ${score} point${score !== 1 ? 's' : ''}`, 'Play Again')
    }, 500)
}

// ============================================================================
// GAME LOOP
// ============================================================================

function tick() {
    direction = { ...nextDirection }

    const head = snake[0]
    const newHead = { x: head.x + direction.x, y: head.y + direction.y }

    // Wall collision (outer ring)
    if (newHead.x <= 0 || newHead.x >= GRID_W - 1 || newHead.y <= 0 || newHead.y >= GRID_H - 1) {
        endGame()
        return
    }

    // Self collision
    if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        endGame()
        return
    }

    const ateFood = food && newHead.x === food.x && newHead.y === food.y
    snake.unshift(newHead)

    if (ateFood) {
        score++
        document.getElementById('score').textContent = score

        if (score > bestScore) {
            bestScore = score
            document.getElementById('best-score').textContent = bestScore
            if (Cookies.get('cookie-consent') === 'true') {
                localStorage.setItem('titlequest-snake-best', String(bestScore))
            }
        }

        placeFood()

        if (score % SPEED_BOOST_EVERY === 0) {
            speed = Math.max(MIN_SPEED, speed - SPEED_BOOST_AMOUNT)
            clearInterval(tickTimer)
            tickTimer = setInterval(tick, speed)
        }
    } else {
        snake.pop()
    }

    renderFrame()
}

// ============================================================================
// FOOD
// ============================================================================

function placeFood() {
    let pos
    do {
        pos = {
            x: 1 + Math.floor(Math.random() * (GRID_W - 2)),
            y: 1 + Math.floor(Math.random() * (GRID_H - 2)),
        }
    } while (snake.some(s => s.x === pos.x && s.y === pos.y))

    food = pos
    currentFoodEmoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)]
}

// ============================================================================
// RENDERING
// ============================================================================

function renderFrame() {
    const emptyEmoji = darkMode ? EMOJI.emptyDark : EMOJI.emptyLight
    drawGrid(emptyEmoji, false)
}

function renderDead() {
    const emptyEmoji = darkMode ? EMOJI.emptyDark : EMOJI.emptyLight
    drawGrid(emptyEmoji, true)
}

/**
 * Draw the full game grid onto the canvas.
 * @param {string} emptyEmoji
 * @param {boolean} isDead  — when true the snake body is drawn in red
 */
function drawGrid(emptyEmoji, isDead) {
    const snakeSet = buildSnakeSet()

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = `${Math.floor(CELL_SIZE * 0.85)}px serif`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'

    for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
            const cx = (x + 0.5) * CELL_SIZE
            const cy = (y + 0.5) * CELL_SIZE
            ctx.fillText(cellEmoji(x, y, snakeSet, emptyEmoji, isDead), cx, cy)
        }
    }
}

function cellEmoji(x, y, snakeSet, emptyEmoji, isDead) {
    const isWall = x === 0 || x === GRID_W - 1 || y === 0 || y === GRID_H - 1
    if (isWall) return EMOJI.wall

    if (food && x === food.x && y === food.y) return currentFoodEmoji

    if (snake.length > 0 && snake[0].x === x && snake[0].y === y) {
        return isDead ? EMOJI.dead : EMOJI.head
    }

    if (snakeSet.has(`${x},${y}`)) {
        return isDead ? EMOJI.dead : EMOJI.body
    }

    return emptyEmoji
}

/** Build a Set of "x,y" strings for all snake cells (head included). */
function buildSnakeSet() {
    return new Set(snake.map(s => `${s.x},${s.y}`))
}

// ============================================================================
// OVERLAY
// ============================================================================

function showOverlay(title, message, buttonLabel) {
    document.getElementById('overlay-title').textContent = title
    document.getElementById('overlay-message').textContent = message
    document.getElementById('start-btn').textContent = buttonLabel
    document.getElementById('overlay').removeAttribute('hidden')
}

function hideOverlay() {
    document.getElementById('overlay').setAttribute('hidden', '')
}

// ============================================================================
// INPUT — KEYBOARD
// ============================================================================

function onKey(e) {
    switch (e.key) {
        case 'ArrowUp':
        case 'w': case 'W':
            e.preventDefault()
            trySetDirection(DIR.UP)
            break
        case 'ArrowDown':
        case 's': case 'S':
            e.preventDefault()
            trySetDirection(DIR.DOWN)
            break
        case 'ArrowLeft':
        case 'a': case 'A':
            e.preventDefault()
            trySetDirection(DIR.LEFT)
            break
        case 'ArrowRight':
        case 'd': case 'D':
            e.preventDefault()
            trySetDirection(DIR.RIGHT)
            break
        case 'p': case 'P':
            e.preventDefault()
            togglePause()
            break
        case ' ':
        case 'Enter':
            e.preventDefault()
            onStartOrToggle()
            break
    }
}

// ============================================================================
// INPUT — TOUCH
// ============================================================================

function onTouchStart(e) {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    e.preventDefault()
}

function onTouchEnd(e) {
    if (!touchStart) return
    const dx = e.changedTouches[0].clientX - touchStart.x
    const dy = e.changedTouches[0].clientY - touchStart.y
    touchStart = null
    e.preventDefault()

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        // Tap: start / toggle pause
        onStartOrToggle()
        return
    }

    if (Math.abs(dx) >= Math.abs(dy)) {
        trySetDirection(dx > 0 ? DIR.RIGHT : DIR.LEFT)
    } else {
        trySetDirection(dy > 0 ? DIR.DOWN : DIR.UP)
    }
}

// ============================================================================
// HELPERS
// ============================================================================

function trySetDirection(newDir) {
    // Ignore reversal (can't go directly backwards)
    if (newDir.x === -direction.x && newDir.y === -direction.y) return
    nextDirection = { ...newDir }

    // Any directional input while idle or game-over starts a new game
    if (gameState === 'idle' || gameState === 'over') startGame()
    else if (gameState === 'paused') resumeGame()
}

function togglePause() {
    if (gameState === 'playing') pauseGame()
    else if (gameState === 'paused') resumeGame()
}

function onStartOrToggle() {
    if (gameState === 'idle' || gameState === 'over') startGame()
    else if (gameState === 'playing') pauseGame()
    else if (gameState === 'paused') resumeGame()
}

// ============================================================================
// ENTRY POINT
// ============================================================================

document.addEventListener('DOMContentLoaded', init)
