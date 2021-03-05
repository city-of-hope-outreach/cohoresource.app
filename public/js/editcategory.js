( function () {
	const app = angular.module('cohoapp');
	app.controller('editCategoryController', function ($scope, $location, notSignedIn, $routeParams, database) {
		notSignedIn($location);

		$scope.loading = false;
		$scope.saveBtnText = "SAVE";
		$scope.success = false;
		$scope.errmsg = "";

		$scope.org = "category";
		$scope.icons = ['categories/book', 'categories/businessperson1', 'categories/businessperson2',
			'categories/businessperson3', 'categories/businessperson4', 'categories/car',
			'categories/disability', 'categories/dollarsign', 'categories/education', 'categories/family',
			'categories/fax', 'categories/gears', 'categories/handheart', 'categories/heart',
			'categories/house1', 'categories/location', 'categories/phone', 'categories/plug',
			'categories/search', 'categories/shirt', 'categories/squares', 'categories/tornado',
			'categories/veteran'];

		$scope.header = "New Category";
		$scope.category = {};

		if ($routeParams.categoryId) {
			$scope.header = "Loading...";
			$scope.loading = true;

			firebase.database().ref(`categories/${$routeParams.categoryId}`).once("value").then((snapshot) => {
				$scope.category = snapshot.val();
				$scope.header = "Edit Category";
				$scope.loading = false;
				$scope.$apply();
			});
		}

		$scope.saveCategory = function () {
			$scope.loading = true;
			$scope.saveBtnText = "SAVING...";
			$scope.success = false;
			$scope.errmsg = "";

			const category = angular.copy($scope.category);

			if ($routeParams.categoryId) {
				database.ref(`categories/${$routeParams.categoryId}`).set(category)
					.then(() => {
						$('.main').scrollTop(0);
						$scope.loading = false;
						$scope.saveBtnText = "SAVE";
						$scope.success = true;
						$scope.$apply();
					})
					.catch((error) => {
						$('.main').scrollTop(0);
						if (error) {
							$scope.errmsg = error.message;
						} else {
							$scope.errmsg = "An unknown error occurred.";
						}
						$scope.$apply();
					});
			} else {
				const newRef = database.ref(`counties`).push();
				newRef.set(category).then(() => {
					$('.main').scrollTop(0);
					$scope.header = "Edit Resource";
					$scope.loading = false;
					$scope.saveBtnText = "SAVE";
					$scope.success = true;
					$scope.$apply();
				}).catch((error) => {
					$('.main').scrollTop(0);
					if (error) {
						$scope.errmsg = error.message;
					} else {
						$scope.errmsg = "An unknown error occurred.";
					}
					$scope.$apply();
				});
			}
		}
	});
})();
