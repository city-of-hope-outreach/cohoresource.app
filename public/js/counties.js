( function () {
	const app = angular.module('cohoapp');
	app.controller('countiesController', function ($scope, loadCounties) {
		loadCounties((counties) => {
			$scope.counties = counties;
			$scope.$apply();
		});
	});
})();
