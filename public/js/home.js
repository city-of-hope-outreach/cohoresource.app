( function () {
	const app = angular.module('cohoapp');
	app.controller('homeController', function ($scope) {
		$scope.mockdata = mockdata;
	});
})();
