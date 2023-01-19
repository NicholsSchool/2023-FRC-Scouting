/** Loads in the header to the page */
$('#header').load("header.html", function () {
    /**
     * Handles the response whenever user state is changed
     */
    firebase.auth().onAuthStateChanged(user => {
        if (user)
            signInResponse()
        else
            signOutResponse();
    })
});


document.addEventListener("DOMContentLoaded", event => {
    /**
     * Sign in the user with a google sign in redirect whenever sign in button is clicked
     */
    $(document).on("click", "#signIn", () => {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                var provider = new firebase.auth.GoogleAuthProvider();
                firebase.auth().signInWithRedirect(provider)
                firebase.auth().getRedirectResult().then(function (result) {
                    // No need to do anything
                }).catch(function (error) {
                    console.error(error)
                });
            })
            .catch((error) => {
                console.error(error)
            });
    })

    /**
     * Sign out user whenever sign out button is clicked
     */
    $(document).on("click", "#signOut", () => {
        firebase.auth().signOut()
            .catch(function (error) {
                console.log(error);
            });
    })
})

/**
 * Reveals the page and hides the sign in warning and shows the sign out button
 */
function signInResponse() {
    console.log("Signed in")
    $("#content").show();
    $("#warning").hide();
    $("#signIn").hide();
    $("#signOut").show();
}

/**
 * Hides the page and reveals the sign in warning and shows the sign in button
 */
function signOutResponse() {
    console.log("Signed out")
    $("#content").hide();
    // If the warning doesn't exist, make it, otherwise show it
    if ($("#warning").length == 0)
        $("#content").before(
            `<h1 id = "warning" class = "text-center mt-3"> You must sign in to be able to use the app </h1>`);
    else
        $("#warning").show();

    $("#signIn").show();
    $("#signOut").hide();
}