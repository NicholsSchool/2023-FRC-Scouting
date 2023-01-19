var charts = {};
var csvs = {};

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

})

/**
 * Generates a CSV string form the timestamps and stores it in the csvs map
 * 
 * @param {*} timestamps - the timestamps to convert to csv
 * @param {*} id - the match number
 */
function createTimestampCSV(timestamps, id) {
    var rows = [["Action", "Num Occurences", "Total Score", "Time (Seconds)"]]
    for (stamp of timestamps) {
        rows.push([stamp['path'].join('-'), stamp['value'], stamp['totalScore'], stamp['time']])
    }
    let csvContent = "data:text/csv;charset=utf-8,"
        + rows.map(e => e.join(",")).join("\n");
    csvs[id] = csvContent;
}

/**
 * Downloads the match's corresponding csv file. The file will be named
 * team_matchId.csv
 * 
 * @param {*} team - the team number
 * @param {*} matchId - the match number
 */
function downloadTimestampCSV(team, matchId) {
    var encodedUri = encodeURI(csvs[matchId]);
    window.open(encodedUri);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", team + "_" + matchId + ".csv");
    document.body.appendChild(link); // Required for FF
    link.click(); // This will download the data file named "my_data.csv".
}

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
            setUpTeamDataCharts(team);
        })
}

/**
 * Sets each chart to display the data of the given team
 * @param {*} team - the team whose data to show 
 */
function setUpTeamDataCharts(team) {
    getTeamData(team)
        .then(teamData => {
            var teamMatchData = teamData["matches"]
            for (matchId in teamMatchData) {
                var chart = `
        <div class="col-md-5 mt-3">
            <div class="card text-center ">
              <div class="card-header">
                Match ${matchId}
              </div>
              <div class="card-body">
                 <canvas width="100%" height="100%" id=${matchId}></canvas>
                 <div class="btn btn-success mt-4" onClick=downloadTimestampCSV('${team}','${matchId}')>Download CSV</div>
              </div>
            </div>
          </div > 
          `
                $('#charts').append(chart)

                var timestamps = teamMatchData[matchId]['timestamps']
                createTimestampCSV(timestamps, matchId)

                var data = []
                for (stamp of timestamps) {
                    data.push({ x: stamp['time'], y: stamp['totalScore'], label: stamp['path'].join('-') })
                }
                createChart($('#' + matchId), data, matchId)
            }

            $("#charts").show();
        })
}
/**
 * Creates a chart for the first inputted team 
 * @param {*} ctx - the canvas element to place chart
 * @param {*} data - the data for the chart
 * @param {*} id - the data storage path
 */
function createChart(ctx, data, id) {
    const maxTime = 160
    const stepSize = 10
    const autoEndTime = 15
    const teleopEndTime = 120
    const endGameEndTime = maxTime

    // Custom plugin to create background colors for different game periods
    // in the graph
    const plugin = {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart, args, options) => {

            var { ctx } = chart;
            var chartArea = chart.chartArea;

            var width = chartArea.right - chartArea.left;
            var height = chartArea.bottom - chartArea.top

            var columnCount = maxTime / stepSize;
            var columnWidth = width / columnCount;


            ctx.save();

            // Color in Auto
            ctx.fillStyle = options.autoColor;
            var startPoint = chartArea.left
            ctx.fillRect(startPoint, chartArea.top, columnWidth * (autoEndTime / stepSize), height);

            // Color in Teleop
            ctx.fillStyle = options.teleopColor;
            startPoint += columnWidth * (autoEndTime / stepSize)
            ctx.fillRect(startPoint, chartArea.top, columnWidth * (teleopEndTime / stepSize), height);

            // Color in End game
            ctx.fillStyle = options.endColor;
            startPoint += columnWidth * (teleopEndTime / stepSize)
            ctx.fillRect(startPoint, chartArea.top, columnWidth * (endGameEndTime / stepSize), height);


            ctx.restore();
        }
    };
    var myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: "Total Score",
                data: data,
                borderColor: [
                    'rgb(86, 229, 86)',
                ]
            }]
        },
        options: {
            plugins: {
                customCanvasBackgroundColor: {
                    autoColor: '#5c7d3d',
                    teleopColor: '#03befc',
                    endColor: '#ff8578'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.raw.label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    max: maxTime,
                    min: 0,
                    ticks: {
                        stepSize: stepSize
                    }
                }
            },
            showLine: true,

            borderWidth: 4,
            pointRadius: 5
        },
        plugins: [plugin]

    });
    charts[id] = myChart;
}

/**
 * Clears all data from the charts
 */
function clearCharts() {
    for (id in charts)
        charts[id].destroy();
    charts = {};
    $("#charts").empty()
    csvs = {}
}