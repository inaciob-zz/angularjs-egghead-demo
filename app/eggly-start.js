(function() {
	'use strict';

	angular.module('Eggly', [
	])
	.controller('MainCtrl', MainCtrl);

	function MainCtrl() {
		var vm = this;

		// Set variables
		vm.categories = [
			{"id": 0, "name": "Development"},
			{"id": 1, "name": "Design"},
			{"id": 2, "name": "Humour"}
		];

		vm.bookmarks = [
			{"id": 0, "title": "AngularJS", "url": "http://angularjs.org", "category": "Development"},
			{"id": 1, "title": "Egghead", "url": "https://egghead.io", "category": "Development"},
			{"id": 2, "title": "A List Apart", "url": "http://alistapart.com", "category": "Design"},
			{"id": 3, "title": "Wimp", "url": "http://wimp.com", "category": "Humour"},
			{"id": 4, "title": "Dump", "url": "http://dump.com", "category": "Humour"}
		];

		vm.currentCategory = null;
		// Create and Edit states
		vm.isCreating = false;
		vm.isEditing = false;
		vm.startCreating = startCreating;
		vm.cancelCreating = cancelCreating;
		vm.startEditing = startEditing;
		vm.cancelEditing = cancelEditing;
		vm.shouldShowCreating = shouldShowCreating;
		vm.shouldShowEditing = shouldShowEditing;


		var setCurrentCategory = (category) => {
			vm.currentCategory = category;

			cancelCreating();
			cancelEditing();
		};

		var isCurrentCategory = (category) => {
			return vm.currentCategory !== null && category.name === vm.currentCategory.name;
		}

		function startCreating() {
			vm.isCreating = true;
			vm.isEditing = false;
		}

		function cancelCreating() {
			vm.isCreating = false;
		}

		function startEditing() {
			vm.isCreating = false;
			vm.isEditing = true;
		}

		function cancelEditing() {
			vm.isEditing = false;
		}

		function shouldShowCreating() {
			return vm.currentCategory && !vm.isEditing;
		}

		function shouldShowEditing() {
			return vm.isEditing && !vm.isCreating;
		}

		vm.setCurrentCategory = setCurrentCategory;
		vm.isCurrentCategory = isCurrentCategory;
	}
})();