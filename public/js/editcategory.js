( function () {
	const app = angular.module('cohoapp');
	app.controller('editCategoryController', function ($scope, $location, notSignedIn, $routeParams, database, uniqueKey) {
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
				// get a unique number for this category
				// (trying to make new category creation compatible
				//  with our legacy data structure)
				uniqueKey('categories', id => {
					category.id = id;

					const newRef = database.ref(`categories`).push();
					newRef.set(category).then(() => {
						$location.path(`/categories/edit/${newRef.key}`);
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
				});
			}
		}

		$scope.deleteCategory = function() {
			if (!$routeParams.categoryId) {
				$location.path('/categories/');
				return;
			}

			if (!window.confirm(`Are you sure you want to delete ${$scope.category.name}? This cannot be undone.`)) {
				return;
			}

			$scope.loading = true;
			$scope.saveBtnText = "DELETING...";
			$scope.success = false;
			$scope.errmsg = "";

			database.ref(`/categories/${$routeParams.categoryId}`).remove().then(() => {
				$location.path('/categories/');
				$scope.$apply();
			});
		}
	});
})();
