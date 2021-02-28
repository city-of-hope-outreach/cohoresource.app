( function () {
	const app = angular.module('cohoapp');
	app.controller('countiesController', function ($scope, $location, notSignedIn, loadCounties) {
		notSignedIn($location);

		loadCounties((counties) => {
			$scope.counties = counties;
			$scope.$apply();
		});
	});
})();
