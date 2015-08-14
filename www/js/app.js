// Ionic Starter App

angular.module('starter', ['ionic', "ngCordova", 'starter.controllers', 'starter.services'])

.run(function($rootScope, $location, Auth, $ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
  $rootScope.$on('$routeChangeStart', function (evt, next, current) {
    if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
      $location.path('/login');
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $compileProvider) {
  $stateProvider
    .state("login", {
      url: "/login",
      templateUrl: "templates/login.html",
      controller: "LoginController",
      cache: false
    })
    .state("photos", {
      url: "/photos",
      templateUrl: "templates/photos.html",
      controller: "PhotosController"
    })
    .state("comments", {
      url: "/comments",
      templateUrl: "templates/comments.html",
      controller: "CommentsController"
    })
    .state("choices", {
      url: "/choices",
      templateUrl: "templates/choices.html",
      controller: "ChoicesController"
    });
  $urlRouterProvider.otherwise('/login');
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
})
.factory('AttachTokens', function ($window) {
  // this is an $httpInterceptor
  // its job is to stop all out going request
  // then look in local storage and find the user's token
  // then add it to the header so the server can validate the request
  return {
    request: function (object) {
      var jwt = $window.localStorage.getItem('com.shortly');
      if (jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
});
