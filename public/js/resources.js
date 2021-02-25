( function () {
	const app = angular.module('cohoapp');
	app.controller('resourcesController', function ($scope, database) {
		database.ref("resources").orderByChild('name').once("value").then((snapshot) => {
			$scope.resources = snapshot.val();
			$scope.$apply();
		});
		$scope.mockdata = mockdata;
	});
})();
