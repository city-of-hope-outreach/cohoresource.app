(function () {
    const app = angular.module('cohoapp');

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

    app.directive('pagination', function($timeout) {
        /// < prev  1 |2| 3  ...  5  next >
        return {
            restrict:  'E',
            replace: true,
            templateUrl: 'template/pagination.html',
            scope: {
                items: "=",
                renderPage: "&"
            },
            link: function(scope, element) {
                const itemsOfPage = function(pageNum) {
                    const startIdx = (pageNum - 1) * itemsPerPage;
                    const endIdx = pageNum * itemsPerPage;
                    return scope.items.slice(startIdx, endIdx);
                };

                const calculatePageNums = function () {
                    if (!scope.items) {
                        return;
                    }

                    scope.numPages = Math.ceil(scope.items.length / itemsPerPage);
                    scope.pages.first = 1;
                    scope.pages.prev = scope.pages.current - 1;
                    scope.pages.next = scope.pages.current + 1;
                    scope.pages.last = scope.numPages;

                    if (scope.pages.current === 1) {
                        scope.pages.first = "";
                        scope.pages.prev = "";
                        scope.prevText = "";
                    }

                    // hide first link because the first link and the previous link go to the same spot
                    if (scope.pages.current === 2) {
                        scope.pages.first = "";
                    }

                    // hide last link because the last link and the next link go to the same spot
                    if (scope.pages.current === scope.numPages - 1) {
                        scope.pages.last = "";
                    }

                    if (scope.pages.current === scope.numPages) {
                        scope.pages.last = "";
                        scope.pages.next = "";
                        scope.nextText = "";
                    }
                };

                const itemsPerPage = 15;
                scope.pageNum = 1;
                scope.numPages = 1;

                scope.pages = {
                    first: 0,
                    prev: 0,
                    current: 1,
                    next: 0,
                    last: 0
                }

                calculatePageNums();

                scope.page = function (pageNum) {
                    scope.pages.current = pageNum;
                    calculatePageNums();
                    scope.renderPage({page: itemsOfPage(pageNum)});
                };

                scope.$watch('items', (newVal, oldVal) => {
                    if (newVal) {
                        scope.page(scope.pages.current);
                    }
                });
            }
        }
    });
})();