angular.module('MainCtrl',[])

.controller('MainController',function($rootScope,$location,Auth){				//manipulates data received from service and give to views for rendering
	var vm = this;

	vm.loggedIn = Auth.isLoggedIn();
	$rootScope.$on('$routeChangeStart',function(){								//event listner
		vm.loggedIn = Auth.isLoggedIn();
		Auth.getUser().then(function(data){
			vm.user = data.data;
		});
	});

	vm.doLogin = function(){													//this function is put in html tag of login button	
		vm.processing = true;
		vm.error = "";
		Auth.login(vm.loginData.username,vm.loginData.password)
			.success(function(data){
				vm.processing = false;
				Auth.getUser().then(function(data){
					vm.user = data.data;
				});


				if(data.success)
					$location.path('/');
				else
					vm.error = data.message;
			});

		
	};

	vm.doLogout = function(){
		Auth.logout();
		$location.path('/logout');
	};

});