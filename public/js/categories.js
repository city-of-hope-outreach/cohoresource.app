( function () {
	const app = angular.module('cohoapp');
	app.controller('categoriesController', function ($scope, loadCategories) {
		loadCategories((categories) => {
			$scope.categories = categories;
			$scope.$apply();
		});
	});
})();
