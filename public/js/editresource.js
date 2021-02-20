( function () {
	const app = angular.module('cohoapp');
	app.controller('editResourceController', function ($scope, $routeParams) {
		$scope.mockdata = mockdata;

		$scope.header = "New Resource";
		if ($routeParams.resourceId) {
			$scope.header = "Edit Resource";
		}
	});
})();
