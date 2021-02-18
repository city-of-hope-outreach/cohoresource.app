( function () {
	const app = angular.module('cohoapp');
	app.controller('categoriesController', function ($scope) {
		$scope.mockdata = mockdata;
	});
})();
