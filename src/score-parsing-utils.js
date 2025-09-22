/**
 * Score Parsing Utilities Module
 * 
 * Contains utilities for parsing and analyzing game scores.
 * This module handles the conversion of formatted scores into numerical values for statistics.
 */

/**
 * Score symbols used in games for analysis
 */
export const SCORE_SYMBOLS = {
  GREEN_SQUARE: '🟩',
  YELLOW_SQUARE: '🟨', 
  RED_SQUARE: '🟥',
  BLACK_SQUARE: '⬛',
  WHITE_SQUARE: '⬜'
};

/**
 * Special score values
 */
export const SPECIAL_SCORES = {
  GAME_OVER: 1000,
  INVALID_SCORE: -1
};

/**
 * Parse a formatted score string into an integer representation
 * @param {string} scoreText - The formatted score text
 * @returns {number} The integer representation of the score
 */
export function parseScoreAsInteger(scoreText) {
  // Handle empty or invalid scores
  if (!scoreText || typeof scoreText !== 'string') {
    return SPECIAL_SCORES.INVALID_SCORE;
  }

  // Handle multiline scores by parsing each line and summing
  if (isMultilineScore(scoreText)) {
    return parseMultilineScore(scoreText);
  }

  // Parse single line score
  return parseSingleLineScore(scoreText);
}

/**
 * Check if a score contains multiple lines
 * @param {string} scoreText - The score text to check
 * @returns {boolean} True if the score has multiple lines
 */
function isMultilineScore(scoreText) {
  return scoreText.includes('\n');
}

/**
 * Parse a multiline score by summing individual line scores
 * @param {string} scoreText - The multiline score text
 * @returns {number} The sum of all line scores
 */
function parseMultilineScore(scoreText) {
  return scoreText
    .split('\n')
    .map(line => parseSingleLineScore(line))
    .filter(score => score !== SPECIAL_SCORES.INVALID_SCORE)
    .reduce((total, score) => total + score, 0);
}

/**
 * Parse a single line score into an integer
 * @param {string} scoreLine - A single line of score text
 * @returns {number} The integer representation of the score
 */
function parseSingleLineScore(scoreLine) {
  const cleanScore = scoreLine.replace(/\s+/g, '');
  
  if (!cleanScore) {
    return SPECIAL_SCORES.INVALID_SCORE;
  }

  const greenSquareIndex = cleanScore.indexOf(SCORE_SYMBOLS.GREEN_SQUARE);
  
  // No green square means game over
  if (greenSquareIndex < 0) {
    return SPECIAL_SCORES.GAME_OVER;
  }

  // Count squares before the first green square
  const beforeGreenSquare = cleanScore.substring(0, greenSquareIndex);
  const squareCount = countScoreSquares(beforeGreenSquare);
  
  // Return 1-based score (number of attempts)
  return squareCount + 1;
}

/**
 * Count the number of score squares in a text
 * @param {string} text - The text to analyze
 * @returns {number} The total number of score squares
 */
function countScoreSquares(text) {
  const squareTypes = [
    SCORE_SYMBOLS.YELLOW_SQUARE,
    SCORE_SYMBOLS.RED_SQUARE,
    SCORE_SYMBOLS.BLACK_SQUARE,
    SCORE_SYMBOLS.WHITE_SQUARE
  ];

  return squareTypes.reduce((total, square) => {
    const matches = text.match(new RegExp(square, 'g'));
    return total + (matches ? matches.length : 0);
  }, 0);
}

/**
 * Categorize scores into rounds or game over status
 * @param {Object} scoresByRound - Object with round numbers as keys and counts as values
 * @returns {Object} Categorized scores with game over scores grouped
 */
export function categorizeScores(scoresByRound) {
  return Object.entries(scoresByRound).reduce((acc, [round, count]) => {
    const roundNumber = parseInt(round, 10);
    
    if (roundNumber >= SPECIAL_SCORES.GAME_OVER) {
      acc['gameOver'] = (acc['gameOver'] || 0) + count;
    } else {
      acc[round] = count;
    }
    
    return acc;
  }, {});
}

/**
 * Validate if a score text contains valid game symbols
 * @param {string} scoreText - The score text to validate
 * @returns {boolean} True if the score contains valid symbols
 */
export function isValidScoreFormat(scoreText) {
  if (!scoreText || typeof scoreText !== 'string') {
    return false;
  }

  const allSymbols = Object.values(SCORE_SYMBOLS);
  return allSymbols.some(symbol => scoreText.includes(symbol));
}