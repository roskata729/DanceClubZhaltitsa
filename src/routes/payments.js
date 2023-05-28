const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn, isAdministrator } = require('../lib/auth');

router.get('/', isLoggedIn, async (req, res) => {
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const group_id = req.user.user_age < 18 ? 1 : 2;
    const futureDates = await pool.query('SELECT id,date FROM trainings WHERE date >= ? AND group_id = ?', [todayDate, group_id]);
    res.render('payments/payments', { futureDates : futureDates });
  });
  
router.post('/add', isLoggedIn, async (req, res) => {
    //const { training_date_id } = req.body;
    const selectedTrainingDate = req.body.training_date;
    const trainingDate = new Date(selectedTrainingDate);
    trainingDate.setDate(trainingDate.getDate() + 1);
    const trainingDateISOString = trainingDate.toISOString().slice(0, 10);

    const [training] = await pool.query('SELECT paid_by FROM trainings WHERE date = ?', [trainingDateISOString]);
    const paidByArray = training ? JSON.parse(training.paid_by || '[]') : [];
    if(paidByArray.includes(req.user.id)){
        req.flash('message', 'Вече сте платили за тази тренировка');
        return res.redirect('/payments');
    }
    paidByArray.push(req.user.id);
    const updatedTraining = {
        paid_by: JSON.stringify(paidByArray)
    };
    await pool.query('UPDATE trainings SET ? WHERE date = ?', [updatedTraining, trainingDateISOString]);
    req.flash('hooray', 'Плащането беше отразено успешно');
    res.redirect('/payments');
});

router.post('/membership', isLoggedIn, async (req, res) => {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      endOfMonth.setHours(23, 59, 59, 999);
      const startDateString = startOfMonth.toISOString().slice(0, 10);
      const endDateString = endOfMonth.toISOString().slice(0, 10);

      const userId = req.user.id;
      const group_id = req.user.user_age < 18 ? 1 : 2;

      const trainings = await pool.query('SELECT id, paid_by FROM trainings WHERE date >= ? AND date <= ? AND group_id = ?', [startDateString, endDateString, group_id]);
      const trainingsArr = Array.isArray(trainings) ? trainings : [trainings];

      for (const training of trainingsArr) {
        const paidByArray = JSON.parse(training.paid_by) || [];
        if (!paidByArray.includes(userId)) {
          paidByArray.push(userId);
          const updatedTraining = {
            paid_by: JSON.stringify(paidByArray)
          };
          await pool.query('UPDATE trainings SET ? WHERE id = ?', [updatedTraining, training.id]);
        }
      }
  
      req.flash('hooray', 'Месечната карта беше активирана успешно');
      res.redirect('/payments');
    } catch (err) {
      req.flash('message', 'Възникна грешка при активиране на месечната карта');
      res.redirect('/');
    }
});

module.exports = router;