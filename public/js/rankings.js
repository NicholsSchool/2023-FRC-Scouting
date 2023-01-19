var highlightedTeams = [];
var allAverageData = []
document.addEventListener("DOMContentLoaded", event => {
    setUpTeams();
    setUpOptions();
    $("#ranking-num-teams-group").hide(); // Default state is hidden

    /**
     * When clicked, toggles the option for having only certain amount of teams listed
     */
    $("#num-teams-check").on("click", function () {
        $(this).is(':checked') ? $("#ranking-num-teams-group").hide()
            : $("#ranking-num-teams-group").show();
    })

    /**
     * When clicked, adds team and desired color to the highlight list and hightlights
     * all existing occurences of that team
     */
    $("#highlight-btn").on("click", function () {
        var team = $("#highlight-team option:selected").text();

        if (isNaN(Number(team))) // Do nothing if default option is selected
            return;

        $("#highlight-team option:selected").remove(); // Remove team from highlight options

        // Store team and it's desired color to list 
        var style = [team, $("#highlight-color").val()];
        highlightedTeams.push(style)

        // Go through all existing rows and if the team number is there, highlight it
        $("tr").each(function () {
            if ($(this).children().eq(1).text().trim() == team)
                $(this).css("background-color", style[1]);
        })

        //Add team to the key of highlighted teams 
        $("#highlight-key").append(`<div class="row my-3 justify-content-center">
                    <div class="border col-1" style="background-color: ${style[1]}"></div>
                    <div class="col-4"><h5> - ${team}</h5></div>
                    <div class="col-1 ">
                        <div data-team = "${team}"class="text-center delete-highlight btn btn-outline-danger">
                            <i class="fas fa-times"></i>
                        </div>
                    </div> 
        </div>`);
    })

    /**
     * On click, add ranked table for currently selected task
     */
    $("#get-btn").on("click", setRankedTable)

    /**
     * On click, deletes the card it is a part of
     */
    $(document).on("click", ".delete-button", function () {
        $("#ranking-select").append(`<option>${$(this).attr('data-choice')}</option>`)
        var queryId = $(this).parent().children().eq(0).attr('id');
        if (queries[queryId])
            queries[queryId]();  //Removes updatable part 
        $(this).parent().parent().remove();
    })

    /**
     * On click, removes the highlighted team it is next to from the list
     * and removes all occurences of it being highlight
     */
    $(document).on("click", ".delete-highlight", function () {
        var team = $(this).attr('data-team');

        // Goes through each occurance of highlight to remove it
        $("tr").each(function () {
            if ($(this).children().eq(1).text().trim() == team)
                $(this).css("background-color", "");
        })

        // Remove the team from the list
        for (i in highlightedTeams)
            if (highlightedTeams[i][0] == team)
                highlightedTeams.splice(i, 1);

        $("#highlight-team").append(`<option>${team}</option>`); // Adds back team as a highlight option

        $(this).parent().parent().remove(); // Removes the team from highlight key
    })
})

/**
 * Sets up each team as an option for being highlighted
 */
function setUpTeams() {
    getAllTeams()
        .then((teams) => {
            for (team of teams)
                $("#highlight-team").append(`<option>${team}</option>`);
        })
}

/**
 * Sets up each task as an option for a possible ranked list 
 */
function setUpOptions() {
    getEmptyMatchData()
        .then((data) => {
            data = data.gamePlay;

            // Format and store each option 
            var rankingOptions = [];
            for (gamePeriod in data)
                for (action in data[gamePeriod])
                    rankingOptions.push(capitalize(gamePeriod) + " " + capitalize(action));
            rankingOptions.push("Total Score")

            // Display each option
            for (option of rankingOptions)
                $("#ranking-select").append(`<option>${option}</option>`);
        })
}

/**
 * Sets the ranking table card for the currently selected task on the page
 */
function setRankedTable() {
    var choice = $("#ranking-select option:selected").text();
    $("#ranking-select option:selected").remove();
    var path = "averages." + choice.toLowerCase().replace(" ", ".");
    if (choice == "Total Score")
        path = "averages.totalScore";
    var numTeams = !$("#num-teams-check").is(':checked') ? $("#ranking-num-teams").val() : 0;
    var isReversed = $("#reversed-check").is(':checked');
    // getUpdatableRankings(path, numTeams, isReversed, choice) // Makes the table update in real time
    makeRankedTable(path, numTeams, isReversed, choice);
}

/**
 * Creates and displays a ranking card which does NOT update in real time
 * (This is used because it is less reads than update table, so less likely for 
 *  us to go over firebase limits)
 * @param {String} path - the data storage path of the desired task
 * @param {Number} numTeams - the number of teams to include in the list
 * @param {Boolean} isReversed - true if the ranking should be reversed
 * @param {String} choice - the task selected 
 */
function makeRankedTable(path, numTeams, isReversed, choice) {
    // getRankings(path, numTeams, isReversed)
    getRankedData(path, numTeams, isReversed)
        .then(data => {
            var table = makeTable(data, path);
            $("#rankings").before(makeTableCard(choice, table));
        })
}

async function getRankedData(path, numTeams, isReversed) {

    return getAllAverageData()
        .then(avgs => {
            allAverageData = avgs;
            var rankedData = []
            var i = 0;
            var pathList = path.split(".");
            for (info of allAverageData) {
                if (numTeams != 0 && i > numTeams)
                    break;
                var value = info[1];
                for (j = 1; j < pathList.length; j++)
                    value = value[pathList[j]];
                rankedData.push([info[0], value]);
                i++;
            }
            rankedData.sort((a, b) => {
                if (isReversed)
                    return a[1] - b[1];
                return b[1] - a[1];
            })
            return rankedData;
        })
}

async function getAllAverageData() {
    if (allAverageData !== undefined && allAverageData.length != 0)
        return allAverageData;
    return getAllTeamData();
}

/**
 * Returns the html for a ranked score table of teams for a certain task
 * @param {*} data - the ranked list of teams and their scores
 * @param {*} path - the data storage path of the task 
 */
function makeTable(data, path) {
    console.log(data);
    var table = `<div id = "${path}"><table class="table table-striped">
                        <thead>
                            <tr>
                            <th scope="col">#</th>
                            <th scope="col">Team</th>
                            <th scope="col">Value</th>
                            </tr>
                        </thead><tbody>`
    var i = 1;
    //Loops through the data to make a row for each team
    for (info of data) {

        // If the current team in the data is in the list of highlighted teams
        // Set its background color to the color stored for it
        var color = ""
        for (style of highlightedTeams)
            if (style[0] == info[0])
                color = style[1];

        // Add row
        table += `    <tr style = "background-color: ${color}">
                        <th scope="row">${i}</th>
                        <td>
                            <a href = "${document.location.origin}/teamInfo.html?team=${info[0]}" target="_blank">
                            ${info[0]}
                            </a>
                        </td>
                        <td>${Math.round(info[1] * 1000) / 1000}</td>
                        </tr>`
        i++;
    }
    table += `</tbody></table></div>`
    return table;
}

/**
 * Returns the html for a ranking table card
 * 
 * @param {String} choice - the task for the rankings
 * @param {*} table - the ranked table of teams and their scores
 * @return the html for a ranking table card
 */
function makeTableCard(choice, table) {
    return ` <div class="card col-md-4">
        <div class="card-header">
            <h4 class="text-center">${choice}</h4>
        </div>
        <div class=" text-center">
            ${table}
            <div data-choice = "${choice}" class="btn btn-danger delete-button mb-3">Delete Card</div>
        </div>
    </div>`
}

/**
 * Capitalizes the first letter of each word in the given string. 
 * ( Words must be seperated by "_" )
 * @param {String} str - String to capitalize
 */
function capitalize(str) {
    var words = str.split("_")
    var ret = "";
    for (var i = 0; i < words.length; i++) {
        ret += words[i].charAt(0).toUpperCase() + words[i].slice(1);
        if (i != words.length - 1)
            ret += "_"
    }
    return ret;
}