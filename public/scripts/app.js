var app = angular.module('app', []);

app.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
});

app.controller('AppCtrl', function($scope, $http, $location) {
  var liftPercent = function() {
    var a = this.untrained;
    var b = this.elite;
    var v = this.val();
    return Math.max(Math.min(-100 * (v - a) / (a - b), 100), 0);
  };

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

  $scope.lifts = ['squat', 'bench', 'deadlift', 'press', 'clean'];

  $scope.reload = function() {
    var gender = $scope.gender;
    var weigth = $scope.weigth + $scope.unit;
    var url = '/api/std/' + gender + '/' + weigth + '/lifts.json';
    $http.get(url).success(function(lifts) {
      for (lift in lifts) {
        for (k in lifts[lift]) {
          $scope[lift][k] = lifts[lift][k];
        }
      };
    });
  };

  $scope.lifts.forEach(function(lift) {
    $scope[lift] = {
      reps: parseInt(localStorage.getItem(lift + ':reps'), 10) || 1,
      value: parseInt(localStorage.getItem(lift + ':value'), 10) || 0,
      percent: liftPercent,
      val: liftValue
    };
  });
  $scope.reload();
});
