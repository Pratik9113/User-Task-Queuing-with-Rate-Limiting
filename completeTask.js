const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'task-log.txt');

const completeTask = async (userId) => {
  const logEntry = `${userId}-task completed at-${Date.now()}\n`;
  
  console.log(logEntry);

  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Error logging task:', err);
    } else {
      console.log('Task logged successfully');
    }
  });
};

module.exports = {
  completeTask,
};
