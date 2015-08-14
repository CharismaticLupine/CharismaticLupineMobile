angular.module('starter.controllers', [])
.controller("LoginController", function($scope, $window, $state, Auth) {

  $scope.login = function(username, password) {
    var user = {
      username: username,
      password: password
    };
    Auth.signin(user)
      .then(function (token) {
        $window.localStorage.setItem('com.shortly', token);
        $state.go('photos');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.register = function(username, password) {
    var user = {
      username: username,
      password: password
    };
    Auth.signup(user)
      .then(function (token) {
        $window.localStorage.setItem('com.shortly', token);
        $state.go('photos')
      })
      .catch(function (error) {
        console.error(error);
      });
  }

})
.controller("PhotosController", ['$scope', '$state', '$ionicHistory', 'Camera', function($scope, $state, $ionicHistory, Camera) {

  $ionicHistory.clearHistory();

  $scope.images = [];

  $scope.upload = function() {
    Camera.getPicture().then(function(data) {
      console.log(data);
      $state.go('comments');
    }, function(error) {
      console.error(error);
    });
  };

  $scope.geo = function () {
    var geoOptions = { timeout: 30000, enableHighAccuracy: true };
    $cordovaGeolocation.getCurrentPosition(geoOptions).then(function(data) {
      $state.go('choices');
    }, function (error){
      console.error(error);
    });
  }

}])
.controller("CommentsController", function($scope, $state, $ionicHistory) {
  $ionicHistory.clearHistory();

  $scope.post = function(comment){
    console.log(comment);
    $state.go('photos');
  };

  $scope.clear = function() {

  };


})
.controller("ChoicesController", function($scope, $state, $ionicHistory) {

  $ionicHistory.clearHistory();
  $scope.images = [];

});