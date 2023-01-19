const { app, db } = require('./server');
const gameData = require("./data");
const verification = require("./verification.js");

/**
 * Used to create an event in the firebase storage
 * 
 * @param eventData - inside the request sent, this must contain the event's key and name
 */
app.post("/createEvent", (req, res) => {
    var event = req.body.eventData;
    //First we verify the user. If they aren't valid, the code skips to the catch()
    verification.verifyAuthToken(req)
        .then((decoded) => {
            return db.collection("Events").doc(event.key).set({
                "name": event.name
            })
        })
        .then(() => {
            res.send("all done");
        })
        .catch((err) => {
            console.log(err);
            res.status(400).send("Error setting event name")
        })
})

/**
 * Used to create matches within an event in the firebase storage
 * 
 * @param matchData - inside the request sent, this must contain all the matches in the event 
 *                    and the alliances within each match 
 * @param key - inside the request sent, this must contain the event key 
 */
app.post("/createMatchesInEvent", (req, res) => {
    var matches = req.body.matchData;
    var eventKey = req.body.key;
    var batch = db.batch();
    //First we verify the user. If they aren't valid, the code skips to the catch()
    verification.verifyAuthToken(req)
        .then(decoded => {
            for (match in matches) {
                var matchNum = "" + (Number(match) + 1);
                while (matchNum.length < 3)
                    matchNum = "0" + matchNum;
                batch.set(db.collection("Events").doc(eventKey).collection("Matches").doc(matchNum), matches[match]);
            }
            return batch.commit()
        })
        .then(() => {
            res.send("done");
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send("Error in setting matches");
        })

})

/**
 * Used to create and setup storage for each team in the event
 * 
 * @param teamData - inside the request sent, this must contain a list of all teams in the event
 * @param key - inside the request sent, this must contain the event key
 */
app.post("/createTeamsInEvent", (req, res) => {
    var teams = req.body.teamData;
    var eventKey = req.body.key;
    var batch = db.batch();
    //First we verify the user. If they aren't valid, the code skips to the catch()
    verification.verifyAuthToken(req)
        .then(decoded => {
            for (team of teams)
                batch.set(db.collection("Events").doc(eventKey).collection("Teams").doc(team), {
                    teamNum: team,
                    matches: {},
                    averages: gameData.getEmptyMatchData().gamePlay
                });
            return batch.commit()
        })
        .then(() => {
            res.send("done");
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send("Error in setting matches");
        })
})

/**
 * Sets the app's current event to the given event
 * 
 * @param key - inside the request sent, this must contain the event key
 */
app.post("/setCurrentEvent", (req, res) => {
    //Possibly add code to confirm that the event inputted exists in current Event.

    //First we verify the user. If they aren't valid, the code skips to the catch()
    verification.verifyAuthToken(req)
        .then((decoded) => {
            db.collection("MetaData").doc("CurrentEvent").set({ "event": req.body.key });
        })
        .catch(err => {
            console.log(err);
            res.status(401).send("Not allowed to set current event");
        })
})
