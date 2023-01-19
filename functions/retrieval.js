const { app, db } = require('./server');
const gameData = require('./data');
const verification = require("./verification.js");

var methods = {};

/**
 * Returns the DocumentReference of the current event the app is set to
 * @return the DocumentReference of the current event the app is set to
 */
methods.getCurrentEvent = async function () {
    return db.collection("MetaData").doc("CurrentEvent").get()
        .then(snap => {
            return db.collection("Events").doc(snap.data().event);
        })
}

/**
 * Returns the name of the current event
 * @return the name of the current event
 */
app.get("/getCurrentEvent", (req, res) => {
    methods.getCurrentEvent()
        .then((event) => {
            return event.get();
        })
        .then((snap) => {
            res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
            res.send(snap.data().name);
        })
        .catch((err) => {
            console.error(err);
            res.status(400).send("Error in getting event name");
        })
})

/**
 * Returns the event key (ID) of the current event
 * 
 * @return the event key (ID) of the current event
 */
app.get("/getCurrentEventID", (req, res) => {
    methods.getCurrentEvent()
        .then(event => {
            res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
            res.send(event.id);
        })
        .catch(err => {
            console.log(err);
            res.status(400).send("Error in getting event ID");
        })
})

/**
 * Returns a list of each match number within the current event
 * 
 * @return a list of each match number within the current event
 */
app.get("/getMatches", (req, res) => {
    methods.getCurrentEvent()
        .then((event) => {
            return event.collection("Matches").listDocuments()
        })
        .then(docs => {
            var matches = [];
            for (match of docs)
                matches.push(match.id);
            res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
            res.send(matches);
        })
        .catch(err => {
            console.error(err);
            res.status(400).send("Error in getting matches");
        })
})

/**
 * Returns a list of all teams within the current event
 * 
 * @return a list of all teams within the current event
 */
app.get("/getAllTeams", (req, res) => {
    methods.getCurrentEvent()
        .then((event) => {
            return event.collection("Teams").listDocuments()
        })
        .then(docs => {
            var teams = [];
            for (team of docs)
                teams.push(team.id);
            res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
            res.send(teams);
        })
        .catch(err => {
            console.log(err)
            res.status(400).send("Error in getting a list of all teams");
        })
})

/**
 * Returns the teams within a given match 
 * 
 * @param match - inside the request sent, this must contain the desired match's number
 * @return the teams within a given match
 */
app.get("/getTeamsInMatch", (req, res) => {
    var match = req.query.match;
    methods.getCurrentEvent()
        .then((event) => {
            return event.collection("Matches").doc(match).get()
        })
        .then((match) => {
            res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
            res.send(match.data());
        })
        .catch((err) => {
            console.error(err);
            res.status(404).send("Match Not Found")
        })
})

/**
 * Returns all the data for a given team in the current event
 * 
 * @param team - inside the request sent, this must contain the desired team's number
 * @return all the data for a given team in the current event
 */
app.get("/getTeamData", (req, res) => {
    var team = req.query.team;
    //First we verify the user. If they aren't valid, the code skips to the catch()
    verification.verifyAuthToken(req)
        .then(decoded => {
            return methods.getCurrentEvent()
        })
        .then(event => {
            return event.collection("Teams").doc(team).get()
        })
        .then(teamDataSnap => {
            res.send(teamDataSnap.data())
        })
        .catch((err) => {
            console.error(err);
            res.status(400).send("Retrieval error for team data")
        })
})

/**
 * Returns a list of the data for each and every team within the current event
 * 
 * @return a list of the data for each and every team within the current event
 */
app.get("/getAllTeamData", (req, res) => {
    var order = 'desc';
    var path = "averages.totalScore"
    //First we verify the user. If they aren't valid, the code skips to the catch()
    verification.verifyAuthToken(req)
        .then((decoded) => {
            return methods.getCurrentEvent()
        })
        .then(event => {
            return event.collection("Teams").orderBy(path, order).get();
        })
        .then(snap => {
            var response = [];
            snap.forEach(doc => {
                response.push([doc.id, doc.data()["averages"]])
            })
            res.send(response);
        })
        .catch(err => {
            console.log(err);
            res.status(400).send("Error in getting all team data at event")
        })
})

/**
 * Returns an empty version of the storage object used for scouting data collection
 * 
 * @return an empty version of the storage object used for scouting data collection
 */
app.get('/getEmptyData', (req, res) => {
    res.set('Cache-Control', 'public, max-age=3000, s-maxage=6000'); // This cache is 10x longer than rest
    res.send(gameData.getEmptyMatchData());
})



module.exports = methods;