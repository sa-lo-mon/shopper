var appControllers = angular.module('starter.controllers', []);

appControllers.controller('AppCtrl', function ($state, $scope, $ionicPopup, AuthService, AUTH_EVENTS) {
    console.log('app ctrl start');
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

appControllers.controller('DashCtrl', function ($state, $scope, $ionicPopup, $http, AuthService) {
    //TODO: continue logic!!!
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
        console.log('bla');
        AuthService.login($scope.loginData, 'default');
    };

    $scope.fbLogin = function () {
        AuthService.login($scope.loginData, 'facebook');
    };

    $scope.logout = function () {
        AuthService.logout();
    };
});

appControllers.controller('RegisterCtrl', function ($scope, $http, $state) {
    $scope.formData = {};

    $scope.sub = function () {
        console.log('form data: ', $scope.formData);
        $http.post('/register/complete', $scope.formData)
            .success(function (data) {

                console.log('posted successfully ', data);

                //redirect to 'categories' page
                $state.go('categories');
            })
            .error(function (err) {
                console.error('error in posting registration details: ', err);
                //TODO: show error message
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
            console.log('categories: ', $scope.categories);
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
        console.log('params: ', params);

        $http.post('/categories/complete', params)
            .success(function (data) {
                console.log('data: ', data);

                //redirect to 'main' page
                $state.go('tab.malls');
            })
            .error(function (data) {
                console.error('error in posting categories/complete ', data);
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
        GeoAlert.getDistance(unorderedMalls.data.data).then(function (data, err) {
            if (data) {
                Malls.set(data);
                $scope.malls = data;
                console.log('MallsCtrl data: ', data);
            } else {
                $scope.malls = unorderedMalls;
                console.log('MallsCtrl data else: ', data);
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
        if (err)console.log('error: ', err);
        else {
            console.log("my sales - data", data.data.data);
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
            console.log('sales: ', data);
            $scope.sales = data.data.data;
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
            console.log('mall sales: ', data);
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
            console.log("salesCtrlDetails: ", data);
            $scope.sale = data;
        }
    });
});


appControllers.controller('MallSaleDetailsCtrl', function ($scope, $stateParams, Malls) {

});