( function () {
	const app = angular.module('cohoapp');
	app.controller('editCountyController', function ($scope, $location, notSignedIn, database, $routeParams) {
		notSignedIn($location);

		$scope.loading = false;
		$scope.saveBtnText = "SAVE";
		$scope.success = false;
		$scope.errmsg = "";

		$scope.org = "county";
		$scope.icons = ['counties/faulkner', 'counties/pulaski', 'counties/conway'];

		$scope.header = "New County";
		$scope.category = {};
		if ($routeParams.countyId) {
			$scope.header = "Loading...";

			firebase.database().ref(`counties/${$routeParams.countyId}`).once("value").then((snapshot) => {
				$scope.category = snapshot.val();
				$scope.header = "Edit County";
				$scope.loading = false;
				$scope.$apply();
			});
		}

		$scope.saveCategory = function () {
			$scope.loading = true;
			$scope.saveBtnText = "SAVING...";
			$scope.success = false;
			$scope.errmsg = "";

			const county = angular.copy($scope.category);

			if ($routeParams.countyId) {
				database.ref(`counties/${$routeParams.countyId}`).set(county)
					.then(() => {
						$scope.loading = false;
						$scope.saveBtnText = "SAVE";
						$scope.success = true;
						$scope.$apply();
					})
					.catch((error) => {
						if (error) {
							$scope.errmsg = error.message;
						} else {
							$scope.errmsg = "An unknown error occurred.";
						}
						$scope.$apply();
					});
			} else {
				const newRef = database.ref(`counties`).push();
				newRef.set(county).then(() => {
					$scope.header = "Edit Resource";
					$scope.loading = false;
					$scope.saveBtnText = "SAVE";
					$scope.success = true;
					$scope.$apply();
				}).catch((error) => {
					if (error) {
						$scope.errmsg = error.message;
					} else {
						$scope.errmsg = "An unknown error occurred.";
					}
					$scope.$apply();
				});
			}
		}
	});
})();
