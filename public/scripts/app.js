var app = angular.module('app', []);

app.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
});

app.controller('AppCtrl', function($scope, $http, $location) {
  var liftValue = function() {
    var r = Math.max(this.reps, 1);
    var w = this.value;
    return Math.round(w * 36 / (37 - r)); // Brzycki formula
  };

  $scope.unit = localStorage.getItem('unit') || 'kg';
  $scope.gender = localStorage.getItem('gender') || 'men';
  $scope.weigth = parseInt(localStorage.getItem('weigth'), 10) || 0;

  $scope.save = function() {
    localStorage.setItem('unit', $scope.unit);
    localStorage.setItem('gender', $scope.gender);
    localStorage.setItem('weigth', $scope.weigth);
    $scope.lifts.forEach(function(lift) {
      localStorage.setItem(lift + ':reps', $scope[lift].reps);
      localStorage.setItem(lift + ':value', $scope[lift].value);
    });
  };

  $scope.percent = function(lift) {
    if (typeof lift === 'undefined' || lift === null) {
      return 0;
    }
    return Math.min(lift.val() * 100 / lift.elite, 100);
  };

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
      reps: parseInt(localStorage.getItem(lift + ':reps'), 10) || 1,
      value: parseInt(localStorage.getItem(lift + ':value'), 10) || 0,
      val: liftValue
    };
  });
  $scope.reload();
});
