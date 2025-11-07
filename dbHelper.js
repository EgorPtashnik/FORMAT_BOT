const { format } = require('date-fns');

class DBHelper {
    static setupDatabase(db) {
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                date TEXT,
                check_in_time TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
        });
    };

    static checkExistingRecord(db, userId, date) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM attendance WHERE user_id = ? AND date = ?`,
                [userId, date],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    };

    static saveCheckIn(db, userId, username, firstName, lastName, date, time) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO attendance (user_id, username, first_name, last_name, date, check_in_time) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, username, firstName, lastName, date, time],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    };

    static generateDailyReport(db) {
        return new Promise((resolve, reject) => {
            const today = new Date().toDateString();
            db.all(
                `SELECT * FROM attendance WHERE date = ? ORDER BY check_in_time`,
                [today],
                (err, rows) => {
                    if (err) reject(err);

                    const formattedDate = format(today, 'dd.MM.yyyy');
                    if (rows.length === 0) {
                        resolve(`📊 Отчет за ${formattedDate}\n\nНет данных за этот день`);
                        return;
                    }

                    let report = `📈 Отчет за ${formattedDate}\n\n`;
                    report+= '============================\n';
                    let totalEmployees = rows.length;
                    
                    rows.forEach((row, index) => {
                        report += `${index + 1}. ${row.first_name} ${row.last_name || ''}\n`;
                        report += `   ✅ Приход: ${row.check_in_time}\n`;
                        report += `============================\n`;
                    });
                    report += `---\n`;
                    report += `👥 Всего сотрудников: ${totalEmployees}\n`;
                    resolve(report);
                }
            );
        });
    };
};

module.exports = DBHelper;