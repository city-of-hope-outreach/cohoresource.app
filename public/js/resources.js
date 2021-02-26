( function () {
	const app = angular.module('cohoapp');
	app.controller('resourcesController', function ($scope, loadResources) {
		// TODO set up pagination
		loadResources((resources) => {
			$scope.resources = resources;
			$scope.$apply();
		});
	});
})();
