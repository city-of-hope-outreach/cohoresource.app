( function () {
    const app = angular.module("cohoapp");
    app.controller("loginController", function ($scope, auth, $location, $sce) {


        if (auth.currentUser) {
            $location.path("/");
        } else {
            $('.sidebar').hide();
        }


        $scope.btnText = "Log in"
        $scope.loading = false;
        $scope.errmsg = "";

        $scope.user = {
            email: "",
            password: ""
        }

        $scope.login = function () {
            $scope.btnText = $sce.trustAsHtml("<div class='loader'>Loging in...</div>");
            $scope.loading = true;
            auth.signInWithEmailAndPassword($scope.user.email, $scope.user.password)
                .then((user) => {
                    $('.sidebar').show();
                    $location.path("/");
                    $scope.$apply();
                }).catch((error) => {
                    var desc = "";

                    if (error) {
                        if (error.code === 'auth/invalid-email') {
                            desc = "Invalid Email";
                        } else if (error.code === 'auth/user-disabled') {
                            desc = "User has been disabled";
                        } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                            desc = "Your email or password was incorrect";
                        } else {
                            desc = error.message;
                        }
                    } else {
                        desc = "Unknown error"
                    }

                    $scope.errmsg = `Could not log in: ${desc}`;
                    $scope.btnText = "Log in";
                    $scope.loading = false;
                    $scope.$apply();
                });
        }
    });
})();
