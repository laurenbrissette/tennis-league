# tennis-league
## Description 
This is a piece of software deisgned to automate sending text messages to players in a tennis league the day before their matches, letting them know that they have a game the following day, and what time.  I created this for a local league in Albany, NY to make the admin's life a little easier, but as long as the schedule is formatted correctly, it could be used for any group of people on a schedule interested in receiving text updates.

Throughout this project, the greatest challenge was balancing simplicity and usefulness.  I wanted the script to be fairly simple to come back to, for myself to modify, for my non-tech client to follow, and for flexibility with other types of schedules in the future.  At the same time, I wanted some specific behaviors, such as be able to understand what exactly was being sent out, which I implemented via an error/success report to a given email upon each run.  

My active version of this project is currently running as an extension on a Google Sheet as AppsScript.  For those unfamiliar, this is essentially JavaScript compatible with GSuite.

## Spreadsheet Formatting 

## Install and Run
To add AppsScript to your sheet: 
  (1) Open the Google Sheet
  (2) Navigate to "Extensions"
  (3) Under "Extensions", select "Apps Script" 
  (4) In the file, paste the code from this project

To edit the script for your project: 
  (5) Set variable at the top "yourEmail" to be equal to the email address, in quotes, that you want to receive the success/error report each run.  
  (6) Edit the messages in function push and function sendTexts to match the context of your schedule.  Currently, they address the tennis league and tennis games.

To automate run:
  (7) Navigate to the clock symbol on the far left guidebar, select "Triggers"
  (8) Add Trigger -> Event Type 
          Choose which function to run: push
          Choose which deployment should run: Head
          Select event source: time driven
      Time and failure notification are personal preference.  Note, the program responds only to tomorrow's date on the schedule.
      My program is set to run every Friday, as the games are always Saturdays!

