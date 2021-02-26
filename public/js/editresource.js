const mockresource = {
	categories : [ 36 ],
	contact : [
		{
			id : 1856,
			name : "Facebook page",
			typeInt : 2,
			value : "Facebook.com/LAPM8954"
		},
		{
			id : 1855,
			name : "",
			typeInt : 0,
			value : "501-548-0115"
		},
		{
			id : 1854,
			name : "",
			typeInt : 3,
			value : "501-548-6137"
		},
		{
			id : 1853,
			name : "Mike",
			typeInt : 1,
			value : "mike@anewdirection.life"
		}
	],
	counties : [ 1 ],
	description : "**Mission:**  To become a better, stronger you.  Helping kick start new lifestyles through new perspectives.  Serving prisoners described in Isaiah 61.1 and Matthew 25:31-46.\r\n\r\n**Services:**  The target population served by A New Direction is defined in scripture as “the least of these” with heavy emphasis on those in prisons who are a year away from parole and continuing through parole.\r\n\r\nWe are not a housing facility, but we will help someone find housing.\r\n\r\nWe are not a food pantry, but we will help someone find food.\r\n\r\nWe are not a clothes closet, but we will help someone find clothing.\r\n\r\nWe do not have monetary grants for rent and utilities, but we will help someone find a grant.\r\n\r\nWe use a biblical approach to Cognitive Behavioral Therapy to equip people to move away from their past.\r\n",
	documentation : "",
	hours : "",
	is : 116,
	locations : [ {
		city : "Conway",
		desc : "A New Direction 4 Life",
		id : 105,
		state : "AR",
		street1 : "PO Box 2355",
		street2 : "",
		zip : "72033-2355"
	} ],
	name : "A New Direction 4 Life",
	services : "Assistance in finding resources.",
	tags : "parole prison housing food clothes"
};

( function () {
	const app = angular.module('cohoapp');
	app.controller('editResourceController', function ($scope, $routeParams, database) {
		$scope.enabledCategories = {};
		$scope.enabledCounties = {};
		$scope.allCategories = [];
		$scope.allCounties = [];

		database.ref("categories").orderByChild('name').once("value").then((snapshot) => {
			$scope.allCategories = snapshot.val();

			$scope.enabledCategories = {};
			$scope.resource.categories.forEach((id) => {
				$scope.enabledCategories[id] = true;
			});

			$scope.$apply();
		});

		database.ref("counties").orderByChild('name').once("value").then((snapshot) => {
			$scope.allCounties = snapshot.val();

			$scope.enabledCounties = {};
			$scope.resource.counties.forEach((id) => {
				$scope.enabledCounties[id] = true;
			});

			$scope.$apply();
		});


		$scope.mockdata = mockdata;
		$scope.resource = mockresource;

		$scope.header = "New Resource";
		if ($routeParams.resourceId) {
			$scope.header = "Edit Resource";
		}

		$scope.addContact = function () {
			$scope.resource.contact.push(
				{
					id: newId($scope.resource.contact),
					name : "",
					typeInt : 0,
					value : ""
				}
			)
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
			getListOfCategories();
			getListOfCounties();
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

		const getListOfCategories = function () {
			const ids = [];
			Object.keys($scope.enabledCategories).forEach((id) => {
				if($scope.enabledCategories[id]) {
					ids.push(parseInt(id));
				}
			});

			$scope.resource.categories = ids;
		}

		const getListOfCounties = function () {
			const ids = [];
			Object.keys($scope.enabledCounties).forEach((id) => {
				if($scope.enabledCounties[id]) {
					ids.push(parseInt(id));
				}
			});

			$scope.resource.counties = ids;
		}
	});
})();
