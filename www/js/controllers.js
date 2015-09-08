var appControllers = angular.module('starter.controllers', []);

appControllers.controller('AppCtrl', function ($state, $scope, $ionicPopup, AuthService, AUTH_EVENTS) {
    $scope.username = AuthService.userName();

    $scope.$on(AUTH_EVENTS.notAuthorized, function (event) {
        var alertPopup = $ionicPopup.alert({
            title: 'Unauthorized',
            template: 'You are not allowed to access this resource'
        });
    });

    $scope.$on(AUTH_EVENTS.notAuthenticated, function (event) {
        AuthService.logout();
        $state.go('login');
        var alertPopup = $ionicPopup.alert({
            title: 'Session lost!',
            template: 'Please login again.'
        });
    });

    $scope.SetCurrentUsername = function (name) {
        $scope.username = name;
    }
});

appControllers.controller('Login2Ctrl', function ($state, $scope, $ionicPopup, AuthService) {
    $scope.data = {};
    $scope.login = function (data) {
        AuthService.login(data.username, data.password).then(function (auth) {
            $state.go('main.dash', {}, {reload: true});
            $scope.setCurrentUsername(data.username);

        }, function (err) {
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials.'
            });
        })
    }
});

appControllers.controller('ChatsCtrl', function ($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
        Chats.remove(chat);
    };
});

appControllers.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
});

appControllers.controller('AccountCtrl', function ($scope) {
    $scope.settings = {
        enableFriends: true
    };
});

appControllers.controller('LoginCtrl', function ($state, $scope, $http, $ionicPopup, AuthService) {

    $scope.loginData = {};

    $scope.login = function () {
        AuthService.login($scope.loginData, 'default');
    };

    $scope.fbLogin = function () {
        AuthService.login($scope.loginData, 'facebook');
    };

    $scope.logout = function () {
        AuthService.logout();
    };
});

appControllers.controller('RegisterCtrl', function ($scope, $http, $state, $ionicPopup) {
    $scope.formData = {};

    $scope.sub = function () {
        $http.post('/register/complete', $scope.formData)
            .success(function (data) {

                //redirect to 'categories' page
                $state.go('categories');
            })
            .error(function (err) {
                $ionicPopup.alert({
                    title: 'Registration Error!',
                    template: err
                });
            });
    }
});

appControllers.controller('CategoriesCtrl', function ($scope, $http, $state, $ionicPopup, AuthService, Categories) {
    $scope.userModel = AuthService.getUserModel();

    Categories.all().then(function (data, err) {
        if (err) {
            $ionicPopup.alert({
                title: 'Categories failed!',
                template: err
            });
        } else {
            $scope.categories = data;
        }
    });

    $scope.getCategories = function () {
        return $scope.userModel.categories;
    };

    $scope.check = function (value, checked) {

        var idx = $scope.userModel.categories.indexOf(value);

        if (idx >= 0 && !checked) {
            $scope.userModel.categories.splice(idx, 1);
        }

        if (idx < 0 && checked) {
            $scope.userModel.categories.push(value);
        }
    };

    $scope.sub = function () {
        if (!$scope.userModel.email) {
            $scope.userModel = AuthService.getUserModel();
        }
        var params = {
            email: $scope.userModel.email,
            categories: $scope.userModel.categories
        };


        $http.post('/categories/complete', params)
            .success(function (data) {

                //redirect to 'main' page
                $state.go('tab.malls');
            })
            .error(function (data) {
                $ionicPopup.alert({
                    title: 'Categories failed!',
                    template: 'Error in posting categories/complete'
                });
            });
    };
});

appControllers.controller('MallsCtrl', function ($scope, Malls, GeoAlert) {
    $scope.malls = {};
    Malls.all().then(function (unorderedMalls, error) {
        GeoAlert.getDistance(unorderedMalls).then(function (data, err) {
            if (data) {
                $scope.malls = data;

            } else {
                $scope.malls = unorderedMalls;
            }
        });
    });

    $scope.remove = function (mall) {
        Malls.remove(mall);
    }
});

appControllers.controller('MySalesCtrl', function ($scope, MySales) {
    $scope.mysales = {};

    MySales.all().then(function (data, err) {
        if (err) {
            console.log('error: ', err);
        } else {
            $scope.mysales = data.data.data;
        }
    });

    $scope.remove = function (sale) {
        $scope.mysales.splice($scope.mysales.indexOf(sale), 1);
        MySales.remove(sale);
    }
});

appControllers.controller('SalesCtrl', function ($scope, $stateParams, Malls, Sales, MySales) {
    $scope.sales = {};

    Sales.all().then(function (data, err) {
        if (err || !data) {
            console.log('error: ', err);
        } else {
            $scope.sales = data;
        }
    });

    $scope.add = function (sale) {
        MySales.add(sale);
    };
});

appControllers.controller('MallSalesCtrl', function ($scope, $stateParams, Malls, MySales) {

    $scope.currentMallId = $stateParams.mallId;
    $scope.sales = {};

    Malls.getMallSales($stateParams.mallId).then(function (data, err) {
        if (err || !data) {
            console.log('error: ', err);
        } else {
            $scope.sales = data.data.data;
        }
    });

    $scope.add = function (sale) {
        MySales.add(sale);
    }
});

appControllers.controller('SaleDetailsCtrl', function ($scope, $stateParams, Sales) {
    $scope.sale = {};
    Sales.get($stateParams.saleId).then(function (data, err) {
        if (err || !data) {
            console.log('error: ', err);
        } else {
            $scope.sale = data;
        }
    });
});