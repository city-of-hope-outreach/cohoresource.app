( function () {
	const app = angular.module('cohoapp');
	app.controller('countiesController', function ($scope, $location, $timeout, notSignedIn, loadCounties) {
		notSignedIn($location);

		loadCounties((counties) => {
			$scope.counties = counties;
			$scope.searchFilteredCounties = counties;
			$scope.displayedCounties = [];
			$scope.$apply();
		});

		$scope.performSearch = function(searchVal) {
			$scope.searchFilteredCounties = $scope.counties.filter((county) => {
				const q = searchVal.toLowerCase();
				return county.name.toLowerCase().includes(q);
			});
		};

		$scope.clearSearch = function() {
			$scope.searchFilteredCounties = $scope.counties;
		}

		$scope.renderPage = function (page) {
			$scope.displayedCounties = page;
		}
	});
})();
