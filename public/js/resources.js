( function () {
	const app = angular.module('cohoapp');
	app.controller('resourcesController', function ($scope, $location, notSignedIn, loadResources) {
		notSignedIn($location);

		// TODO set up pagination
		loadResources((resources) => {
			$scope.resources = resources;
			$scope.$apply();
		});
	});
})();
