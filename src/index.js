import Cookies from 'js-cookie'
import { dbService } from './db-service'

import './style.css'

const allTextareas = [...document.querySelectorAll("textarea")]

for (const textarea of allTextareas) {
  textarea.addEventListener('change', updateScoreDisplay);
  textarea.addEventListener('focus', focusAndSelectTextarea);
}

const results = document.querySelector("pre")

function updateScoreDisplay(event) {
  const textareaId = event.currentTarget.id
  const scoreTag = document.getElementById(`score-${textareaId}`)
  let score = formatScore(textareaId, event.currentTarget.value)
  scoreTag.innerText = score.substring(score.indexOf(' ') + 1)

  const aggregated = allTextareas.reduce(
    (accumulator, textarea) => [...accumulator, formatScore(textarea.id, textarea.value)],
    [])
  results.innerText = aggregated.filter(Boolean).join('\n')
}

const scoreFormatter = new Map([
  ['gaps', s => s.replaceAll('🎥', '🎞️')],
  ['faces', s => { let i = 0; return s.replace(/👤/g, match => ++i === 2 ? '\n👤' : match) }],
  ['oneframe', s => s.replaceAll('🎥', '1️⃣')],
  ['bandle', s => '🥁' + s]
])

function formatScore(gameId, text) {
  let formatted = text.normalize("NFD").replaceAll(/[\w\s#:\-/.\(\)%]/g, "")

  if (Boolean(formatted) && scoreFormatter.has(gameId))
    formatted = scoreFormatter.get(gameId).call(null, formatted)

  return formatted
}

let focusedTextareaId = undefined

function focusAndSelectTextarea(event) {
  event.currentTarget.select()
  focusedTextareaId = event.currentTarget.id
}

document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault()
})

const shareButton = document.getElementById("share")
const shareButtonContent = shareButton.innerHTML

shareButton.addEventListener("click", function (event) {
  const button = event.currentTarget
  navigator.clipboard.writeText(results.innerText.trim())
  button.innerHTML = 'Copied !'
  setTimeout(() => button.innerHTML = shareButtonContent, 1000)
})

for (const pasteButton of document.querySelectorAll('.paste-button')) {
  if (!navigator.clipboard.readText) continue
  pasteButton.hidden = false
  pasteButton.addEventListener('click', pasteManuallyFromClipboard)
}

async function pasteManuallyFromClipboard(event) {
  const pasteButton = event.currentTarget

  const textarea = document.getElementById(pasteButton.dataset['for'])

  await pasteClipboardContent(textarea)
}

const textareaValidator = new Map([
  ['framed', /Framed #/],
  ['oneframe', /One Frame Challenge #/],
  ['guessthegame', /GuessTheGame #/],
  ['guesstheaudio', /GuessTheAudio #/],
  ['gaps', /Gaps\s+#/],
  ['episode', /Episode #/],
  ['faces', /Faces #/],
  ['guessthebook', /GuessTheBook #/],
  ['bandle', /Bandle #/],
])

async function pasteClipboardContent(target) {
  let text = await navigator.clipboard.readText()

  if (textareaValidator.has(target.id) && !(textareaValidator.get(target.id).test(text)))
    return

  target.value = text

  const onChangeEvent = new Event('change')
  target.dispatchEvent(onChangeEvent)
}

for (const gameLink of document.querySelectorAll('h3 a')) {
  gameLink.addEventListener('click', function (event) {
    const textarea = document.getElementById(gameLink.dataset['for'])
    textarea.focus()

    const onFocusEvent = new Event('focus')
    textarea.dispatchEvent(onFocusEvent)
  })
}

addEventListener('focus', async function (event) {
  if (!navigator.clipboard.readText) return
  if (!focusedTextareaId) return

  let textarea = document.getElementById(focusedTextareaId)
  await pasteClipboardContent(textarea)

  focusedTextareaId = undefined
})

addEventListener('DOMContentLoaded', function () {
  const isIndexedDBAvailable = 'indexedDB' in window;
  if (!isIndexedDBAvailable) return;

  const linkCookieConsent = document.getElementById("link-cookie-consent")
  const linkStats = document.getElementById("link-stats")

  const cookieConsent = Cookies.get('cookie-consent')
  if (cookieConsent === 'true') {
    linkCookieConsent.hidden = true
    linkStats.hidden = false
  } else {
    linkCookieConsent.hidden = false
    linkStats.hidden = true
  }

  if (cookieConsent === 'true') {
    addEventListener('load', function () {
      dbService.connect();

      for (const textarea of allTextareas) {
        textarea.addEventListener('change', saveScoreToDatabase);
      }
    });
  }
});

function saveScoreToDatabase(event) {
  const gameId = event.currentTarget.id;
  const rawScore = event.currentTarget.value;
  const date = new Date().toISOString().split('T')[0];
  dbService.saveScore(gameId, date, rawScore);
}
