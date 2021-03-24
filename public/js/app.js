(function () {
	var app = angular.module('cohoapp', ['ngRoute', 'ngAnimate', 'ngSanitize', 'firebase']);

	app.config(function ($routeProvider) {
		$routeProvider
			.when('/categories', {
				templateUrl: "template/categories.html",
				controller: "categoriesController"
			})
			.when('/categories/new', {
				templateUrl: "template/editcategory.html",
				controller: "editCategoryController"
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
				templateUrl: "template/editcategory.html",
				controller: "editCountyController"
			})
			.when('/counties/edit/:countyId', {
				templateUrl: "template/editcategory.html",
				controller: "editCountyController"
			})
			.when('/resources', {
				templateUrl: "template/resources.html",
				controller: "resourcesController"
			})
			.when('/resources/new', {
				templateUrl: "template/editresource.html",
				controller: "editResourceController"
			})
			.when('/resources/edit/:resourceId', {
				templateUrl: "template/editresource.html",
				controller: "editResourceController"
			})
			.when('/login', {
				templateUrl: "template/login.html",
				controller: "loginController"
			})
			.when('/signout', {
				template: "",
				controller: "signoutController"
			})
			.otherwise({
				templateUrl: "template/home.html",
				controller: "homeController"
			});
	});

	app.animation('.slide', [function() {
		return {
			// make note that other events (like addClass/removeClass)
			// have different function input parameters
			enter: function(element, doneFn) {
				jQuery(element).hide().slideDown(100, doneFn);

				// remember to call doneFn so that AngularJS
				// knows that the animation has concluded
			},

			leave: function(element, doneFn) {
				jQuery(element).slideUp(100, doneFn);
			}
		}
	}]);

	app.run(function($rootScope) {
		$rootScope.$on("$locationChangeSuccess", function () {
			$('.main').scrollTop(0);
		});
	});
})();


