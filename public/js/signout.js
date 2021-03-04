( function () {
    const app = angular.module("cohoapp");
    app.controller("signoutController", function ($scope, auth, $location, notSignedIn) {
        auth.signOut();
        $('.sidebar').hide();
        $location.path("/login");
    });
})();
