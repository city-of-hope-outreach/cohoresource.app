( function () {
	const app = angular.module('cohoapp');
	app.controller('editCountyController', function ($scope, $location, notSignedIn, $routeParams) {
		notSignedIn($location);

		$scope.org = "county";
		$scope.icons = ['counties/faulkner', 'counties/pulaski', 'counties/conway'];

		$scope.header = "New County";
		$scope.category = {};
		if ($routeParams.countyId) {
			$scope.header = "Edit County";

			firebase.database().ref(`counties/${$routeParams.countyId}`).once("value").then((snapshot) => {
				$scope.category = snapshot.val();
				$scope.$apply();
			});
		}
	});
})();
