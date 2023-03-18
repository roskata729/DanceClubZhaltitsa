const bcrypt = require('bcryptjs');
const pool = require('../database');

const helpers = {};

helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const encryptedPass = await bcrypt.hash(password, salt);
    return encryptedPass;
}

helpers.matchPassword = async (password, savedPassword) => {
    try {
        return await bcrypt.compare(password, savedPassword);
    } catch (e) {
        console.log(e);
    }
}

helpers.calculateAge = async (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
    }
    return age;
}

helpers.removeParticipant = async (eventId, userId) => {
    const event = await pool.query('SELECT * FROM events WHERE ID = ?', [eventId]);
    const participants = JSON.parse(event[0].participants);
    const updatedParticipants = participants.filter(participant => participant.user_id !== userId);
    await pool.query('UPDATE events SET participants = ? WHERE ID = ?', [JSON.stringify(updatedParticipants), eventId]);
}

helpers.getFutureDates = async () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    if (month < 10) {
        month = '0' + month;
    }

    if (day < 10) {
        day = '0' + day;
    }

    return `${year}-${month}-${day}`;
}

helpers.saveTrainingsInDatabase = async () => {
    // Generate training dates for the past 6 months
    const end = new Date(); // end at today
    const start = new Date(end.getFullYear(), end.getMonth() - 6, 1); // start 6 months ago (on the 1st day of the month)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const group1Days = [days.indexOf('Monday'), days.indexOf('Thursday')]; // Group 1 trainings on Monday and Thursday
    const group2Days = [days.indexOf('Tuesday'), days.indexOf('Friday')]; // Group 2 trainings on Tuesday and Friday
    const trainingDates = [];

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    const date = d.toISOString().slice(0, 10); // format date as YYYY-MM-DD
    if (group1Days.includes(d.getDay())) {
        trainingDates.push({ group: 1, date });
    } else if (group2Days.includes(d.getDay())) {
        trainingDates.push({ group: 2, date });
    }
    }

    // Insert training dates into database
    const sql = 'INSERT INTO trainings (group_id, date) VALUES ?';
    const values = trainingDates.map(({ group, date }) => [group, date]);

    pool.query(sql, [values], (error, results) => {
    if (error) throw error;
        console.log(`Inserted ${results.affectedRows} rows into trainings table.`);
    });
}

// Helper function to get the week number for a given date
helpers.getWeekNumber = async (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const daysSinceFirstDayOfYear = (date - firstDayOfYear) / (1000 * 60 * 60 * 24);
    return Math.floor((daysSinceFirstDayOfYear + firstDayOfYear.getDay()) / 7) + 1;
}  

module.exports = helpers;