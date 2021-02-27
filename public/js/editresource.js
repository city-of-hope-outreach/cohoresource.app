( function () {
	const app = angular.module('cohoapp');
	app.controller('editResourceController', function ($scope, $routeParams, database, loadCategories, loadCounties) {
		$scope.enabledCategories = {};
		$scope.enabledCounties = {};
		$scope.allCategories = [];
		$scope.allCounties = [];
		$scope.resource = {};

		loadCategories((categories) => {
			$scope.allCategories = categories;
			$scope.enabledCategories = convertArrayToEnabledDict($scope.resource.categories);
			$scope.$apply();
		});

		loadCounties((counties) => {
			$scope.allCounties = counties;
			$scope.enabledCounties = convertArrayToEnabledDict($scope.resource.counties);
			$scope.$apply();
		});

		$scope.header = "New Resource";
		if ($routeParams.resourceId) {
			$scope.header = "Edit Resource";

			firebase.database().ref(`resources/${$routeParams.resourceId}`).once("value").then((snapshot) => {
				$scope.resource = snapshot.val();
				$scope.enabledCategories = convertArrayToEnabledDict($scope.resource.categories);
				$scope.enabledCounties = convertArrayToEnabledDict($scope.resource.counties);
				$scope.$apply();
			});
		}

		$scope.addContact = function () {
			$scope.resource.contact.push({
				id: newId($scope.resource.contact),
				name: "",
				typeInt: 0,
				value: ""
			})
		}

		$scope.deleteContact = function(contact) {
			const index = $scope.resource.contact.indexOf(contact);
			$scope.resource.contact.splice(index, 1);
		}

		$scope.addAddress = function () {
			$scope.resource.locations.push({
				id: newId($scope.resource.locations),
				city : "",
				desc : "",
				state : "",
				street1 : "",
				street2 : "",
				zip : ""
			});
		};

		$scope.deleteAddress = function (address) {
			const index = $scope.resource.locations.indexOf(address);
			$scope.resource.locations.splice(index, 1);
		}

		$scope.cancel = function () {
			// route back
		}

		$scope.saveResource = function () {
			$scope.resource.categories = convertEnabledDictToArray($scope.enabledCategories);
			$scope.resource.counties = convertEnabledDictToArray($scope.enabledCounties);
			// console.log($scope.resource);
		}

		const newId = function (array) {
			var contactIds = [];
			array.forEach((e) => {
				contactIds.push(e.id);
			});

			var newId = 0;
			while (contactIds.indexOf(newId) !== -1) {
				newId++;
			}

			return newId;
		};

		const convertEnabledDictToArray = function(enabledDict) {
			const ids = [];
			Object.keys(enabledDict).forEach((id) => {
				if(enabledDict[id]){
					ids.push(parseInt(id));
				}
			});

			return ids;
		}

		const convertArrayToEnabledDict = function (arr) {
			const enabledDict = {};
			if (arr) {
				arr.forEach((id) => {
					enabledDict[id] = true;
				});
			}

			return enabledDict;
		}
	});
})();
