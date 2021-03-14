( function () {
	const app = angular.module('cohoapp');
	app.controller('categoriesController', function ($scope, $location, $timeout, notSignedIn, loadCategories) {
		notSignedIn($location);
		var currentTimeout = null;

		loadCategories((categories) => {
			$scope.categories = categories;
			$scope.displayedCategories = categories;
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
			$scope.displayedCategories = $scope.categories.filter((cat) => {
				const q = $scope.search.toLowerCase();
				return cat.name.toLowerCase().includes(q);
			});
		}
	});
})();
