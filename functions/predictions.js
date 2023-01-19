const { app, db } = require('./server');
const gameData = require("./data");
const retrieval = require("./retrieval");
const verification = require("./verification.js");
/**
 * Calculates the predicted score for an alliance of teams if they played together
 * @param {*} allianceAverages - a list of the averages scores for each team in the alliance
 */
function calculateAllianceScore(allianceAverages) {
    var points = gameData.getDataPointValues(); // Also used for looping through
    var dependentData = gameData.getDependentData();
    var allianceScore = 0;
    for (gamePeriod in points)
        for (teamAverage of allianceAverages) {
            console.log(gamePeriod)
            //Adding average total score is unreliable because some tasks only require 1 out of 3 teams
            if (gamePeriod == "totalScore" || gamePeriod == "performance")
                continue;
            //If everything in this period is independent, just add the average score
            if (!(gamePeriod in dependentData)) {
                allianceScore += teamAverage[gamePeriod].score;
                continue;
            }

            for (action in teamAverage[gamePeriod]) {
                if (action == "score")
                    continue;

                //If this action is not a dependent action, then just add it to the score
                if (!(action in dependentData[gamePeriod]))
                    allianceScore += teamAverage[gamePeriod][action] * points[gamePeriod][action];
                else
                    if (dependentData[gamePeriod][action] <= teamAverage[gamePeriod][action])
                        dependentData[gamePeriod][action] = teamAverage[gamePeriod][action];
            }
        }

    for (gamePeriod in dependentData)
        for (action in dependentData[gamePeriod])
            allianceScore += dependentData[gamePeriod][action] * points[gamePeriod][action];

    return allianceScore
}

/**
 * Returns the predicted score for an alliance 
 * @param {FirebaseFirestore.QuerySnapshot} allianceSnap - the query snapshot containing 
 *                                          the data for the teams within the alliance
 * @return the predicted score for an alliance
 */
function getAllianceScore(allianceSnap) {
    var allianceAverages = []
    allianceSnap.forEach(team => {
        allianceAverages.push(team.data().averages);
    })
    return calculateAllianceScore(allianceAverages);
}

/**
 * Returns the predicted scores for a match 
 * @param blue - inside the request sent, this must be a list of teams in the blue alliance
 * @param red -  inside the request sent, this must be a list of teams in the red alliance
 */
app.get("/getWinner", (req, res) => {
    var blueAlliance = req.query.blue;
    var redAlliance = req.query.red;
    var blueScore = 0;
    var redScore = 0;
    var teamsRef;
    //First we verify the user. If they aren't valid, the code skips to the catch()
    verification.verifyAuthToken(req)
        .then((decoded) => {
            return retrieval.getCurrentEvent()
        })
        .then((event) => {
            teamsRef = event.collection("Teams");
            return teamsRef.where('teamNum', 'in', blueAlliance).get();
        })
        .then((alliance) => {
            blueScore = getAllianceScore(alliance);
            return teamsRef.where('teamNum', 'in', redAlliance).get();
        })
        .then((alliance) => {
            redScore = getAllianceScore(alliance);
            res.send({ "blue": blueScore, "red": redScore });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).send("Error in getting predicted winner");
        })
})
