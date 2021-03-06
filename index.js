
const schedule = require('node-schedule');
const Discord = require('discord.js');
const moment = require('moment-timezone');
const _ = require('underscore');

const client = new Discord.Client();

const swChannelId = '218823335738343424';
const testChannelId = '173524646690422784';

const charLookupRE = /!char\s+([A-Za-z0-9_-]+)/;
const defaultChannelId = swChannelId;

const activities = ['Cantina battles', 'Light side battles', 'Galactic wars', 'Hard mode battles', 'Challenges', 'Dark-side battles', 'PVP battles'];

var reminderJob = null;

function linkChar(message) {
  var charMatch = message.content.match(charLookupRE);
  message.reply('https://swgoh.gg/characters/' + charMatch[1] + '/');
}

function linkMeta(message) {
  message.reply('https://swgoh.gg/meta-report/');
}

function postReminders() {
  var channel = client.channels.get(defaultChannelId);
  var day = moment().tz("America/Denver").day();
  switch (day) {
    case 0: // Sunday
      channel.sendMessage("REMINDER: Save your galactic wars tomorrow to maximize guild currency!");
      break;
    case 1:
      channel.sendMessage("REMINDER: Save your galactic wars today and tomorrow to maximize guild currency!");
      break;
    case 5:
      channel.sendMessage("REMINDER: Wait on your PVP battles until guild reset tomorrow to maximize guild currency!");
      break;
    default: break;
  }
  channel.sendMessage(activities[(day) % 7] + ' are the guild activity for today.');
}

function getTimeToReset(message) {
  var now = moment().tz("America/Denver");
  var then = moment().tz("America/Denver").startOf('day').hour(19).minute(30);
  message.reply(moment.utc(moment(then.diff(now))).format("HH:mm:ss"));
}

function getServerTime(message) {
  var d = new Date();
  message.reply(d.toString());
}

function getGuildActivity(message) {
  var now = moment().tz("America/Denver");
  var then = moment().tz("America/Denver").startOf('day').hour(19).minute(30);
  var day = now.day();
  var isAfter = now.isAfter(then);

  day = day - (isAfter) ? 0 : 1;
  message.reply(activities[(day % 7)] + ' are the guild activity as of now.');
}

function printHelp(message) {
  message.reply('Commands:\n !meta - show the current meta characters\n !char <char-name> - lookup a character\n !reset - print time to reset\n !activity - print the activity as of now\n !help - print this message');
}

var commandMap = {
  '!meta' : linkMeta,
  '!char' : linkChar,
  '!reset' : getTimeToReset,
  '!activity' : getGuildActivity,
  '!servertime' : getServerTime,
  '!help' : printHelp
};

client.on('ready', () => {
  console.log('I am ready!');

  if (reminderJob) {
    reminderJob.cancel();
  }

  var rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = new schedule.Range(0, 6);
  rule.hour = 1;
  rule.minute = 30;

  reminderJob = schedule.scheduleJob(rule, postReminders);
});

client.on('message', message => {
  var command = message.content.split(' ')[0];
  if (command.startsWith('!')) {
    if (commandMap[command]) {
      commandMap[command](message);
    }
  }
});

client.login('MjQyNDI5NDI1NzQ2OTY4NTc3.CvgVAg.ihSQRnpK-eVIfebwoAbC1Iajo8g');
