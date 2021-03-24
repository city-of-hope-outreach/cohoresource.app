( function () {
	const app = angular.module('cohoapp');
	app.controller('resourcesController', function ($scope, $location, $timeout, database, notSignedIn, loadResources) {
		notSignedIn($location);

		// TODO set up pagination
		loadResources((resources) => {
			$scope.resources = resources;
			$scope.displayedResources = [];
			$scope.$apply();
		});

		$scope.performSearch = function(searchVal) {
			$scope.displayedResources = $scope.resources.filter((res) => {
				const q = searchVal.toLowerCase();
				return res.name.toLowerCase().includes(q);
			});
		};

		$scope.clearSearch = function() {
			$scope.displayedResources = $scope.resources;
		}

		$scope.renderPage = function(page) {
			$scope.displayedResources = page;
		}

	});
})();
