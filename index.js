// Импорты функций
const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();

const CONFIG = require('./config.js');
const DBHelper = require('./dbHelper.js');
const Handler = require('./handler.js');
const Scheduler = require('./scheduler.js');

// Создание\подключение к базе данных (файл attendance.sqlite)
const db = new sqlite3.Database('./attendance.sqlite');

DBHelper.setupDatabase(db);

const bot = new TelegramBot(CONFIG.BOT_TOKEN, { polling: true });

bot.activeUsers = [];

bot.onText(/\/start/, (msg) => Handler.handleStart(msg, bot, db));

bot.on('message', msg => {
    const text = msg.text;
    if (!text) return;

    switch(text) {
        case "✅ Приход": Handler.handleCheckIn(msg, db, bot); break;
        case "📈 Отчет за сегодня": Handler.handleTodayReport(msg, db, bot); break;
    }
});

Scheduler.initialize(db, bot);
console.log("Бот запущен...");