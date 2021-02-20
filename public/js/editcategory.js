( function () {
	const app = angular.module('cohoapp');
	app.controller('editCategoryController', function ($scope, $routeParams) {
		$scope.icons = ['book', 'businessperson1', 'businessperson2',
			'businessperson3', 'businessperson4', 'car', 'disability', 'dollarsign',
			'education', 'family', 'fax', 'gears', 'handheart', 'heart', 'house1',
			'location', 'phone', 'plug', 'search', 'shirt', 'squares', 'tornado',
			'veteran'];

		$scope.header = "New Category";
		if ($routeParams.categoryId) {
			$scope.header = "Edit Category";
		}
	});
})();
