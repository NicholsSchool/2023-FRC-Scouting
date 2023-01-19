var currentEventKey;
document.addEventListener("DOMContentLoaded", event => {
    $("#loading-options").hide();
    $(".fa-check").each(function () {
        $(this).hide();
    })
    $('#create-event-btn').on("click", function () {
        var event = $('#event-id').val();
        if (event.length == 0)
            return;
        initalizeEvent(event);
    })
})

/**
 * Initializes the event, matches, and team info in the server for the given event 
 * @param {*} eventKey - the Event Key of the desired event
 *                        (Found in the Blue Alliance URL for the event)
 */
function initalizeEvent(eventKey) {
    $("#loading-options").show();
    currentEventKey = eventKey
    setBlueAllianceData("event/" + eventKey + "/simple", filterEvent, createEvent)
    setBlueAllianceData("event/" + eventKey + "/matches/simple", filterMatches, createMatchesInEvent)
    setBlueAllianceData("event/" + eventKey + "/teams/simple", filterTeams, createTeamsInEvent)
    setCurrentEvent(eventKey);
}

/**
 * Sends the given filtered event data to the server to be stored
 * @param {JSON} eventData - filtered event data from the blue alliance
 */
function createEvent(eventData) {
    console.log("Creating Event")
    firebase.auth().currentUser.getIdToken(true)
        .then((idToken) => {
            return $.ajax({
                url: "/createEvent",
                headers: { 'Authorization': idToken },
                data: { "eventData": eventData, "key": currentEventKey },
                method: 'POST',
            })
        })
        .then((response) => {
            $("#event-check").show();
        })
        .catch(err => {
            console.log(err);
            $("#error").text($("#error").text() + " Error in creating Event")
        })
}

/**
 * Sends the given filtered match data to the server to be stored
 * @param {JSON} matchData - filtered team data from the Blue Alliance
 */
function createMatchesInEvent(matchData) {
    console.log("Creating Matches")
    firebase.auth().currentUser.getIdToken(true)
        .then((idToken) => {
            return $.ajax({
                url: "/createMatchesInEvent",
                headers: { 'Authorization': idToken },
                data: { "matchData": matchData, "key": currentEventKey },
                method: 'POST',
            })
        })
        .then((response) => {
            $("#matches-check").show();
        })
        .catch(err => {
            console.log(err);
            $("#error").text($("#error").text() + " Error in creating Matches")
        })

}

/**
 * Sends the given filtered team data to the server to be stored
 * @param {JSON} teamData - filtered team data from the Blue Alliance
 */
function createTeamsInEvent(teamData) {
    console.log("Creating Teams");
    firebase.auth().currentUser.getIdToken(true)
        .then((idToken) => {
            return $.ajax({
                url: "/createTeamsInEvent",
                headers: { 'Authorization': idToken },
                data: { "teamData": teamData, "key": currentEventKey },
                method: 'POST',
            })
        })
        .then((response) => {
            $("#teams-check").show();
        })
        .catch(err => {
            console.log(err);
            $("#error").text($("#error").text() + " Error in creating Teams")
        })
}

/**
 * Sets the current event being scoutted to the given event
 * @param {String} eventKey - the Event Key of the desired event 
 *                          (Found in the Blue Alliance URL for the event)
 */
function setCurrentEvent(eventKey) {
    firebase.auth().currentUser.getIdToken(true)
        .then((idToken) => {
            return $.ajax({
                url: "/setCurrentEvent",
                headers: { 'Authorization': idToken },
                data: { "key": eventKey },
                method: 'POST',
            })
        })

        .catch(err => {
            console.log(err);
            $("#error").text($("#error").text() + " Error in setting event")
        })
}

/**
 * Returns an object containing each match and the alliances within each match
 * based off data from the Blue Alliance match data query response 
 * @param {JSON} response - the response from the blue alliance for match info in an event
 * @return an object containing each match and the alliances within each match
 */
function filterMatches(response) {
    var matches = {};
    for (match of response) {
        if (match.comp_level != "qm")
            continue;
        var matchData = {};
        for (color in match.alliances) {
            var alliance = [];
            for (team of match.alliances[color].team_keys)
                alliance.push(team.substring(3));
            matchData[color] = alliance;
        }
        matches[match.match_number] = matchData;
    }
    return matches;
}

/**
 * Return a list of each team in the event from the given query response
 * @param {JSON} response - the response from the blue alliance for team info in an event
 * @return a list of each team in the event from the given query response
 */
function filterTeams(response) {
    var teams = [];
    for (team of response)
        teams.push(team["team_number"]);
    return teams
}
/**
 * Returns the event key and event name from a Blue Alliance event query response
 * @param {JSON} response - the event query response from Blue Alliace
 * @return the event key and event name from a Blue Alliance event query response
 */
function filterEvent(response) {
    return { "key": response.key, "name": response.name };
}

/**
 * Gets certain data from Blue Alliance, filters it, and sends it to the server,
 * using the inputted functions
 * 
 * @param {String} urlSuffix - the query for blue alliance
 * @param {Function} filter - the function which filters the necessary data
 * @param {Function} send - the function which sends the filtered data to the server
 */
function setBlueAllianceData(urlSuffix, filter, send) {
    firebase.auth().currentUser.getIdToken(true)
        .then(idToken => (
            $.ajax({
                url: "/getBlueAllianceKey",
                headers: { 'Authorization': idToken },
                method: 'GET',
            })
        ))
        .then(key => {
            //Make query request
            $.ajax({
                url: "https://www.thebluealliance.com/api/v3/" + urlSuffix,
                headers: {
                    'X-TBA-Auth-Key': key
                },
                method: 'GET',
            })
                .then((response) => {
                    return filter(response); // Filter response
                })
                .then((filteredData) => {
                    if (send) // Check if a send function was inputted
                        send(filteredData); // Send filtered data to server
                })
                .catch(err => {
                    console.log("Error");
                    console.log(err);
                    $("#error").text($("#error").text() + "  " + err.responseText);
                })
        })
}