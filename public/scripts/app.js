var app = angular.module('app', []);

app.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
});

app.controller('AppCtrl', function($scope, $http, $location) {
  var convert;
  var lifts = ['squat', 'bench', 'deadlift', 'press', 'clean'];
  var liftPercent = function(v) {
    if (this.std == null) {
        return 0;
    }
    var a = this.std.untrained;
    var b = this.std.elite;
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
        $scope.unit = data.unit;
        $scope.gender = data.gender;
        $scope.weigth = data.weigth;
        for (i = 0, n = lifts.length; i < n; i++) {
          var lift = lifts[i];
          $scope[lift].reps = data[lift].reps;
          $scope[lift].value = data[lift].value;
        }
        $scope.refresh();
      });
    } else {
      $scope.refresh();
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

  convert = function(value, unit) {
    switch (unit) {
    case 'kg':
      return Math.round(value / 2.2);
    case 'lb':
      return Math.round(value * 2.2);
    default:
      return value;
    }
  };

  $scope.refresh = function(options) {
    var gender, weigth, url;

    options = options || {};
    if (options.convert) {
      $scope.weigth = convert($scope.weigth, $scope.unit);
    }

    gender = $scope.gender;
    weigth = $scope.weigth + $scope.unit;
    url = '/api/std/' + gender + '/' + weigth + '/lifts.json';
    $http.get(url).success(function(data) {
      for (lift in data) {
        $scope[lift].std = data[lift];
        if (options.convert) {
          $scope[lift].value = convert($scope[lift].value, $scope.unit);
        }
      };
    });
  };

  $scope.restore();
});
