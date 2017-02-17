var tag = {};
var NFCtagId="";

function bin2String(array) {
  return String.fromCharCode.apply(String, array);
}

angular.module('T2TApp', ['ionic', 'nfcFilters','ngCordova'])
.controller("MainCtrl",function ($scope, nfcService, $state){
  $scope.tag = nfcService.tag;
  console.log("Main Controller says: Hello World");
  $scope.selectChoice = function() {
    $state.go("artistprofile");
  }
})
.controller("ArtistCtrl",function($scope, $ionicPopup, $state, $http){
  if (NFCtagId == ""){
    NFCtagId="12345"
  }

  //alert(tag.id);
  var artist = {};
  $scope.artist= artist;
  artist.name="...";
  artist.title="...";
  artist.description="...";
  artist.followers="...";
  artist.rating="...";
  artist.pictureUrl="#";

  NFCtagIdAcc = [12345, 123456, 1234567]
  var rand = NFCtagIdAcc[Math.floor(Math.random() * NFCtagIdAcc.length)];

  $http.get("https://3dwrnlwk97.execute-api.us-east-1.amazonaws.com/dev/artist/"+ rand)
    .then(
      function successCall(res){
        console.log(JSON.stringify(res, null, 4));
        var baseProfile=res.data.Item.profile.M;
        artist.name=baseProfile.username.S;
        artist.title=baseProfile.title.S;
        artist.description=baseProfile.description.S;
        artist.followers=baseProfile.followers.N;
        artist.rating=baseProfile.rating.N;
        artist.pictureUrl=baseProfile.pictureUrl.S;
      },
      function errorCall(res){
        console.log("There was an error retrieving the artist's tag")
      }
  );

  $scope.confirmationAlert = function() {
     var alertPopup = $ionicPopup.confirm({
       title: 'Tip Artist',
       template: 'Are you sure you want to tip Artist?'
     });

     alertPopup.then(function(res) {
       if (res) {
         $state.go("confirmation");
       } else {
         $state.go("main");
       }
     });
   };
  console.log("Artist Controller says: Hello World");
})
.controller("ConfirmCtrl",function($scope,$ionicPopup, $state){
  $scope.starRating = 4;
  $scope.hoverRating = 0;

  $scope.click = function (param) {
      console.log('Click');
  };

  $scope.mouseHover = function (param) {
      console.log('mouseHover(' + param + ')');
      $scope.hoverRating = param;
  };

  $scope.mouseLeave = function (param) {
      console.log('mouseLeave(' + param + ')');
      $scope.hoverRating = param + '*';
  };

  $scope.popupAlert = function() {
     var alertPopup = $ionicPopup.alert({
       title: 'Feedback sent!',
       template: 'Thank you for supporting local street artists!'
     });

     alertPopup.then(function(res) {
       //go back to home page
       $state.go("main");
     });
   };
   console.log("Confirmation Controller says: Hello World");
})

.controller("FeedbackCtrl",function(){
  console.log("Feedback Controller says: Hello World");
})
.factory('nfcService', function ($rootScope, $ionicPlatform, $state) {
    $ionicPlatform.ready(function() {
      var nfc = { addNdefListener: function () {} };
      nfc.addNdefListener(function (nfcEvent) {
          console.log(JSON.stringify(nfcEvent.tag, null, 4));
          NFCtagId=bin2String(nfcEvent.tag.ndefMessage[0].payload).substring(3);

          $rootScope.$apply(function(){
              angular.copy(nfcEvent.tag, tag);
              alert("Looking for artist info " + NFCtagId);
              $state.go("artistprofile")
          });
      }, function () {
          console.log("Listening for NDEF Tags.");
      }, function (reason) {
          alert("Error adding NFC Listener " + reason);
      });
    });
    return {
      tag: tag,
      clearTag: function () {
          angular.copy({}, this.tag);
      }
    };
})
.directive('starRating', function () {
    return {
        scope: {
            rating: '=',
            maxRating: '@',
            readOnly: '@',
            click: "&",
            mouseHover: "&",
            mouseLeave: "&"
        },
        restrict: 'EA',
        template:
            "<div style='display: inline-block; margin: 0px; padding: 0px; cursor:pointer;' ng-repeat='idx in maxRatings track by $index'> \
                    <img ng-src='{{((hoverValue + _rating) <= $index) && \"http://www.codeproject.com/script/ratings/images/star-empty-lg.png\" || \"http://www.codeproject.com/script/ratings/images/star-fill-lg.png\"}}' \
                    ng-Click='isolatedClick($index + 1)' \
                    ng-mouseenter='isolatedMouseHover($index + 1)' \
                    ng-mouseleave='isolatedMouseLeave($index + 1)'></img> \
            </div>",
        compile: function (element, attrs) {
            if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
                attrs.maxRating = '5';
            };
        },
        controller: function ($scope, $element, $attrs) {
            $scope.maxRatings = [];

            for (var i = 1; i <= $scope.maxRating; i++) {
                $scope.maxRatings.push({});
            };

            $scope._rating = $scope.rating;

			$scope.isolatedClick = function (param) {
				if ($scope.readOnly == 'true') return;

				$scope.rating = $scope._rating = param;
				$scope.hoverValue = 0;
				$scope.click({
					param: param
				});
			};

			$scope.isolatedMouseHover = function (param) {
				if ($scope.readOnly == 'true') return;

				$scope._rating = 0;
				$scope.hoverValue = param;
				$scope.mouseHover({
					param: param
				});
			};

			$scope.isolatedMouseLeave = function (param) {
				if ($scope.readOnly == 'true') return;

				$scope._rating = $scope.rating;
				$scope.hoverValue = 0;
				$scope.mouseLeave({
					param: param
				});
			};
        }
    };
})
.config(function($stateProvider, $urlRouterProvider){
  //basic navigation
  $stateProvider

  .state('main', {
    url: "/main",
    templateUrl: "templates/main.html",
    controller: 'MainCtrl'
  })
  .state('artistprofile', {
    url: "/artistprofile",
    templateUrl: "templates/artistprofile.html",
    controller: 'ArtistCtrl'
  })
  .state('confirmation', {
    url: "/confirmation",
    templateUrl: "templates/confirmation.html",
    controller: 'ConfirmCtrl'
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/main');
});
