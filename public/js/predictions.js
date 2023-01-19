document.addEventListener("DOMContentLoaded", event => {
    $("#prediction-card").hide(); // Shouldn't appear until prediction is made
    setUpChoices();
    setUpMatches();

    /**
     * When this button is clicked, the team options will get filled with the teams
     * in the currently selected match
     */
    $("#match-select-btn").on("click", function () {
        var selectedMatch = $("#match-select option:selected").text();

        if (isNaN(Number(selectedMatch))) // If in the default selection, do nothing
            return;

        // Get teams in the match and place them accordingly 
        getTeamsInMatch(selectedMatch)
            .then(teams => {
                console.log(teams);
                $(".blue-select").each(function (index) {
                    $(this).val(teams.blue[index]);
                })
                $(".red-select").each(function (index) {
                    $(this).val(teams.red[index]);
                })
            })
    })

    /**
     * When this button is clicked, get all selected teams and display the prediction
     */
    $("#predict-btn").on("click", function () {
        var blueAlliance = [];
        var redAlliance = [];
        var error = false;

        // Go through each team option and add them to the lists
        $(".team-select").each(function () {
            var selectedTeam = $(this).find(":selected").text()

            // If an option is in its default state, show user an error stop
            // adding teams to the lists
            if (isNaN(Number(selectedTeam))) {
                $("#prediction-error").show();
                error = true;
                return;
            }

            // Add each team to its respective alliance
            if ($(this).parent().parent().hasClass("blue"))
                blueAlliance.push(selectedTeam);
            else
                redAlliance.push(selectedTeam);
        })

        if (error)
            return;

        /**
         * Gets the predicted scores for the two alliance and sets the winner 
         * accordingly
         */
        getPrediction(blueAlliance, redAlliance)
            .then(prediction => {
                $("#prediction-error").hide();
                $("#prediction-card").show();
                $("#blue-score").text(Math.round(prediction.blue * 1000) / 1000);
                $("#red-score").text(Math.round(prediction.red * 1000) / 1000);
                if (prediction.blue > prediction.red) {
                    $('#winner').text("Blue")
                    $('#winner').parent().css('background-color', 'deepskyblue')
                }
                else if (prediction.red > prediction.blue) {
                    $('#winner').text("Red")
                    $('#winner').parent().css('background-color', 'crimson')
                }
                else {
                    $('#winner').text("Tie")
                    $('#winner').parent().css('background-color', 'mediumpurple')
                }
            })

    })
})

/**
 * Sets up every match in the event as a choice to select
 */
function setUpMatches() {
    getMatches()
        .then((matches) => {
            for (match of matches)
                $("#match-select").append(`<option>${match}</option>`);
        })
}

/**
 * Sets up every team in the event as a choice to select in each of the 6 spots
 */
function setUpChoices() {
    getAllTeams()
        .then(teams => {
            $(".team-select").each(function () {
                for (team of teams)
                    $(this).append(`<option>${team}</option>`);
            })
        })
}