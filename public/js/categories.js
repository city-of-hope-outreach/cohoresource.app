( function () {
	const app = angular.module('cohoapp');
	app.controller('categoriesController', function ($scope, $location, $timeout, notSignedIn, loadCategories) {
		notSignedIn($location);
		var currentTimeout = null;

		loadCategories((categories) => {
			$scope.categories = categories;
			$scope.searchFilteredCategories = categories;
			$scope.displayedCategories = categories;
			$scope.$apply();
		});

		$scope.performSearch = function(searchVal) {
			$scope.searchFilteredCategories = $scope.categories.filter((cat) => {
				const q = searchVal.toLowerCase();
				return cat.name.toLowerCase().includes(q);
			});
		};

		$scope.clearSearch = function() {
			$scope.searchFilteredCategories = $scope.categories;
		}

		$scope.renderPage = function(page) {
			$scope.displayedCategories = page;
		}
	});
})();
