angular.module('starter.services', ['ngResource'])
  .factory('Auth', function ($http, $location, $window) {
    // Don't touch this Auth service!!!
    // it is responsible for authenticating our user
    // by exchanging the user's username and password
    // for a JWT from the server
    // that JWT is then stored in localStorage as 'com.shortly'
    // after you signin/signup open devtools, click resources,
    // then localStorage and you'll see your token from the server
    var signin = function (user) {

      return $http({
        method: 'POST',
        url: 'http://10.0.3.2:8000/users/signin',
        data: JSON.stringify(user)
      })
        .then(function (resp) {
          return resp.data.token;
        });
    };

    var signup = function (user) {
      return $http({
        method: 'POST',
        url: 'http://10.0.3.2:8000/users/signup',
        data: JSON.stringify(user)
      })
        .then(function (resp) {
          return resp.data.token;
        });
    };

    var isAuth = function () {
      return !!$window.localStorage.getItem('com.shortly');
    };

    var signout = function () {
      $window.localStorage.removeItem('com.shortly');
      $location.path('/login');
    };


    return {
      signin: signin,
      signup: signup,
      isAuth: isAuth,
      signout: signout
    };
  })
  .factory('Camera', ['$cordovaCamera', function($cordovaCamera) {

    return {
      getPicture: function(options) {
        return $cordovaCamera.getPicture(options);
      }
    };
  }])
  .factory('GPS', ['$cordovaGeolocation', function($cordovaGeolocation) {
    return {
      getGeo: function(options) {
        options = options || { timeout: 30000, enableHighAccuracy: true };

        return $cordovaGeolocation.getCurrentPosition(options);
      }
    }
  }])
  .factory('API', ['$q', '$resource', function($q, $resource) {
    return {
      Photo: {
        post: $resource('http://10.0.3.2:8000/photo/'),
        get: $resource('http://10.0.3.2:8000/photo/:id', {id:'@id'})
      },
      Physical: {
        get: $resource('http://10.0.3.2:8000/physical/:location', {location:'@location'}),
        getAll: $resource('http://10.0.3.2:8000/physical/'),
        post: $resource('http://10.0.3.2:8000/physical/')
      },
      Comment: {
        post: $resource('http://10.0.3.2:8000/comments/'),
        get: $resource('http://10.0.3.2:8000/comments/:id', {id: '@id'})
      }
    }
  }]);