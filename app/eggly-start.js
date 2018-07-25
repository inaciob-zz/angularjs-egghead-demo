angular.module('Eggly', [
])
.controller('MainCtrl', function($scope) {
	// TODO: Update so that $scope references are removed, use cleaner vm syntax
	$scope.categories = [
		{"id": 0, "name": "Development"},
		{"id": 1, "name": "Design"},
		{"id": 2, "name": "Humour"}
	];

	$scope.bookmarks = [
		{"id": 0, "title": "AngularJS", "url": "http://angularjs.org", "category": "Development"},
		{"id": 1, "title": "Egghead", "url": "https://egghead.io", "category": "Development"},
		{"id": 2, "title": "A List Apart", "url": "http://alistapart.com", "category": "Design"},
		{"id": 3, "title": "Wimp", "url": "http://wimp.com", "category": "Humour"},
		{"id": 4, "title": "Dump", "url": "http://dump.com", "category": "Humour"}
	];

	$scope.currentCategory = null;

	var setCurrentCategory = (category) => {
		$scope.currentCategory = category;
	};

	var isCurrentCategory = (category) => {
		return $scope.currentCategory !== null && category.name === $scope.currentCategory.name;
	}

	$scope.setCurrentCategory = setCurrentCategory;
	$scope.isCurrentCategory = isCurrentCategory;
});
