( function () {
	const app = angular.module('cohoapp');
	app.controller('categoriesController', function ($scope, $location, notSignedIn, loadCategories) {
		notSignedIn($location);

		loadCategories((categories) => {
			$scope.categories = categories;
			$scope.$apply();
		});
	});
})();
