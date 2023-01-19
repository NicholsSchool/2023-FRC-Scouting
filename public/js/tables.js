var teamData = [];
var highlightedTeams = [];
document.addEventListener("DOMContentLoaded", event => {
    setUpHighlightOptions();
    getHeaderOptions();
    $("#table-card").hide();

    // Whenever a header is clicked, reorganize the chart based off the values of 
    // that header
    $(document).on("click", "th", function () {
        reorganizeChart(Number($(this).attr("data-sort")));
    })

    /**
     * When clicked, adds team and desired color to the highlight list and hightlights
     * all existing occurences of that team
     */
    $("#highlight-btn").on("click", () => {
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

    /**
     * When clicked, set up the table with data for the selected taks 
     */
    $("#rankings-btn").on("click", () => {
        var paths = [];

        //Goes through and stores each task selected
        $(".data").each(function (index, value) {
            if ($(this).is(':checked'))
                paths.push($(this).attr('id'));
        })

        setUpTable(paths);
        $("#table-card").show();
    })

    /**
     * When clicked, all checkboxes will be selected
     */
    $("#select-all").on("click", () => {
        $(".data").prop("checked", true);
    })

    /**
     * When clicked, all checkboxes will be unselected
     */
    $("#unselect-all").on("click", () => {
        $(".data").prop("checked", false);
    })
})

/**
 * Sets up all the teams as options to be highlighted
 */
function setUpHighlightOptions() {
    getAllTeams()
        .then((teams) => {
            for (team of teams)
                $("#highlight-team").append(`<option>${team}</option>`);
        })
}

/**
 * Sets up the table displaying all the selected tasks for teams
 * @param {*} paths - the storage paths of the selected tasks
 */
function setUpTable(paths) {
    getAllTeamData()
        .then(allTeamData => {
            setUpTableHeaders(["#", "Team"].concat(paths));
            var index = 1;
            for (data of allTeamData) {
                var info = [data[0]];
                for (path of paths) {
                    path = path.split(" ");
                    var value = data[1];
                    for (i = 0; i < path.length; i++)
                        value = value[path[i]];
                    info.push(Math.round(value * 1000) / 1000);
                }
                teamData.push(info);
                setUpRow([index++].concat(info));
            }
            $("#ranking-options").hide();
        })
}

/**
 * Gets each task and sets up an option for it
 */
function getHeaderOptions() {
    getEmptyMatchData()
        .then(sampleData => {
            sampleData = sampleData.gamePlay;
            var options = [];
            for (gamePeriod in sampleData)
                for (score in sampleData[gamePeriod])
                    options.push(gamePeriod + " " + score);
            options.push("totalScore");
            setUpHeaderOptions(options);
        })

}

/**
 * Sets up a checkbox option for each possible task to view 
 * @param {*} options 
 */
function setUpHeaderOptions(options) {
    for (option of options) {
        $("#header-options").append(` <div class="col-2 my-2 form-check">
                            <input class="form-check-input data" type="checkbox" id="${option}">
                            <label class="form-check-label" for="${option}">
                                ${option}
                            </label>
                        </div>`);
    }
}

/**
 * Sets up the header for each column of the table
 * @param {*} headers - a list of the headers to use
 */
function setUpTableHeaders(headers) {
    var index = 0;
    for (header of headers)
        $("#table-headers").append(`<th data-sort = "${index++}"scope="col">${header}</th>`)
}

/**
 * Sets up a row in the data table based off the inputted data
 * @param {*} info - the team's data for the row
 */
function setUpRow(info) {
    var color = "";
    // If the team whose data is inputted is on the highlight list, highlight it
    for (style of highlightedTeams)
        if (style[0] == info[1])
            color = style[1];

    // Add all values to row
    var row = `<tr style = "background-color: ${color}"><th scope = "row">${info[0]}</th>`
    for (var i = 1; i < info.length; i++)
        row += `<td>${info[i]}</td>`
    row += `</tr>`

    $("#table-body").append(row)
}

/**
 * Resorts and displays chart based off what value the user wants to sort by
 * @param {*} index - the index on the page of the value the user wants to sort by
 */
function reorganizeChart(index) {
    if (index - 1 < 0)
        return;
    index -= 1; // The data in the lists is shifted by 1 from what the user sees
    $("#table-body").empty(); // Remove everything
    sort(index) // Sorts list
    var num = 1;
    // Make table based off new sorted data
    for (info of teamData)
        setUpRow([num++].concat(info));
}

/**
 * Sorts the team data lists based off the values at the given index
 * @param {*} sortIndex - the index of the value to sort off of 
 */
function sort(sortIndex) {
    teamData.sort(function (a, b) {
        return b[sortIndex] - a[sortIndex];
    })
}