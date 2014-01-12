var app = angular.module('app', []);

app.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
});

app.controller('AppCtrl', function($scope, $http, $location) {
  $scope.unit = $location.search().unit || 'kg';
  $scope.gender = $location.search().gender || 'men';
  $scope.weigth = parseInt($location.search().weigth, 10) || 0;

  $scope.percent = function(lift) {
    if (typeof lift === 'undefined' || lift === null) {
      return 0;
    }
    return lift.value * 100 / lift.elite;
  }

  $scope.lifts = ['squat', 'bench', 'deadlift', 'press', 'clean'];

  $scope.reload = function() {
    $scope.lifts.forEach(function(lift) {
      var gender = $scope.gender;
      var weigth = $scope.weigth + $scope.unit;
      var url = '/api/std/' + gender + '/' + weigth + '/' + lift  + '.json';
      $http.get(url).success(function(data) {
        for (k in data) {
          $scope[lift][k] = data[k];
        }
      });
    });
  };

  $scope.lifts.forEach(function(lift) {
    $scope[lift] = {
      value: parseInt($location.search()[lift], 10) || 0
    };
  });
  $scope.reload();
});
