( function () {
	const app = angular.module('cohoapp');
	app.controller('countiesController', function ($scope, database) {
		database.ref("counties").orderByChild('name').once("value").then((snapshot) => {
			$scope.counties = snapshot.val();
			$scope.$apply();
		});
	});
})();
