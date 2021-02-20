( function () {
	const app = angular.module('cohoapp');
	app.controller('editCountyController', function ($scope, $routeParams) {
		$scope.icons = ['faulkner', 'pulaski', 'conway'];

		$scope.header = "New County";
		if ($routeParams.countyId) {
			$scope.header = "Edit County";
		}
	});
})();
