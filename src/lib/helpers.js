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

module.exports = helpers;