# Server Side Code Adjustments

The following functions within **data.js** are required to be adjusted for the server side of the app, no other files or functions have to be edited.

* `getDataPointValues()`
* `getDependentData()`

Also an Environmental Variable for The Blue Alliance Authkey has to be set up. 

Each function listed above has commented instructions explaining how to adjust them. The same comments will be here, so that you can delete them from the file to avoid clutter.

You can also look at the code for the 2020FRCScouting app as an example. 


## Blue Alliance Auth Key

Go to the Blue Alliance Account page, https://www.thebluealliance.com/account. Create an account if you don't already have one. Then on the page, scroll to the bottom to "Read API Keys" input the App's name as the description, and then select "Add New Key". With the new key type the following into the terminal of your project: 

	firebase functions:config:set bluealliance.authkey="REPLACE_WITH_THE_TBA_API_KEY"
	
For more info on firebase environmental variables, go here: https://firebase.google.com/docs/functions/config-env


## GetDataPointValues()

Insert each task and the corresponding point value for each gameperiod of the game here. 

You can insert as many tasks as necessary. Try to keep tasks one word, if more than one word has to be used to describe a task, seperate each word with an underscore. For example, for wanting to record if a team didn't show up, you would use "no_show". **KEEP TASKS LOWERCASE**


 **DO NOT INCLUDE** "`score`" attributes or "`totalScore`"

Insert the corresponding point value for each task as described in the game manual. You may want to record tasks that don't actually give a team points, just set the value for these to 0. For example, the content inside the "performance" map is likely all zeros, data such as "defense" or "no_show".

Example (Made up point values): 

	return {
	    auto: {
	        "line" : 5,
	        ...
	    },
	    teleop: {
	        "jumps": 2,
	        ...
	    },
	    performance: {
	        "defense": 0,
			"no_show": 0,
	        ...
	    },
	    ...
	}
	
Notes: 
   
If another gameperiod is necessary to be added, that is fine.  Adding a "`score`" attribute to the new gameperiod is not needed.

If after an event you decide to add more tasks or remove some, that should work compeletly fine for your next event, but may cause issues trying to view data from previous events. 

The tasks placed here must also be used for IDs in index.html. More info is explained there

## getDependentData()

Insert each dependent task and its corresponding gameperiod here. 

In a game, there are sometime tasks only one team can accomplish. These tasks are referred to in this code as "dependent". It is important to be aware of these tasks for gameplay predictions, since we can't add it to each teams score, because only one team can do it. The work around for this is to only add it to the score of the team in the alliance who accomplishes the task the most frequently. 

Here you only need to insert gameperiods which contains dependent tasks, and inside those gameperiods, just insert the dependent tasks themselves, and set their value to 0. 

For example, this is the full code for this method for the 2020 Infinite Recharge game:
	
	 return {
	    "teleop": { // This was the only gameperiod with dependent tasks
	        "rotation": 0, // These were the only dependent task
	        "position": 0
	    }
	}