const chalk = require('chalk');
const fs = require('fs');
const config = require('./config.js');

const zeroPad = (num, places) => {
  const numZeroes = places - num.toString().length + 1;
  if (numZeroes > 0) {
    return Array(+numZeroes).join("0") + num;
  }
  return num
}

module.exports = {
  /* Logging types */
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",

  /* Logger itself */
  log: function(type, messageType, ...message) {
    /* Current date and time */
    let currentdate = new Date(); 
    let date = zeroPad(currentdate.getDate(), 2) + "-" + zeroPad((currentdate.getMonth()+1), 2)  + "-" + currentdate.getFullYear();
    let time = zeroPad(currentdate.getHours(), 2) + ":" + zeroPad(currentdate.getMinutes(), 2) + ":" + zeroPad(currentdate.getSeconds(), 2) + "." + zeroPad(currentdate.getMilliseconds(), 3); 
    
    /* Colorify log type */
    let typePlain;
    if(type == this.WARN) {
      type = chalk.hex("#FFBE4B")(`[${this.WARN}] `);
      typePlain = `[${this.WARN}] `;
    } else if(type == this.ERROR) {
      type = chalk.hex("#FF4B4B")(`[${this.ERROR}]`);
      typePlain = `[${this.ERROR}]`;
    } else {
      type = chalk.hex("#8D9CA1")(`[${this.INFO}] `);
      typePlain = `[${this.INFO}] `;
    }
    
    /* Message Type Color */
    if(messageType == "General") {
      messageTypeColor = "#A49CCD";
    } else {
      messageTypeColor = "#8D9CA1";
    }

    /* Output to console */
    console.log(`${chalk.gray(`[${date} ${time}]`)} ${type} ${chalk.hex(messageTypeColor)(`[${messageType}]`)} ${message}`);

    if(config.saveLogs) {
      /* Create logs directory if not exist */
      if (!fs.existsSync('logs')){
        fs.mkdirSync('logs');
      }

      /* Different files for different logs. And all */
      var allLogger = fs.createWriteStream(`logs/log_${date}.txt`, { flags: 'a' });
      var errorLogger = fs.createWriteStream(`logs/error_log_${date}.txt`, { flags: 'a' });
      var warnLogger = fs.createWriteStream(`logs/warn_log_${date}.txt`, { flags: 'a' });
      
      /* Save log line to file */
      allLogger.write(`[${date} ${time}] ${typePlain} [${messageType}] ${message}\n`);
      if(typePlain == `[${this.ERROR}]`) { errorLogger.write(`[${date} ${time}] ${typePlain} [${messageType}] ${message}\n`); }
      if(typePlain == `[${this.WARN}] `) { warnLogger.write(`[${date} ${time}] ${typePlain} [${messageType}] ${message}\n`); }
    }
  }
}