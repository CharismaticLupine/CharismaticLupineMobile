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
  .factory('Camera', ['$cordovaCamera', '$window', function($cordovaCamera, $window) {
    var getPicture = function(options) {
        return $cordovaCamera.getPicture(options);
      };

    var upload = function(imageURI, physicalId) {
      physicalId = physicalId || 1;
      var ft = new FileTransfer();
      var options = new FileUploadOptions();
      options.fileKey = "photo";
      options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
      options.mimeType = "image/jpeg";
      options.params = {physical: physicalId};
      options.chunkedMode = false;
      options.headers = {
        'x-access-token': $window.localStorage.getItem('com.shortly')
      };
      ft.upload(imageURI, "http://10.0.3.2:8000/photo", function(r) {
        console.log("Code = " + r.responseCode);
        console.log("Response = " + r.response);
        console.log("Sent = " + r.bytesSent);
      }, function(error) {
        alert("An error has occurred: Code = " + error.code);
        console.log("upload error source " + error.source);
        console.log("upload error target " + error.target);
      }, options);
    };
    return {
      getPicture: getPicture,
      upload: upload
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
  .factory('Physical',[function() {
    var data = {
      physicals: [],
      photoURI: "",
      photoGeo: {
        latitude: "",
        longitude: ""
      }
    };
    var setPhysicals = function(physicals) {
      data.physicals = physicals;
    };
    var setPhotoURI = function(photoURI) {
      data.photoURI = photoURI;
    };
    var setPhotoGeo = function(longitude, latitude) {
      data.photoGeo.longitude = longitude;
      data.photoGeo.latitude = latitude;
    };
    return {
      data: data,
      setPhysicals: setPhysicals,
      setPhotoURI: setPhotoURI,
      setPhotoGeo: setPhotoGeo
    };
  }])
  .factory('API', ['$q', '$resource', function($q, $resource) {
    return {
      Photo: {
        post: $resource('http://10.0.3.2:8000/photo/'),
        get: $resource('http://10.0.3.2:8000/photo/:id', {id:'@id'}),
        getbyPhysical: $resource('http://10.0.3.2:8000/photo/byPhysical/:id', {id:'@id'})
      },
      Physical: {
        get: $resource('http://10.0.3.2:8000/physical/:location', {location:'@location'}),
        getById: $resource('http://10.0.3.2:8000/physical/id/:id', {id:'@id'}),
        getAll: $resource('http://10.0.3.2:8000/physical/'),
        post: $resource('http://10.0.3.2:8000/physical/')
      },
      Comment: {
        post: $resource('http://10.0.3.2:8000/comments/'),
        get: $resource('http://10.0.3.2:8000/comments/:id', {id: '@id'})
      }
    }
  }]);
