Kolene Lamizana

Assignment #4

Running the application:
  unzip the zip file and keep every folder and file in the same directory.
  open node.js and go to the directory where the folders and files are, using: cd
  write in the command 'npm install'
  then open another terminal to run mongod using 'mongod --dbpath=a4'
	(a4) being the database folder
  then run database initializer using 'node database-initializer.js'
  then 'node server.js' which will start the Server
  Once the server is started go to your browser and run this url: http://localhost:3000/

Design:
  - Using mongoose schemas for User and Order
  - I used client.js only for the privacy settings, all the other pages that call gets or posts use form()

Build status:

- Need to refresh the page for (your profile is currently private/public) to update.
- otherwise pretty good.
