Kolene Lamizana

Running the application:
  unzip the zip file and keep every folder and file in the same directory.
  open node.js and go to the directory where the folders and files are, using: cd
  write in the command 'npm install'
  //then open another terminal to run mongod using 'mongod --dbpath=a4'
  //	(a4) being the database folder
  //then run database initializer using 'node database-initializer.js'
  then 'node server.js' which will start the Server
  Once the server is started go to your browser and run this url: http://localhost:3000/

Design:
  - Using mongoose schemas for User and Order
  - I used client.js only for the privacy settings, all the other pages that call gets or posts use form()

Build status:

- Need to refresh the page for (your profile is currently private/public) to update.

The LOGIN - 
- A user can register, when they register their name and password get saved into the Users collection and can be used to access their account.
- Each user has a privacy attribute - they can either be private or public
	- If they are private they won't show up on the 'users' page that displays each users' profile.
	- They can change their privacy setting in their profile
- When logged in a User can make an order to a restaurant. The id of that order and its content will be saved on the user's profile. And is accessible to other users only if the user is public.
	- That order is send and saved to the Order collection when it's passed.
- All these information are persitent
	- They are still here after refreshing the page OR restarting the server
Things I don't know that seem important / to test -
	- In my app, a user logs in, and needs to be logged out for another user to be able to log in.	
		- I do not know if it's possible with local host to have more than 1 session running (and so have more than 1 user logged in at the same time)
