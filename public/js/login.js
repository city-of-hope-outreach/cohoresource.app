( function () {
    const app = angular.module("cohoapp");
    app.controller("loginController", function ($scope, auth, $location, notSignedIn) {


        if (auth.currentUser) {
            $location.path("/");
        } else {
            $('.sidebar').hide();
        }


        $scope.user = {
            email: "",
            password: ""
        }

        $scope.login = function () {
            auth.signInWithEmailAndPassword($scope.user.email, $scope.user.password)
                .catch((error) => {
                    console.log(error);
                }).then((user) => {
                    $('.sidebar').show();
                    $location.path("/");
                    $scope.$apply();
                });
        }
    });
})();
