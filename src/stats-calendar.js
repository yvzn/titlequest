/**
 * Stats Calendar Module
 * 
 * Generates and manages the activity calendar visualization.
 * This module handles the business logic for calculating activity levels
 * and preparing calendar data.
 */

/**
 * Calculate the number of weeks to display (last 52 weeks)
 */
const WEEKS_TO_DISPLAY = 52;

/**
 * Activity level thresholds
 * These determine which color intensity to use based on game count
 */
const ACTIVITY_LEVELS = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 3,
  HIGH: 5,
  VERY_HIGH: 8
};

/**
 * Get the activity level (0-4) based on the number of games played
 * @param {number} count - Number of games played on a day
 * @returns {number} Activity level from 0 (none) to 4 (very high)
 */
export function getActivityLevel(count) {
  if (count === 0) return 0;
  if (count < ACTIVITY_LEVELS.MEDIUM) return 1;
  if (count < ACTIVITY_LEVELS.HIGH) return 2;
  if (count < ACTIVITY_LEVELS.VERY_HIGH) return 3;
  return 4;
}

/**
 * Generate an array of dates for the last N weeks, starting from Sunday
 * @param {number} weeks - Number of weeks to generate
 * @returns {Date[]} Array of Date objects
 */
export function generateCalendarDates(weeks = WEEKS_TO_DISPLAY) {
  const dates = [];
  const today = new Date();
  
  // Find the most recent Sunday
  const dayOfWeek = today.getDay();
  const mostRecentSunday = new Date(today);
  mostRecentSunday.setDate(today.getDate() - dayOfWeek);
  mostRecentSunday.setHours(0, 0, 0, 0);
  
  // Generate dates going back from the most recent Sunday
  const totalDays = weeks * 7;
  const startDate = new Date(mostRecentSunday);
  startDate.setDate(mostRecentSunday.getDate() - totalDays);
  
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

/**
 * Convert a Date object to YYYY-MM-DD string format
 * @param {Date} date - Date to format
 * @returns {string} Date in YYYY-MM-DD format
 */
export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date for display in tooltip
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateForTooltip(date) {
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get unique months that appear in the calendar
 * Returns an array of month names with their starting column positions
 * @param {Date[]} dates - Array of calendar dates
 * @returns {Array<{name: string, column: number}>} Month information
 */
export function getMonthLabels(dates) {
  const months = [];
  let currentMonth = -1;
  let currentColumn = 0;
  
  dates.forEach((date, index) => {
    const month = date.getMonth();
    const weekColumn = Math.floor(index / 7);
    
    // Only add a month label if it's the first occurrence or at the start of a new week
    if (month !== currentMonth && index % 7 === 0) {
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      months.push({ name: monthName, column: weekColumn });
      currentMonth = month;
    }
  });
  
  return months;
}

/**
 * Get abbreviated weekday labels (M, W, F for Monday, Wednesday, Friday)
 * @returns {string[]} Array of weekday labels
 */
export function getWeekdayLabels() {
  return ['', 'Mon', '', 'Wed', '', 'Fri', ''];
}

/**
 * Process activity data from the database into a calendar-friendly format
 * @param {Record<string, number>} allScores - A record mapping dates to counts of unique games
 * @returns {Map<string, number>} Map of date strings to game counts
 */
export function processActivityData(allScores) {
  const activityMap = new Map();
  
  Object.entries(allScores).forEach(([date, count]) => {
    activityMap.set(date, count);
  });
  
  return activityMap;
}

/**
 * Calendar data structure for a single day
 * @typedef {Object} CalendarDay
 * @property {Date} date - The date object
 * @property {string} dateKey - The date in YYYY-MM-DD format
 * @property {number} count - Number of games played
 * @property {number} level - Activity level (0-4)
 * @property {string} tooltip - Tooltip text
 */

/**
 * Generate calendar day data combining dates and activity
 * @param {Date[]} dates - Array of calendar dates
 * @param {Map<string, number>} activityMap - Map of dates to game counts
 * @returns {CalendarDay[]} Array of calendar day objects
 */
export function generateCalendarData(dates, activityMap) {
  return dates.map(date => {
    const dateKey = formatDateKey(date);
    const count = activityMap.get(dateKey) || 0;
    const level = getActivityLevel(count);
    const dateStr = formatDateForTooltip(date);
    const tooltip = count === 0 
      ? `No games on ${dateStr}` 
      : `${count} game${count !== 1 ? 's' : ''} on ${dateStr}`;
    
    return {
      date,
      dateKey,
      count,
      level,
      tooltip
    };
  });
}

/**
 * Main calendar service class
 */
export class CalendarService {
  /**
   * Generate complete calendar data from database scores
   * @param {Record<string, number>} allScores - A record mapping dates to counts of unique games
   * @returns {Object} Calendar data including days, months, and weekdays
   */
  generateCalendarFromScores(allScores) {
    const dates = generateCalendarDates();
    const activityMap = processActivityData(allScores);
    const calendarDays = generateCalendarData(dates, activityMap);
    const months = getMonthLabels(dates);
    const weekdays = getWeekdayLabels();
    
    return {
      days: calendarDays,
      months,
      weekdays
    };
  }
}

// Export a singleton instance
export const calendarService = new CalendarService();
