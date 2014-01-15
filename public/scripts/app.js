var app = angular.module('app', []);

app.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
});

app.controller('AppCtrl', function($scope, $http, $location) {
  var lifts = ['squat', 'bench', 'deadlift', 'press', 'clean'];
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

  // Init
  $scope.unit = 'kg';
  $scope.gender = 'men';
  $scope.weigth = 0;
  lifts.forEach(function(lift) {
    $scope[lift] = {
      reps: 1,
      value: 0,
      percent: liftPercent,
      val: liftValue
    };
  });

  $scope.restore = function() { // Restore user data
    var path = $location.path().split('/');
    if (path[1] == 'std' && path.length == 3) {
      $http.get('/std/' + path[2] + '.json').success(function(data) {
        var i, n;
        $scope.unit = data['unit'];
        $scope.gender = data['gender'];
        $scope.weigth = data['weigth'];
        for (i = 0, n = lifts.length; i < n; i++) {
          var lift = lifts[i];
          $scope[lift]['reps'] = data[lift]['reps'];
          $scope[lift]['value'] = data[lift]['value'];
        }
        $scope.refresh();
      });
    }
  }

  $scope.save = function() {
    var data = {
      unit: $scope.unit,
      gender: $scope.gender,
      weigth: $scope.weigth,
    };
    lifts.forEach(function(lift) {
      data[lift] = {
        reps: $scope[lift].reps,
        value: $scope[lift].value
      };
    });
    $http.post('/std', data).success(function(data, status, headers, config) {
      var id = headers('Location').split('/').pop();
      $location.path('/std/' + id);
      // window.location = headers('Location')
    });
  };

  $scope.refresh = function() {
    var gender = $scope.gender;
    var weigth = $scope.weigth + $scope.unit;
    var url = '/api/std/' + gender + '/' + weigth + '/lifts.json';
    $http.get(url).success(function(data) {
      for (lift in data) {
        for (k in data[lift]) {
          $scope[lift][k] = data[lift][k];
        }
      };
    });
  };

  $scope.restore();
});
