( function () {
	const app = angular.module('cohoapp');
	app.controller('editCountyController', function ($scope, $location, notSignedIn, database, $routeParams) {
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

		$scope.saveCategory = function () {
			const county = angular.copy($scope.category);

			if ($routeParams.countyId) {
				database.ref(`counties/${$routeParams.countyId}`).set(county);
			} else {
				const newRef = database.ref(`counties`).push();
				newRef.set(county);
			}
		}
	});
})();
