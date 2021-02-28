( function () {
	const app = angular.module('cohoapp');
	app.controller('homeController', function ($scope, $location, notSignedIn, loadCategories, loadResources) {
		notSignedIn($location);

		loadCategories((categories) => {
			$scope.categories = categories;
			$scope.$apply();
		});

		loadResources((resources) => {
			$scope.resources = resources;
			$scope.$apply();
		});
	});
})();
