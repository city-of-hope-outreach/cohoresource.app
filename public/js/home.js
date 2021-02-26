( function () {
	const app = angular.module('cohoapp');
	app.controller('homeController', function ($scope, loadCategories, loadResources) {
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
