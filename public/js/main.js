document.addEventListener("DOMContentLoaded", event => {
    $("#main").hide(); // Comment this line out when creating index.html. 
    // REMEMBER TO UNCOMMENT WHEN DONE

    // Used for changing values of incrementation/decrementation inputs
    $(".change-btn").on("click", function () {
        var id = $(this).attr("for");
        var val = parseInt($("#" + id).text());
        if ($(this).hasClass("increment"))
            $("#" + id).text(val + 1);
        else if (val > 0)
            $("#" + id).text(val - 1);
    })
    setUpEvent();
    $("#submit-btn").on("click", saveData);
})

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
                $("#main").hide();
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

            // Resets and reveals the form when a new team is selected
            $("#team-choices").on("change", function () {
                if ($("option:selected", this).hasClass("blue"))
                    $(this).css("background-color", "blue")
                else
                    $(this).css("background-color", "red")
                $(this).addClass("text-white");
                reset();
                $("#main").show();
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

                /* 
                    TODO:
                    If you have added an input to index.html that is not a check box 
                        or just a numerical value, like those in the incrementation/decrementation boxes,
                        then add an else if statement that checks to see if the current object
                        is one of the ones you've added, and then add a line setting "temp[path[i]]" equal
                        to the input
                        
                    For example, if you added sliders for the user to use, make sure they all have a common class
                    such as "form-slider", and then you can add an else if stament as such: 
    
                    else if( $(this).hasClass("form-slider") )
                        temp[path[i]] = $(this).val(); // Or however the value is retrieved
                */
                // Records data here 
                if ($(this).hasClass("form-check-input"))  // Records check box data
                    temp[path[i]] = $(this).is(':checked') ? 1 : 0;

                // If needed, add else if statement here

                else
                    temp[path[i]] = parseInt($(this).text().trim()); // Records numerical data
            });
            return data;
        });

}

//Resets the form to a blank state
function reset() {
    $(".form-control").each(function (index, obj) {
        $(this).text(0);
    })

    $(".form-check-input").each(function (index, obj) {
        $(this).prop('checked', false);
    })

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