const cron = require('node-cron');
const Keyboard = require('./keyboard.js');
const CONFIG = require('./config.js');
const { format } = require('date-fns');

const initialize = (db, bot) => {
    // 07:35 утра с Пн по Сб
    cron.schedule(CONFIG.SCHEDULER['07:30'].CHECKTIME, () => {
        console.log('07:35 - Проверка');

        checkAttendance(db, bot, CONFIG.SCHEDULER['07:30'].USERS);
    }, {
        timezone: CONFIG.SCHEDULER.TIMEZONE
    });
    // 08:00 утра с Пн по Сб
    cron.schedule(CONFIG.SCHEDULER['08:00'].CHECKTIME, () => {
        console.log('08:05 - Проверка');

        checkAttendance(db, bot, CONFIG.SCHEDULER['08:00'].USERS);
    }, {
        timezone: CONFIG.SCHEDULER.TIMEZONE
    });
    // 09:00 утра с Пн по Сб
    cron.schedule(CONFIG.SCHEDULER['09:00'].CHECKTIME, () => {
        console.log('09:05 - Проверка');

        checkAttendance(db, bot, CONFIG.SCHEDULER['09:00'].USERS);
    }, {
        timezone: CONFIG.SCHEDULER.TIMEZONE
    });
	 // 10:00 утра Вс
    cron.schedule(CONFIG.SCHEDULER['10:00'].CHECKTIME, () => {
        console.log('10:05 - Проверка');

        checkAttendance(db, bot, CONFIG.SCHEDULER['10:00'].USERS);
    }, {
        timezone: CONFIG.SCHEDULER.TIMEZONE
    });
};

const checkAttendance = (db, bot, users) => {
    const inBlock = `(${users.map(_ => '?').join(',')})`;
    const args = users.map(item => item.ID);
    const today = new Date().toDateString();
    const formattedDate = format(today, 'dd.MM.yyyy');
    const currentTime = new Date().toTimeString().split(' ')[0];
    const keyboard = Keyboard.getDefaultKeyboard(true);
    args.push(today);
    db.all(
        `SELECT user_id, username FROM attendance WHERE user_id IN ${inBlock} AND date = ? ORDER BY check_in_time`,
        args,
        (err, rows) => {
            console.log(JSON.stringify({ err, rows }));
            if (err) return;

            let Notification = '';

            if (rows.length === users.length) {
                return;
            } else if (rows.length === 0) {
                Notification = users.reduce((res,item) => {
                    if (!res) {
                        res += `🚨 **ОПОЗДАНИЯ на ${formattedDate}** (проверка в ${currentTime})\n\n`
                    }
                    res += `${item.USERNAME}\n`;
                    return res;
                }, '');
            } else  {
                Notification = users.reduce((res,user) => {
                    if (!res) {
                        res += `🚨 **ОПОЗДАНИЯ на ${formattedDate}** (проверка в ${currentTime})\n\n`
                    }
                    if (!rows.find(item => item.user_id === user.ID)) {
                        res += `${user.USERNAME}\n`;
                    }
                    return res;
                }, '');
            }
			CONFIG.MANAGERS.forEach(manager_id => {
				bot.sendMessage(manager_id, Notification, keyboard);
			});
        }
    );
};

module.exports = {
    initialize
};