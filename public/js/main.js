document.addEventListener("DOMContentLoaded", event => {
    hideContent()// Comment this line out when creating index.html. 
    // REMEMBER TO UNCOMMENT WHEN DONE

    // Used for changing values of incrementation/decrementation inputs
    $(".change-btn").on("click", function () {
        console.log("clicked")
        var id = $(this).attr("for");
        var val = parseInt($("#" + id).text());
        if ($(this).hasClass("increment"))
            $("#" + id).text(val + 1);
        else if (val > 0)
            $("#" + id).text(val - 1);
        recordTimestamp($("#" + id))
    })
    $(".data").on("change", function () {
        recordTimestamp($(this))
    })
    setUpEvent();
    $("#submit-btn").on("click", saveData);
    $("#start-clock").on("click", function () {
        $("#main").show();
        $("#timeContainer").css("visibility", "visible")
        $("#start-clock").hide()
        startClock()
    })
})

var timestamps = []

/**
 * Creates timestamp of the data in the given dataentry and adds it to 
 * the timestamps array
 * @param {*} dataEntry - the input field to read from
 */
function recordTimestamp(dataEntry) {
    var timestamp = {
        time: time,
        path: dataEntry.attr('id').split("-"),
        value: getValue(dataEntry)
    }
    timestamps.push(timestamp)
}


/**
 * Sets which event is being scoutted ands sets up matches
 */
function setUpEvent() {
    getCurrentEvent()
        .then((event) => {
            $("#current-event").text($("#current-event").text() + event);
            setUpMatchOptions()
        })
}

/**
 * Sets up each match option for the event
 */
function setUpMatchOptions() {
    getMatches()
        .then((matches) => {
            for (match of matches)
                $("#match-choices").append(getMatchOption(match));

            // Whenever the selected match changes, set up the team options for that match
            $("#match-choices").on("change", function () {
                setUpTeamOptions($("#match-choices option:selected").text());
                hideContent()
            })
        })
}

/**
 * Sets up team options for the given match
 * 
 * @param {String} match - The match number to be scoutted
 */
function setUpTeamOptions(match) {
    getTeamsInMatch(match)
        .then((teams) => {

            //default state
            $("#team-choices").html("<option disabled selected value> -- select an option -- </option>");
            $("#team-choices").removeClass("text-white");
            $("#team-choices").css("background-color", "")

            // add choices
            for (team of teams.blue)
                $("#team-choices").append(getTeamOption(team, "blue"));
            for (team of teams.red)
                $("#team-choices").append(getTeamOption(team, "red"));

            // Resets and reveals the start button when a new team is selected
            $("#team-choices").on("change", function () {
                if ($("option:selected", this).hasClass("blue"))
                    $(this).css("background-color", "blue")
                else
                    $(this).css("background-color", "red")
                $(this).addClass("text-white");
                hideContent();
                reset();
                $("#start-clock").show();

            })
        })
}

/**
 * Returns the html for a match option for the given match
 * 
 * @param {String} match - the match to make into an option
 */
function getMatchOption(match) {
    return `<option>${match}</option>`;
}

/**
 * Returns the html for a team option for the given team
 * @param {String} team - the team to make into an option
 * @param {String} color - the team's alliance color
 */
function getTeamOption(team, color) {
    return `<option class = "${color}">${team}</option>`
}

/**
 * Complies and returns all the data that was recorded during scoutting
 * 
 * @return all the data that was recorded during scoutting
 */
async function getInputtedData() {
    return getEmptyMatchData()
        .then(data => {
            data.match = $("#match-choices option:selected").text();
            data.team = $("#team-choices option:selected").text();
            $(".data").each(function (index, obj) {
                var path = $(this).attr("id").split("-");
                console.log(path);
                //This temp object is used to traverse down the data in the path given
                var temp = data.gamePlay;
                for (i = 0; i < path.length - 1; i++)
                    temp = temp[path[i]];

                temp[path[i]] = getValue($(this))

            });
            data.timestamps = timestamps

            return data;
        });

}

/**
 * Determines what type of data collection the object is and returns its value
 * 
 * @param {*} dataEntry - object to retrieve data info from
 * @returns The value of the dataEntry
 */
function getValue(dataEntry) {
    /*
     TODO:
     If you have added an input to index.html that is not a check box 
         or just a numerical value, like those in the incrementation/decrementation boxes,
         then add an else if statement that checks to see if the current object
         is one of the ones you've added, and then return the input
         
     For example, if you added sliders for the user to use, make sure they all have a common class
     such as "form-slider", and then you can add an else if stament as such: 
 
     else if( dataEntry.hasClass("form-slider") )
         return dataEntry.val(); // Or however the value is retrieved
 */

    if (dataEntry.hasClass("form-check-input"))  // Records check box data
        return dataEntry.is(':checked') ? 1 : 0;
    // If needed, add else if statement here

    else
        return parseInt(dataEntry.text().trim()); // Records numerical data
}


//Resets the form to a blank state
function reset() {
    $(".form-control").each(function (index, obj) {
        $(this).text(0);
    })

    $(".form-check-input").each(function (index, obj) {
        $(this).prop('checked', false);
    })
    resetClock()

    /*
        TODO:
        If you have added an input to index.html that is not a check box
        or just a numerical value, like those in the incrementation/decrementation boxes,
        then add some way of reseting each of those inputs to a default state. 

        For example, if you added sliders for the user to use, make sure they all 
        have a common class such as "form-slider", and 
        then you can add the following loop to reset them:
        
        $(".form-slider").each(function (index, obj) {
                $(this).val(0); // Or however the input is reset
        })
     */
}

var time = 0
var clock;

/**
 * Starts the clock to update and increment once per second
 */
function startClock() {
    resetClock()
    time = 0;
    timestamps = []
    clock = setInterval(() => {
        var seconds = "" + (time % 60)
        var minutes = "" + parseInt(time / 60)
        if (seconds.length < 2)
            seconds = "0" + seconds
        if (minutes.length < 2)
            minutes = "0" + minutes
        var timeValue = minutes + " : " + seconds;
        $("#time").text(timeValue);
        time++;
    }, 1000)
}

/**
 * Resets clock to 0, removes all timestamp data, and stops running clock code
 */
function resetClock() {
    time = 0;
    timestamps = []
    clearInterval(clock);
    $("#time").text("00 : 00");
}

/**
 * Hides all main functionality
 */
function hideContent() {
    $("#main").hide()
    $("#start-clock").hide()
    $("#timeContainer").css("visibility", "hidden")
    resetClock()
}

