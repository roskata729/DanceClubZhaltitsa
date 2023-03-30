const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdministrator } = require('../lib/auth');
const pool = require('../database');
const helpers = require('../lib/helpers');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/schedule', isLoggedIn, (req, res) => {
  const sql = 'SELECT id, group_id, date, participants_ids, paid_by FROM trainings';
  pool.query(sql, (error, results) => {
    if (error) throw error;

    const trainingDates = results.map(({ id, group_id, date, participants_ids, paid_by }) => ({
      id,
      group: group_id,
      date: new Date(date).getTime(),
      participants_ids: participants_ids ? participants_ids : [],
      paid_by: paid_by ? JSON.parse(paid_by) : [],
    }));

    trainingDates.sort((a, b) => a.date - b.date);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const months = {};
    const weekNames = ["Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота", "Неделя"];

    trainingDates.forEach((trainingDate) => {
      if (req.user.is_admin || trainingDate.paid_by.includes(req.user.id)) {
        const date = new Date(trainingDate.date);
        const month = translateMonthToBulgarian(monthNames[date.getMonth()]);
        const year = date.getFullYear();

        if (!months[year]) {
          months[year] = {};
        }
        if (!months[year][month]) {
          months[year][month] = [];
        }

        const firstDayOfMonth = new Date(year, date.getMonth(), 1);
        const firstWeekOfMonth = getWeekNumber(firstDayOfMonth);
        const weekNumber = getWeekNumber(date);
        const weekIndex = weekNumber - firstWeekOfMonth;
        let week = months[year][month][weekIndex];

        if (!week) {
          week = { days: [] };
          months[year][month][weekIndex] = week;
        }

        const day = date.getDay();
        const daysInWeek = 7;
        const daysToAdd = daysInWeek - week.days.length;
        for (let i = 0; i < daysToAdd; i++) {
          week.days.push({
            id: null,
            group: null,
            date: null,
            participants: []
          });
        }

        const trainingDayIndex = day - 1;
        week.days[trainingDayIndex] = {
          id: trainingDate.id,
          group: trainingDate.group,
          date: date.toLocaleDateString(),
          participants: trainingDate.participants || []
        };
      }
    });

    res.render('schedule', { months, monthNames, weekNames, isAdmin: req.user.is_admin });
  });
});

router.post('/trainings/addparticipant/:ID', isAdministrator, async (req, res) => {
  const { ID } = req.params;
  const { participant_id } = req.body;

  const [training] = await pool.query('SELECT participants_ids FROM trainings WHERE ID = ?', [ID]);
  const participantsIdsArray = JSON.parse(training.participants_ids || '[]');

  if(participantsIdsArray.includes(participant_id)){
    req.flash('message', 'Този клиент вече присъства. Моля изберете друг!');
    return res.redirect('/schedule');
  }
  participantsIdsArray.push(participant_id);

  const updatedTraining = {
    participants_ids: JSON.stringify(participantsIdsArray)
  };

  await pool.query('UPDATE trainings SET ? WHERE ID = ?', [updatedTraining, ID]);
  req.flash('success', 'Присъствието беше отразено успешно');
  res.redirect('/schedule');
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