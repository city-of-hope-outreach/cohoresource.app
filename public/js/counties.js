( function () {
	const app = angular.module('cohoapp');
	app.controller('countiesController', function ($scope, $location, $timeout, notSignedIn, loadCounties) {
		notSignedIn($location);
		var currentTimeout = null;

		loadCounties((counties) => {
			$scope.counties = counties;
			$scope.displayedCounties = counties;
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
			$scope.displayedCounties = $scope.counties.filter((county) => {
				const q = $scope.search.toLowerCase();
				return county.name.toLowerCase().includes(q);
			});
		}
	});
})();
