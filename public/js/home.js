( function () {
	const app = angular.module('cohoapp');
	app.controller('homeController', function ($scope, $location, notSignedIn, loadCategories, loadRecentResources) {
		notSignedIn($location);

		loadCategories((categories) => {
			$scope.categories = categories;
			$scope.$apply();
		});

		loadRecentResources((resources) => {
			$scope.resources = resources;
			$scope.$apply();
		});
	});
})();
