var charts = {};

document.addEventListener("DOMContentLoaded", event => {
    $("#charts").hide();
    setUp();
    /**
     * On click, sets charts with the selected team's dataset
     */
    $("#team-select-btn").on("click", () => {
        var selectedTeam = $("#team-select-1 option:selected").text();
        if (isNaN(Number(selectedTeam))) // If default option slected, don't do anything
            return;

        clearCharts();
        setUpTeamDataCharts(selectedTeam, createChart);
    })
    /**
     * On click, sets another team's dataset on each chart
     */
    $("#second-team-select-btn").on("click", () => {
        var selectedTeam = $("#team-select-2 option:selected").text();
        if (isNaN(Number(selectedTeam))) // If default option slected, don't do anything
            return;

        //if chart is empty, don't make second chart
        if (Object.entries(charts).length === 0)
            $("#second-team-select-error").show();
        else {
            $("#second-team-select-error").hide();
            setUpTeamDataCharts(selectedTeam, addSecondDataset);
        }
    })
})

/**
 * Sets up the team options and possibly a certain team's info if in the url
 */
function setUp() {
    getAllTeams()
        .then(teams => {
            // Sets up the options for each team
            $(".team-select").each(function () {
                for (team of teams)
                    $(this).append(`<option>${team}</option>`);
            })
            return;
        })
        .then(() => {
            // If the page's URL contains a query for a team, display that team's info
            var url = $(location).attr('href')
            if (!url.includes('?'))
                return;
            var team = url.substring(url.indexOf("=") + 1, url.length);
            $("#team-select-1").val(team);
            clearCharts();
            setUpTeamDataCharts(team, createChart);
        })
}

/**
 * Sets each chart to display the data of the given team
 * @param {*} team - the team whose data to show 
 * @param {*} typeOfChart - the function for set up
 */
function setUpTeamDataCharts(team, typeOfChart) {
    getTeamData(team)
        .then(teamData => {
            var teamMatchData = teamData["matches"]
            // Go through each canvas to set the chart on it
            $("canvas").each(function () {
                var path = $(this).attr('id').split("-"); // Each canvas has the data storage path for its task
                var data = [];
                var labels = [];
                var num = 1;

                // Sorts through each match of the team in sequential order
                var matchesPlayedByTeam = Object.keys(teamMatchData).sort();
                for (index of matchesPlayedByTeam) {
                    labels.push("" + num++);
                    var temp = teamMatchData[index];
                    for (var i = 0; i < path.length; i++)
                        temp = temp[path[i]];
                    data.push(temp)
                }

                //Sets up the chart using the inputted function
                typeOfChart($(this), data, $(this).attr('id'), labels, team);
            })
            $("#charts").show();
        })
}
/**
 * Creates a chart for the first inputted team 
 * @param {*} ctx - the canvas element to place chart
 * @param {*} data - the data for the chart
 * @param {*} id - the data storage path
 * @param {*} labels - the labels for the chart
 * @param {*} teamNum - the team's number
 */
function createChart(ctx, data, id, labels, teamNum) {
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: teamNum,
                data: data,
                borderColor: [
                    'rgb(86, 229, 86)',
                ],
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            }
        }
    });
    charts[id] = myChart;
}

/**
 * Adds a second team's data set to show on the charts
 * @param {*} ctx - the canvas element to place chart
 * @param {*} data - the data for the chart
 * @param {*} id - the data storage path
 * @param {*} labels - the labels for the chart
 * @param {*} teamNum - the team's number
 */
function addSecondDataset(ctx, data, id, labels, teamNum) {
    var dataset = {
        label: teamNum,
        data: data,
        borderColor: [
            'rgb(204, 0, 153)',
        ],
        fill: false
    }

    if (charts[id].data.datasets.length == 1)// If there is only one dataset, add this one
        charts[id].data.datasets.push(dataset)
    else //if there is more than 1 dataset, set it to this one 
        charts[id].data.datasets[1] = dataset

    // If this second team has played more matches, use its labels
    if (labels.length > charts[id].data.labels.length)
        charts[id].data.labels = labels;
    charts[id].update();
}

/**
 * Clears all data from the charts
 */
function clearCharts() {
    for (id in charts)
        charts[id].destroy();
    charts = {};
}