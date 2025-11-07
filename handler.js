const Keyboard = require('./keyboard.js');
const DBHelper = require('./dbHelper.js');

class Handler {
    static async handleStart(msg, bot, db) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const keyboard = await Keyboard.getKeyboardForUser(db, userId);

        bot.sendMessage(chatId,
            `👋 Добро пожаловать в систему учета рабочего времени!`,
            keyboard
        );
    };

    static async handleCheckIn(msg, db, bot) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const username = msg.from.username || `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
        const firstName = msg.from.first_name || '';
        const lastName = msg.from.last_name || '';
        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0];
        const today = now.toDateString();

        try {
            // Сохраняем в бд
            await DBHelper.saveCheckIn(db, userId, username, firstName, lastName, today, currentTime);

            const keyboard = await Keyboard.getKeyboardForUser(db, userId);

            bot.sendMessage(chatId, 
                `✅ Приход отмечен в ${currentTime}\n🚀 Хорошего рабочего дня!`,
                keyboard
            );


        } catch(err) {
            console.error('Checkin error:', err);
            const keyboard = await Keyboard.getKeyboardForUser(db, userId);
            bot.sendMessage(chatId, '❌ Произошла ошибка при отметке прихода', keyboard);
        }
    };

    static async handleTodayReport(msg, db, bot) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const report = await DBHelper.generateDailyReport(db);
        const keyboard = await Keyboard.getKeyboardForUser(db, userId);
        bot.sendMessage(chatId, report, keyboard);
    };

};

module.exports = Handler;