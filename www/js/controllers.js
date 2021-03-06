angular.module('starter.controllers', [])
.config(function($compileProvider){
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
})
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
.controller("PhotosController", ['$scope', '$state', '$ionicHistory', 'Camera', 'GPS', 'Physical', 'API', '$http', '$resource', '$window', function($scope, $state, $ionicHistory, Camera, GPS, Physical, API, $http, $resource, $window) {

  $ionicHistory.clearHistory();

  $scope.images = [];
  $scope.upload = Camera.upload;

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
            Physical.setPhysicals(result.features);
            Physical.setPhotoURI(imageURI);
            Physical.setPhotoGeo(longitude, latitude);
            $state.go('choices');
          }
          else {
            var physical = new API.Physical.post({geo: [longitude, latitude]}); // req.body
            physical.$save()
            .then(function(value) {
              var physicalId = value.features[0].properties.id;
              $scope.upload(imageURI, physicalId);
              $state.go('comments', {'physicalId': physicalId});
            })
            .catch(function(err) {
              // error handler;
            })
          }
        }).catch(function(error){
          console.error(error)
        });

      });
    }, function(error) {
      console.error(error);
    });
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
    $state.go('commentsList', {'physicalId': $stateParams.physicalId});
  };
})
.controller("CommentsListController", function($scope, $state, $stateParams, $ionicHistory, API) {
  $ionicHistory.clearHistory();
  $scope.comments = [];
  $scope.$on('$stateChangeStart', function() {
    $scope.getComments();
  });
  $scope.getComments = function(){
    var comment = new API.Comment.get();
    comment.$get({id: $stateParams.physicalId}).then(function(data){
      $scope.comments = data.list;
    });
  };
  $scope.newPhoto = function(){
    $state.go('photos');
  };
})
.controller("ChoicesController", function($scope, $state, API, Physical, Camera, $ionicHistory) {

  $ionicHistory.clearHistory();
  $scope.$on('$stateChangeStart', function() {
    $scope.getPhoto();
  });
  $scope.getPhoto = function() {
    $scope.images = [];
    $scope.physicals = Physical.data.physicals;
    for(var i = 0; i < $scope.physicals.length; i++) {
      var photo = new API.Photo.getbyPhysical({id: $scope.physicals[i].properties.id});
      photo.$get()
      .then(function(val) {
        var firstPhoto = val.photos[0];
        // var photoData = firstPhoto.photo;
        var photoData = firstPhoto.data;
        var photoPhysicalID = 1;
        var arrayBufferView = new Uint8Array(photoData);
        var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL( blob );
        $scope.images.push({imageUrl: imageUrl, physical: photoPhysicalID});
      }).catch(function(err){
        console.error(err);
      });
    }
    $scope.lastImageURI = Physical.data.photoURI;
  };

  $scope.back = function() {
    $state.go('photos');
  };

  $scope.upload = function(physicalId) {
    Camera.upload(Physical.data.photoURI, physicalId);
    $state.go('comments', {'physicalId': physicalId});
  };
  $scope.newPhysical = function() {
    var physical = new API.Physical.post({geo: [Physical.data.photoGeo.longitude, Physical.data.photoGeo.latitude]}); // req.body
    physical.$save()
    .then(function(value) {
      var physicalId = value.features[0].properties.id;
      $scope.upload(physicalId);
      $state.go('comments', {'physicalId': physicalId});
    })
    .catch(function(err) {
      // error handler;
    })
  };
});
