( function () {
	const app = angular.module('cohoapp');
	app.controller('homeController', function ($scope, database) {
		database.ref("categories").orderByChild('name').once("value").then((snapshot) => {
			$scope.categories = snapshot.val();
			$scope.$apply();
		});

		database.ref("resources").orderByChild('name').once("value").then((snapshot) => {
			$scope.resources = snapshot.val();
			$scope.$apply();
		});
	});
})();
