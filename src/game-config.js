/**
 * Game Configuration Module
 * 
 * Contains all game-specific settings, formatters, and validators.
 * This centralizes game-related configuration for easier maintenance.
 */

/**
 * Score formatters for each game type
 * Each formatter takes a string and returns a formatted version
 */
const SCORE_FORMATTERS = new Map([
  ['gaps', (score) => score.replaceAll('🎥', '🎞️')],
  ['faces', (score) => {
    let lineBreakCounter = 0;
    return score.replace(/👤/g, (match) => {
      lineBreakCounter++;
      return lineBreakCounter === 2 ? '\n👤' : match;
    });
  }],
  ['oneframe', (score) => score.replaceAll('🎥', '1️⃣')],
  ['bandle', (score) => '🥁' + score]
]);

/**
 * Text validators for each game type
 * Used to validate clipboard content before pasting
 */
const TEXT_VALIDATORS = new Map([
  ['framed', /Framed #/],
  ['oneframe', /One Frame Challenge #/],
  ['guessthegame', /GuessTheGame #/],
  ['guesstheaudio', /GuessTheAudio #/],
  ['gaps', /Gaps\s+#/],
  ['episode', /Episode #/],
  ['faces', /Faces #/],
  ['guessthebook', /GuessTheBook #/],
  ['bandle', /Bandle #/],
]);

/**
 * Check if a game has a custom score formatter
 * @param {string} gameId - The game identifier
 * @returns {boolean} True if the game has a custom formatter
 */
export function hasScoreFormatter(gameId) {
  return SCORE_FORMATTERS.has(gameId);
}

/**
 * Get the score formatter for a specific game
 * @param {string} gameId - The game identifier
 * @returns {Function|null} The formatter function or null if not found
 */
export function getScoreFormatter(gameId) {
  return SCORE_FORMATTERS.get(gameId) || null;
}

/**
 * Check if a game has a text validator
 * @param {string} gameId - The game identifier
 * @returns {boolean} True if the game has a validator
 */
export function hasTextValidator(gameId) {
  return TEXT_VALIDATORS.has(gameId);
}

/**
 * Get the text validator for a specific game
 * @param {string} gameId - The game identifier
 * @returns {RegExp|null} The validator regex or null if not found
 */
export function getTextValidator(gameId) {
  return TEXT_VALIDATORS.get(gameId) || null;
}