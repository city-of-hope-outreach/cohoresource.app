var mockdata = {
	categories: [
		{ name: "Category 1", id: 1 },
		{ name: "Category 2", id: 2 },
		{ name: "Category 3", id: 3 },
		{ name: "Category 4", id: 4 },
		{ name: "Category 5", id: 5 },
		{ name: "Category 6", id: 6 },
		{ name: "Category 7", id: 7 }
	],
	counties: [
		{ name: "County 1", id: 1 },
		{ name: "County 2", id: 2 },
		{ name: "County 3", id: 3 },
		{ name: "County 4", id: 4 },
		{ name: "County 5", id: 5 },
		{ name: "County 6", id: 6 },
		{ name: "County 7", id: 7 }
	],
	resources: [
		{ name: "Resource 1", id: 1 },
		{ name: "Resource 2", id: 2 },
		{ name: "Resource 3", id: 3 },
		{ name: "Resource 4", id: 4 },
		{ name: "Resource 5", id: 5 },
		{ name: "Resource 6", id: 6 },
		{ name: "Resource 7", id: 7 }
	]
};

(function () {
	var app = angular.module('cohoapp', ['ngRoute']);

	app.config(function ($routeProvider) {
        $routeProvider
            .when('/categories', {
                templateUrl: "template/categories.html",
                controller: "categoriesController"
            })
            .when('/categories/new', {
                templateUrl: "template/editcategory.html",
                controller: "newCategoryController"
            })
            .when('/categories/edit/:categoryId', {
                templateUrl: "template/editcategory.html",
				controller: "editCategoryController"
            })
			.when('/counties', {
				templateUrl: "template/counties.html",
				controller: "countiesController"
			})
			.when('/counties/new', {
				templateUrl: "template/editcounty.html",
				controller: "newCountyController"
			})
			.when('/counties/edit/:categoryId', {
				templateUrl: "template/editcounty.html",
				controller: "editCountyController"
			})
            .when('/resources', {
                templateUrl: "template/resources.html",
				controller: "resourcesController"
            })
            .when('/resources/new', {
                templateUrl: "template/editresource.html",
				controller: "newResourceController"
            })
            .when('/resources/edit/:resourceId', {
                templateUrl: "template/editresource.html",
				controller: "editResourceController"
            })
            .otherwise({
                templateUrl: "template/home.html",
				controller: "homeController"
            });
    });
})();
