# Client Side Code Adjustments

The following files are the only that are required to be adjusted for the client side of the app:

* index.html
* main.js (For some cases)
* teamInfo.html (optional)

Each page has commented instructions explaining how to adjust them. The same comments will be here, so that you can delete them from the files to avoid clutter.

You can also look at the code for the 2020FRCScouting app as an example. 

**NOTE: In Previous versions editing ranking.html was required. No edits to ranking.html are necessary anymore**

### Title 

Change the title tag of each page. Go through each .html page (excluding 404.html and header.html) and fill in the year and type of competition, FRC or FTC, for the title tag at the top of the file:

	<title>YEAR TYPE Match Scouting</title>



## Index.html
**Set up the server side code for data.js BEFORE adjusting this page**

This page is where the scouting form exists. 

Some notes for creating the inputs for this page. 

 1. Follow the Instructions for setting up the back-end data.js first!

2. To make this page look nice, it is recommended that you have some knowledge in using bootstrap, especially its row and column features and its ability to make a card. Info on how to use Bootstrap can be found through their documenatation: https://getbootstrap.com/docs/4.0/getting-started/introduction/ by going to the "Components" tab. Try making a seperate html document and playing with bootstrap until you feel comfortable

3. For each location you want to retrieve an input from, the tag must have the class "**data**" as one of its classes and it must have an ID which matches the storage path on the empty match data  object created in the back-end data.js, with "-" seperating each key. It should look like this: "**gameperiod-task**". So for example, if your match data object looks like this:


		gameplay:{
		    auto: {
		        "line": 0,
		        ...
		    },
		    teleop: {
		        "jumps": 0,
		        ...
		    }, 
		    ...    
		}

 Then the ID for whatever input you are using for keeping track of the 
line crossing in auto has to be "**auto-line**" and the ID for whatever you are 
using for keeping track of the jumps in teleop has to be "**teleop-jumps**".

4. The code in main.js is capable of retrieving and reseting data from checkboxes and incrementation/decrementation choices by default. If you need to create a different form of input, follow the instructions of main.js to retrieve and reset the values, and **MAKE SURE** to include the class and ID described in Note 2 above for your new input

5. **Sample HTML**:

    For a checkbox - Note how the input tag has a class of "**data**" and its ID is the general case as an example. Also, that the label has a "`for`" attribute which MUST match the ID of the input:

        <div class = "card">
            <div class="card-body">
                    <div class="form-check">
                        
                        <input class="form-check-input data" type="checkbox" id = "gameperiod-task">

                        <label class="form-check-label" for="gameperiod-task">
                            Task 
                        </label>

                    </div>
                </div>
            </div>
        </div>
    
    For an incrementation/decrementation box - Note how the tag where we plan to retrieve the data has a class of "**data**" and its ID is the general case as an example.

    Also, the + and - buttons have a "`for`" attribute which MUST correspond to the ID of the tag where we retrive data and the + and - button **MUST** have the class "`change-btn`" as well as either the class "`decrement`" or "`increment`" respectively. These attributes and classes are used in the code within main.js for changing the value of the tag where we retrieve data. 

        <div class=" d-flex justify-content-center mt-2">
            <div class="input-group mt-3 w-75">

                <div class="input-group-prepend">
                    <button for="gameperiod-task" class="btn btn-outline-secondary change-btn decrement" type="button">-</button>
                </div>

                <div id="gameperiod-task" class="form-control data">
                    0
                </div>

                <div class="input-group-append">
                    <button for="gameperiod-task" class="btn btn-outline-secondary change-btn increment" type="button">+</button>
                </div>

            </div>
        </div>
        
## Main.js

### Inside `getValue()`:

If you have added an input to index.html that is not a check box or just a numerical value, like those in the incrementation/decrementation boxes, then add an else if statement that checks to see if the current object is one of the ones you've added, and then return the input value.

You might also have to add code that triggers the recordTimestamp() method
when your new input gets updated if none of the existing triggers do so already. 
                    
For example, if you added sliders for the user to use, make sure they all have a common class such as "`form-slider`", and then you can add an else if stament as such: 

**The Current Code:**

	if (dataEntry.hasClass("form-check-input"))  // Records check box data
       temp[path[i]] = dataEntry.is(':checked') ? 1 : 0;

	else
       temp[path[i]] = parseInt(dataEntry.text().trim()); // Records numerical data
  
**The New Code (For the above example):**

	if (dataEntry.hasClass("form-check-input"))  // Records check box data
		temp[path[i]] = dataEntry.is(':checked') ? 1 : 0;

	else if( dataEntry.hasClass("form-slider") )
		temp[path[i]] = dataEntry.val(); // Or however the value is retrieved

	else
		temp[path[i]] = parseInt(dataEntry.text().trim()); // Records numerical data

### Inside `reset()`:

If you have added an input to index.html that is not a check box or just a numerical value, like those in the incrementation/decrementation boxes, then add some way of reseting each of those inputs to a default state. 

For example, if you added sliders for the user to use, make sure they all have a common class such as "`form-slider`", and then you can add the following loop to reset them:
        
    $(".form-slider").each(function (index, obj) {
            $(this).val(0); // Or however the input is reset
    })

## TeamInfo.Html (Optional)

This page currently display's a team progression in an event for their Auto Score, Teleop Score, Endgame Score, and Total Score. If you would like to see a progression over time for more tasks, just copy the following html and paste it after the last graph (where the comment is located in the file), and replace the ID and header with the corresponding path to the task.

            <div class="col-md-5 mt-3">
                <div class="card text-center ">
                    <div class="card-header">
                        Gameperiod Task
                    </div>
                    <div class="card-body">
                        <canvas id="gameperiod-task" width="100%" height="100%"></canvas>
                    </div>
                </div>
            </div>
                