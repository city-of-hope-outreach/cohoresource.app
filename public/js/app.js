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

	app.directive('search', function($timeout, $window) {
		return {
			restrict: 'E',
			replace: true,
			template: '<form ng-submit="submit()" name="searchForm">' +
				'<input type="text" placeholder="SEARCH" ng-model="search" ng-change="searchChanged()">' +
				'<div class="clearSearch" ng-show="search" ng-click="searchCleared()"><span class="fas fa-times"></span></div>' +
				'</form>',
			scope: {
				doSearch: '&',
				clearSearch: '&'
			},
			link: function(scope) {
				var currentTimeout = null;
				scope.search = "";

				// allow user to press ESC to clear search
				$($window).off('keydown.searchEsc');
				$($window).on('keydown.searchEsc', (e) => {
					if (e.key === 'Escape' && scope.search) {
						scope.searchCleared();
						scope.$apply();
						e.preventDefault();
					}
				});

				// make sure we remove listener
				scope.$on('$destroy', () => {
					$($window).off('keydown.searchEsc');
				});

				// called when user makes a change in the text box.
				// we are waiting 1 second before doing search
				scope.searchChanged = function () {
					$timeout.cancel(currentTimeout);
					currentTimeout = $timeout(()=> {
						scope.doSearch({searchVal: scope.search});
					}, 1000);
				};

				// do search without waiting if enter is pressed
				scope.submit = function () {
					scope.doSearch({searchVal:scope.search});
				};

				// clear search
				scope.searchCleared = function () {
					// clear search field immediately
					scope.search = "";

					// run controller's clearSearch() asyncronously
					$timeout(() => {
						scope.clearSearch();
					});
				};
			}
		}
	});

	app.directive('checkbox', function(){
		return {
			restrict: 'EA',
			require: 'ngModel',
			replace: true,
			template: '<span class="g-checkbox-row">' +
				'<span class="g-checkbox"><i class="fas fa-check"></i></span>' +
				'{{label}}' +
				'<input id="{{id}}" type="checkbox" style="display: none" ng-checked="ngModel"/>' +
				'</span>',
			scope: {
				id: '@',
				ngModel: '='
			},
			link: function(scope, element, attrs, ngModelController){
				var render = function() {
					if (scope.ngModel) {
						element.addClass('checked');
					} else {
						element.removeClass('checked');
					}
				}

				if (attrs.label) {
					scope.label = attrs.label;
				} else {
					scope.label = "";
				}

				element.removeAttr('id');
				element.bind('click', function(){
					scope.$apply(function () {
						scope.ngModel = !scope.ngModel;
						ngModelController.$setViewValue(scope.ngModel);
						render();
					});
				});

				ngModelController.$render = function() {
					scope.$evalAsync(render);
				}
			}
		};
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


