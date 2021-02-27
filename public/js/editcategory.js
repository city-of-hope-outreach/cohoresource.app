( function () {
	const app = angular.module('cohoapp');
	app.controller('editCategoryController', function ($scope, $routeParams, database) {
		$scope.org = "category";
		$scope.icons = ['categories/book', 'categories/businessperson1', 'categories/businessperson2',
			'categories/businessperson3', 'categories/businessperson4', 'categories/car',
			'categories/disability', 'categories/dollarsign', 'categories/education', 'categories/family',
			'categories/fax', 'categories/gears', 'categories/handheart', 'categories/heart',
			'categories/house1', 'categories/location', 'categories/phone', 'categories/plug',
			'categories/search', 'categories/shirt', 'categories/squares', 'categories/tornado',
			'categories/veteran'];

		$scope.header = "New Category";
		$scope.category = {};

		if ($routeParams.categoryId) {
			$scope.header = "Edit Category";

			firebase.database().ref(`categories/${$routeParams.categoryId}`).once("value").then((snapshot) => {
				$scope.category = snapshot.val();
				$scope.$apply();
			});
		}

		$scope.saveCategory = function () {

		};
	});
})();
