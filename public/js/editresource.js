( function () {
	const app = angular.module('cohoapp');

	const emptyContact = {
		id: 0,
		name: "",
		typeInt: 0,
		value: ""
	}

	const emptyLoc = {
		id: 0,
		city : "",
		desc : "",
		state : "",
		street1 : "",
		street2 : "",
		zip : ""
	};

	app.controller('editResourceController', function ($scope, $location, notSignedIn, $routeParams, database, loadCategories, loadCounties) {
		notSignedIn($location);

		$scope.loading = false;
		$scope.saveBtnText = "SAVE";
		$scope.success = false;
		$scope.errmsg = "";

		$scope.enabledCategories = {};
		$scope.enabledCounties = {};
		$scope.allCategories = [];
		$scope.allCounties = [];
		$scope.resource = {
			categories: [],
			counties: [],
			contact: [angular.copy(emptyContact)],
			locations: [angular.copy(emptyLoc)]
		};

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

		// load in resource if we're editing it
		$scope.header = "New Resource";
		if ($routeParams.resourceId) {
			$scope.header = "Loading...";
			$scope.loading = true;

			firebase.database().ref(`resources/${$routeParams.resourceId}`).once("value").then((snapshot) => {
				$scope.resource = snapshot.val();
				$scope.enabledCategories = convertArrayToEnabledDict($scope.resource.categories);
				$scope.enabledCounties = convertArrayToEnabledDict($scope.resource.counties);
				$scope.loading = false;
				$scope.header = "Edit Resource";
				$scope.$apply();
			});
		}

		$scope.addContact = function () {
			const newCont = angular.copy(emptyContact);
			newCont.id = newId($scope.resource.contact);
			$scope.resource.contact.push(newCont);
		}

		$scope.deleteContact = function(contact) {
			const index = $scope.resource.contact.indexOf(contact);
			$scope.resource.contact.splice(index, 1);
		}

		$scope.addAddress = function () {
			const newLoc = angular.copy(emptyLoc);
			newLoc.id = newId($scope.resource.locations);
			$scope.resource.locations.push(newLoc);
		};

		$scope.deleteAddress = function (address) {
			const index = $scope.resource.locations.indexOf(address);
			$scope.resource.locations.splice(index, 1);
		}

		$scope.cancel = function () {
			$location.path("/resources");
		}

		$scope.saveResource = function () {
			$scope.loading = true;
			$scope.saveBtnText = "SAVING...";
			$scope.success = false;
			$scope.errmsg = "";
			$scope.resource.categories = convertEnabledDictToArray($scope.enabledCategories);
			$scope.resource.counties = convertEnabledDictToArray($scope.enabledCounties);

			cleanupContacts();
			cleanupLocations();

			const res = angular.copy($scope.resource);

			// check if we're creating brand new resource or not
			if ($routeParams.resourceId) {
				database.ref(`resources/${$routeParams.resourceId}`).set(res)
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
				const newRef = database.ref(`resources`).push();
				newRef.set(res).then(() => {
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

		const cleanupContacts = function () {
			const emptyContacts = [];
			$scope.resource.contact.forEach((cont) => {
				cont.name = cont.name.trim();
				cont.value = cont.value.trim();
				if (cont.name.length === 0 && cont.value.length === 0) {
					emptyContacts.push(cont);
				}
			});

			emptyContacts.forEach((cont) => {
				$scope.deleteContact(cont);
			});
		}

		const cleanupLocations = function () {
			const emptyLocs = [];
			$scope.resource.locations.forEach((loc) => {
				loc.desc = loc.desc.trim();
				loc.street1 = loc.street1.trim();
				loc.street2 = loc.street2.trim();
				loc.city = loc.city.trim();
				loc.state = loc.state.trim();
				loc.zip = loc.zip.trim();

				if (loc.desc.length === 0 && loc.street1.length === 0 && loc.street2.length === 0 && loc.city.length === 0 &&
					loc.state.length === 0 && loc.zip.length === 0) {
					emptyLocs.push(loc);
				}
			});

			emptyLocs.forEach((loc) => {
				$scope.deleteAddress(loc);
			});
		}
	});
})();
