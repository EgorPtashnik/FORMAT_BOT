const DBHelper = require('./dbHelper.js');
const CONFIG = require('./config.js');

const getKeyboardForUser = async (db, userId, date = new Date().toDateString()) => {
    return new Promise((resolve) => {
        if (CONFIG.MANAGERS.find(manager_id => userId === manager_id)) {
            resolve(getDefaultKeyboard(true));
        } else {
            DBHelper.checkExistingRecord(db, userId, date).then(record => {
                const keyboard = [];

if (!record) {
                    // Не отмечался сегодня или уже отметил уход - показываем кнопку прихода
                    keyboard.push([{ text: "✅ Приход" }]);
                } else {
                    keyboard.push([{ text: "Вы уже отмечались сегодня" }]);
                }
                resolve({
                    reply_markup: {
                        keyboard,
                        resize_keyboard:true,
                        one_time_keyboard: false
                    }
                });
            }).catch(() => {
				console.log("ERROR2");
                resolve(getDefaultKeyboard());
            });
        }
    });
};

const getDefaultKeyboard = (isManager = false) => {
    const keyboard = [];
    if (isManager) {
        keyboard.push(
            [{ text: "📈 Отчет за сегодня" }]
        );
    } else {
        keyboard.push(
            [{ text: "✅ Приход" }]
        );
    }
    return {
        reply_markup: {
            keyboard,
            resize_keyboard: true,
            one_time_keyboard: false
        }
    }
};

module.exports = {
    getKeyboardForUser,
    getDefaultKeyboard
};