( function () {
	const app = angular.module('cohoapp');
	app.controller('categoriesController', function ($scope, database) {
		database.ref("categories").orderByChild('name').once("value").then((snapshot) => {
			$scope.categories = snapshot.val();
			$scope.$apply();
		});
	});
})();
