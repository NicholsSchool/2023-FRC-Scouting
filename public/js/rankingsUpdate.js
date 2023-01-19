var queries = {};
/**
 * Creates and displays a ranking card which updates in real time
 * @param {String} path - the data storage path of the desired task
 * @param {Number} numTeams - the number of teams to include in the list
 * @param {Boolean} isReversed - true if the ranking should be reversed
 * @param {String} choice - the task selected 
 */
async function getUpdatableRankings(path, numTeams, isReversed, choice) {
    var order = isReversed ? 'asc' : "desc";

    numTeams = Number(numTeams); // Make sure its a number

    getCurrentEventID()
        .then(eventID => {
            var query;
            if (numTeams <= 0) // If less than or equal to 0, then show all tems
                return db.collection("Events").doc(eventID).collection("Teams").orderBy(path, order);
            else // If greater than 0, limit the number of teams
                return db.collection("Events").doc(eventID).collection("Teams").orderBy(path, order).limit(numTeams);
        })
        .then(query => {
            path = path.split(".").join("-");
            query = query
                .onSnapshot(function (snap) {  // On Snapshot calls this code whenever the data is updated
                    var data = [];
                    var p = path.split("-");

                    // Store each team and its data
                    snap.forEach(doc => {
                        var value = doc.data();
                        for (i = 0; i < p.length; i++)
                            value = value[p[i]];
                        value = Math.round(value * 1000) / 1000;
                        data.push([doc.id, value]);
                    });

                    // If there is nothing already set for this path, set up a new table
                    if ($('#' + path).length == 0) {
                        console.log("Set Up")
                        var table = makeTable(data, path)
                        $("#rankings").before(makeTableCard(choice, table));
                    }
                    else // otherwise, update this table
                    {
                        console.log("Update");
                        var newTable = makeTable(data, path)
                        $('#' + path).replaceWith(newTable);
                    }
                }, function (error) {
                    console.log(error)
                })

            // Store this query so that we can remove the updating of the table later 
            // if the user wants to remove the table
            queries[path] = query;
            return query;
        })
        .catch(error => {
            console.log(error);
        })
}