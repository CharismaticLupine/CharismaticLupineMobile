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
        $state.go('login')
      })
      .catch(function (error) {
        console.error(error);
      });
  }

})
.controller("PhotosController", ['$scope', '$state', '$ionicHistory', 'Camera', 'GPS', 'API', '$http', '$resource', '$window', function($scope, $state, $ionicHistory, Camera, GPS, API, $http, $resource, $window) {

  $ionicHistory.clearHistory();

  $scope.images = [];

  $scope.takePhoto = function() {
    var options = {
      quality: 75,
      targetWidth: 320,
      targetHeight: 320,
      saveToPhotoAlbum: false
    };

    Camera.getPicture(options).then(function(imageURI) {
      $scope.lastPhoto = imageURI;
      GPS.getGeo().then(function(position){
        var longitude = position.coords.longitude;
        var latitude = position.coords.latitude;
        $scope.getPhysical(longitude, latitude).then(function(result){
          if(result.features.length > 0){

          }
          else {
            var physical = new API.Physical.post({geo: [longitude, latitude]}); // req.body
            physical.$save();
            $scope.upload(imageURI);
            $state.go('comments', {'physicalId': 1});
          }
        }).catch(function(error){
          console.error(error)
        });

      });
    }, function(error) {
      console.error(error);
    });
  };

  $scope.upload = function(imageURI, physicalId) {
    physicalId = physicalId || 1;
    var ft = new FileTransfer();
    var options = new FileUploadOptions();
    options.fileKey = "photo";
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.params = {physical_id: physicalId};
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

  $scope.postPhysical = function(longitude, latitude) {
    var physical = new API.Physical.post({geo: [longitude, latitude]}); // req.body
    return physical.$save();
  };

  $scope.getPhysical = function(longitude, latitude) {
    var physical = new API.Physical.get({location: [longitude, latitude]}); // req.body
    return physical.$get();
  };

}])
.controller("CommentsController", function($scope, $state, $stateParams, $ionicHistory, API) {
  $ionicHistory.clearHistory();
  $scope.post = function(text){
    var comment = new API.Comment.post({text: text, physical: $stateParams.physicalId}); // req.body
    comment.$save();
    $state.go('commentsList', {'physicalId': 1});
  };

  $scope.clear = function() {

  };


})
.controller("CommentsListController", function($scope, $state, $stateParams, $ionicHistory, API) {
  $ionicHistory.clearHistory();
  $scope.comments = [];
  $scope.getComments = function(){
    var comment = new API.Comment.get();
    comment.$get({id: $stateParams.physicalId}).then(function(data){
      $scope.comments = data.list;
    });
  };
  $scope.newPhoto = function(){
    $state.go('photos');
  };

  $scope.getComments();
  console.log($scope.comments);


})
.controller("ChoicesController", function($scope, $state, $ionicHistory) {

  $ionicHistory.clearHistory();
  $scope.images = [];

});
