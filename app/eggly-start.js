(function() {
	'use strict';

	angular.module('Eggly', [
	])
	.controller('MainCtrl', function ($scope, $timeout, $window) {
		var vm = this;

		// Set variables
		var database = firebase.firestore();
	  	const firestore = database;
  		const settings = {timestampsInSnapshots: true};
  		firestore.settings(settings);

		vm.init = init;
		vm.categories = [];
		vm.bookmarks = [];
		vm.currentCategory = null;
		vm.editedBookmark = null;
		// Create and Edit states
		vm.isCreating = false;
		vm.isEditing = false;
		vm.startCreating = startCreating;
		vm.cancelCreating = cancelCreating;
		vm.startEditing = startEditing;
		vm.cancelEditing = cancelEditing;
		vm.shouldShowCreating = shouldShowCreating;
		vm.shouldShowEditing = shouldShowEditing;
		vm.createBookmark = createBookmark;
		vm.resetCreateForm = resetCreateForm;
		vm.setEditedBookmark = setEditedBookmark;
		vm.updateBookmark = updateBookmark;
		vm.isSelectedBookmark = isSelectedBookmark;
		vm.deleteBookmark = deleteBookmark;
		vm.reloadChanges = reloadChanges;

		function init() {
			// Read in data from firebase for specified collections
			var collections = ["categories", "bookmarks"];

			angular.forEach(collections, function(key) {
				database.collection(key).get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
        				vm[key].push(doc.data());
    				});
					
					// This exists due to changes from firebase occuring outside of angular which are not automatically updated in view
					// TODO: Clean this up so that $scope is not used
					$scope.$apply();
				});
			});
		}
		init();

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

			resetCreateForm();
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

		// TODO: Remove reloads to see changes triggered outside of Angular
		function reloadChanges() {
			$timeout(function(){ 
		    	$window.location.reload();
			});
		}

		/**********/
		/* CRUD section */
		/**********/
		function resetCreateForm() {
			vm.newBookmark = {
				title: '',
				url: '',
				category: vm.currentCategory.name
			}
		}

		function createBookmark(bookmark) {
			// NOTE: Custom document ID is treated as a string here due to firebase not accepting plain integers
			database.collection("bookmarks").doc("" + vm.bookmarks.length + "").set({
				category: vm.currentCategory.name,
				title: bookmark.title,
				url: bookmark.url
			})
			.then(function() {
			    console.log("Document successfully written!");
			    reloadChanges();
			})
			.catch(function(error) {
			    console.error("Error writing document: ", error);
			});

			resetCreateForm();
		}

		function setEditedBookmark(bookmark) {
			vm.editedBookmark = angular.copy(bookmark);
		}

		function updateBookmark(bookmark) {
			let currDocId = database._firestoreClient.localStore.targetIdGenerator.previousId + 1;
			var docReference = database.collection("bookmarks").doc("" + currDocId + "");
			
			return docReference.update({
			    title: bookmark.title,
				url: bookmark.url
			})
			.then(function() {
			    console.log("Document successfully updated!");
			    reloadChanges();
			})
			.catch(function(error) {
			    // The document probably doesn't exist.
			    console.error("Error updating document: ", error);
			});

			vm.editedBookmark = null;
			vm.isEditing = false;
		}

		function isSelectedBookmark(bookmarkId) {
			return vm.editedBookmark !== null && vm.editedBookmark.id === bookmarkId;
		}

		function deleteBookmark() {
			let prevDocId = database._firestoreClient.localStore.targetIdGenerator.previousId;

			database.collection("bookmarks").doc("" + (prevDocId + 1) + "").delete().then(function() {
			    console.log("Document successfully deleted!");
			    reloadChanges();
			}).catch(function(error) {
			    console.error("Error removing document: ", error);
			});
		}			
	});
})();