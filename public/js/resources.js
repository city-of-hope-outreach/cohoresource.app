( function () {
	const app = angular.module('cohoapp');
	app.controller('resourcesController', function ($scope, $location, $timeout, database, notSignedIn, loadResources) {
		notSignedIn($location);
		var currentTimeout = null;

		// TODO set up pagination
		loadResources((resources) => {
			$scope.resources = resources;
			$scope.displayedResources = resources;
			$scope.$apply();
		});

		$scope.searchChanged = function () {
			$timeout.cancel(currentTimeout);
			currentTimeout = $timeout(doSearch, 1000); // wait a second before actually searching
		}

		$scope.submit = function () {
			$timeout.cancel(currentTimeout);
			doSearch($scope.search);
		}

		const doSearch = function () {
			$scope.displayedResources = $scope.resources.filter((resource) => {
				const q = $scope.search.toLowerCase();
				return resource.name.toLowerCase().includes(q);
			});
			// $scope.$apply();
			console.log($scope.displayedResources);
		}


	});
})();
