/*
Objective: get data from active Google Sheet containing player info and this week's tennis 
schedule.  Send texts to each person that is playing the day before their match, letting them
know when they are scheduled to play. 

Deployed to run every Friday, as games are on Saturday.

README.md contains images displaying format spreadsheet should be in.
*/

// ** SET equal to the email you want the weekly results emailed to, as a string
let yourEmail; 

let carriers = [];
carriers["at&t"] = "@txt.att.net";
carriers["boost mobile"] = "@sms.myboostmobile.com";
carriers["c-spire"] = "@cspire1.com";
carriers["consumer cellular"] = "@mailmymobile.net";
carriers["cricket"] = "@sms.cricketwireless.net";
carriers["google fi"] = "@msg.fi.google.com";
carriers["h20 wireless"] = "@txt.att.net";
carriers["metro by t-mobile"] = "@mymetropcs.com";
carriers["mint mobile"] = "@tmomail.net";
carriers["page plus"] = "@vtext.com";
carriers["pure talk"] = "@txt.att.net";
carriers["republic wireless"] = "@text.republicwireless.com";
carriers["simple mobile"] = "@smtext.com";
carriers["t-mobile"] = "@tmomail.net";
carriers["tello"] = "@tmomail.net";
carriers["ting"] = "@message.ting.com";
carriers["tracfone"] = "@mmst5.tracfone.com";
carriers["twigby"] = "@vtext.com";
carriers["ultra mobile"] = "@mailmymobile.net";
carriers["u.s. cellular"] = "@email.uscc.net";
carriers["u.s. mobile"] = "@vtext.com";
carriers["verizon"] = "@vtext.com";
carriers["visible"] = "@vtext.com";
carriers["xfinity mobile"] = "@vtext.com";

// initial scan for player collection 
let playerCollection = getCurrentPlayers();

// update the collection of players by re-scanning the google spreadsheet 
function updatePlayerCollection() {
    playerCollection = getCurrentPlayers();
}

// figures out who's playinig and sends out texts to those w/ a game tomorrow  
function push() {
  updatePlayerCollection(); 
  let failedMessages = [];
  let timeCollection = timeList(failedMessages); 
  // attempt to send out texts given collected data, accumulates any errors failedMessages
  timeCollection.forEach(playerAndTime => {
    sendText(playerAndTime, failedMessages, successMessages);
  });
  // send report message each week 
  if(failedMessages.length == 0){
    console.log("success email sent on " + Date.now());
    MailApp.sendEmail(yourEmail, "Tennis League: Messages Successfully Sent", "All messages were sent.");
  }
  else {
    /**
     * Two types of errors can be found in this report: 
     * 1) There was an issue getting data from a match cell in format NAME1 & NAME2.  There is a chance not all names were collected.
     * 2) There was an issure sending a message to a specific person(s) make sure all of their info is correct for next week!
     */
    console.log("failure email sent on " + new Date());
    MailApp.sendEmail(yourEmail, "Tennis League: Message Failure", "The following issues were encountered: \n" + failedMessages.reduce((acc, message) => acc + message + "\n\n"));
  }
}

// returns array of objects such that every object contains:
// - name of player playing a game tomorrow 
// - the time they're playing 
function timeList(failedMessages) {
  let timeCollection = [];
  const schedule  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Schedule');
  let dataRange = schedule.getRange("A:AH"); // ** IF YOU EXTEND BEYOND COLUMN AH, THE END VALUE HERE CAN BE UPDATED TO REFLECT THAT
  const data = dataRange.getValues(); 
  let colNum = getColumnNum(data); // get column location for this week, note starts at 0 not 1
  let column = getColumn(data, colNum);
  let curTime = null;
  for(let row = 1; row < column.length; row += 1) { // rows start at 0, this starts at 1 to skip the 0th row, which has the times in it 
    let cell = column[row]; // for each cell in this row 
    if(/\d+/.test(cell)) { // if it contains 1 or more digits, it's a time.  update curTime
      curTime = cell;
    }
    else if(cell) { // cell is not empty, must be names 
      try {
        let names = cell.split('&');
        names.forEach(person => timeCollection.push({name:person.trim(), time:curTime}));
      } catch (e) {
        let failMessage = "Error on step splitting cells with &, not all names might have been properly retrieved for this week.  Check formatting.  We found + " + e;
        console.log(failMessage);
        failedMessages.push(failMessage);
      }
    }
  }
  return timeCollection;
}

// returns an array of all the cells in the given column number, where columns start at 0
function getColumn(data, colNum) {
  let column = [];
  for(let row = 0; row < data.length; row += 1) {
    column.push(data[row][colNum]);
  }
  return column;
}

// returns the column number that this week's schedule is stored in 
function getColumnNum(data) {
  let colNum = 0;
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  for(item of data[0]) {
    if(sameDate(tomorrow, item)) {
      break;
    }
    else {
      colNum += 1;
    }
  }
  return colNum;
}

// determines whether two dates are the same based on day, month, and year
function sameDate(first, second) {
  if(first == "" || second == "") {
    return false;
  }
  return first.getFullYear() == second.getFullYear() && first.getMonth() == second.getMonth() && first.getDay() == second.getDay();
}

// sends a text to the given player, letting them know that they're playing tomorrow at the given time
// if error encountered, stores info about it in failedMessages accumulator
function sendText(playerAndTime, failedMessages, successMessages) {
  let player = playerCollection[playerAndTime.name];
  let message = "This is a reminder that you are scheduled to play a tennis game tomorrow at " + formatTime(playerAndTime.time).trim();
  try { 
    MailApp.sendEmail(player.cell + carriers[player.carrier], "Tennis League", message);
      console.log("Send text to " + player.name + " for " + formatTime(playerAndTime.time));
  } catch(e) {
    failedMessages.push("FAILED MESSAGE: Name: " + player.name + ", Message: " +  message + ", " + e + "\n");
  }
}

// formats a date as String in US time format 
function formatTime(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let suffix = "AM";
  if(hours >= 13) {
    hours -= 12;
    suffix = "PM";
  }
  if(minutes < 10) {
    minutes = "0" + minutes;
  } 
  return (hours + ":" + minutes + " " + suffix).trim();
}

// returns an array of objects representing the people that are playing tomorrow 
// s/t each contains the following data
// - person's name 
// - phone number 
// - carrier 
function getCurrentPlayers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Players');
  let playerCollection = [];
  const dataRange = sheet.getRange("A:C"); // get name, cell, carrier data from sheet
  const data = dataRange.getValues(); // extract data from the rows 
  // for every row in the A2-C section of the sheet (aka for each player's info)
  for(let i = 1; i < data.length; i += 1) {
    let row = data[i]; // get the row
    if(!row[0]) { break; }
    let player = {}; // person's data to be built up this iteration
    player.name = row[0].trim(); // add persons name 
    player.cell = row[1]; // add cell number 
    // add person's cell carrier 
    player.carrier = row[2].trim();
    // add player we just created in this iteration to accumulating list 
    playerCollection[player.name] = player;
  }
  return playerCollection;
}
