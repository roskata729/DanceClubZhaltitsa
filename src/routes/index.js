const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdministrator } = require('../lib/auth');
const pool = require('../database');
const helpers = require('../lib/helpers');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/schedule', isLoggedIn, (req, res) => {
    const sql = 'SELECT id, group_id, date FROM trainings';
    pool.query(sql, (error, results) => {
      if (error) throw error;
      const trainingDates = results.map(({ id, group_id, date }) => ({
        id,
        group: group_id,
        date: new Date(date).getTime(),
      }));
      trainingDates.sort((a, b) => a.date - b.date);
  
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const months = {};
      const weekNames = ["Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота", "Неделя", ]
  
      trainingDates.forEach((trainingDate) => {
        const date = new Date(trainingDate.date);
        const month = translateMonthToBulgarian(monthNames[date.getMonth()]);
        const year = date.getFullYear();
  
        // Create month object if it doesn't exist
        if (!months[year]) {
          months[year] = {};
        }
        if (!months[year][month]) {
          months[year][month] = [];
        }
  
        // Find the week object for this date, or create a new one if it doesn't exist
        const firstDayOfMonth = new Date(year, date.getMonth(), 1);
        const firstWeekOfMonth = getWeekNumber(firstDayOfMonth);
        const weekNumber = getWeekNumber(date);
        const weekIndex = weekNumber - firstWeekOfMonth;
        let week = months[year][month][weekIndex];
        if (!week) {
          week = { days: [] };
          months[year][month][weekIndex] = week;
        }
  
        // Add the training date to the week object
        week.days.push({
          id: trainingDate.id,
          group: trainingDate.group,
          date: date.toLocaleDateString(),
          participants: trainingDate.participants || []
        });
      });

      res.render('schedule', { months, monthNames, weekNames });
    });
  });

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const daysSinceFirstDayOfYear = (date - firstDayOfYear) / (1000 * 60 * 60 * 24);
    return Math.floor((daysSinceFirstDayOfYear + firstDayOfYear.getDay()) / 7) + 1;
}

function translateMonthToBulgarian(monthName) {
    const translationMap = {
        'January': 'Януари',
        'February': 'Февруари',
        'March': 'Март',
        'April': 'Април',
        'May': 'Май',
        'June': 'Юни',
        'July': 'Юли',
        'August': 'Август',
        'September': 'Септември',
        'October': 'Октомври',
        'November': 'Ноември',
        'December': 'Декември'
    };

    return translationMap[monthName];
}

module.exports = router;