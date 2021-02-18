( function () {
	const app = angular.module('cohoapp');
	app.controller('countiesController', function ($scope) {
		$scope.mockdata = mockdata;
	});
})();
