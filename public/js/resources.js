( function () {
	const app = angular.module('cohoapp');
	app.controller('resourcesController', function ($scope) {
		$scope.mockdata = mockdata;
	});
})();
