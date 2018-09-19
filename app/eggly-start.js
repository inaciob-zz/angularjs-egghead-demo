(function() {
	'use strict';

	angular.module('Eggly', ['angular-toArrayFilter'])
	.controller('MainCtrl', function ($scope, $timeout, $window) {
		var vm = this;

		// Set variables
		var database = firebase.firestore();
	  	const firestore = database;
  		const settings = {timestampsInSnapshots: true};
  		firestore.settings(settings);

  		vm.formInvalid = false;
		vm.init = init;
		vm.categories = [];
		vm.bookmarks = [];
		vm.currentCategory = null;
		vm.editedBookmark = null;
		vm.menuExpanded = false;
		vm.toggleMenuExpanded = toggleMenuExpanded;
		// Create and Edit states
		vm.isCreating = false;
		vm.isEditing = false;
		vm.clearEditStyles = clearEditStyles;
		vm.startCreating = startCreating;
		vm.cancelCreating = cancelCreating;
		vm.startEditing = startEditing;
		vm.cancelEditing = cancelEditing;
		vm.shouldShowCreating = shouldShowCreating;
		vm.shouldShowEditing = shouldShowEditing;
		vm.displayChanges = displayChanges;
		vm.resetCreateForm = resetCreateForm;
		vm.createBookmark = createBookmark;
		vm.setEditedBookmark = setEditedBookmark;
		vm.updateBookmark = updateBookmark;
		vm.isSelectedBookmark = isSelectedBookmark;
		vm.deleteBookmark = deleteBookmark;

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

		function toggleMenuExpanded() {
			return vm.menuExpanded;
		}

		var setCurrentCategory = (category) => {
			vm.currentCategory = category;

			clearEditStyles();
			cancelCreating();
			cancelEditing();
		};

		var isCurrentCategory = (category) => {
			return vm.currentCategory !== null && category.name === vm.currentCategory.name;
		}

		function clearEditStyles() {
			vm.editedBookmark = null;
			var bookmarkContainers = document.querySelectorAll('.bookmark');
			for (var i = 0; i < bookmarkContainers.length; i++) {
				bookmarkContainers[i].classList.remove('active');
			}
		}

		function startCreating() {
			vm.isCreating = true;
			vm.isEditing = false;

			resetCreateForm();
		}

		function cancelCreating() {
			vm.isCreating = false;
			vm.formInvalid = false;
		}

		function startEditing() {
			vm.isCreating = false;
			vm.isEditing = true;
		}

		function cancelEditing() {
			vm.isEditing = false;
			clearEditStyles();
		}

		function shouldShowCreating() {
			return vm.currentCategory && !vm.isEditing;
		}

		function shouldShowEditing() {
			return vm.isEditing && !vm.isCreating;
		}

		vm.setCurrentCategory = setCurrentCategory;
		vm.isCurrentCategory = isCurrentCategory;

		function displayChanges() {
			$timeout(function(){ 
		    	var collections = ["bookmarks"];

				angular.forEach(collections, function(key) {
					database.collection(key).get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							// Make sure no duplicates exist before inserting next document
							if(!angular.toJson(vm[key]).includes(angular.toJson(doc.data()))) {
								vm[key].push(doc.data());
							}						
	    				});

	    				$scope.$apply();
					});
				});
			}, 0);
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
			if(vm.currentCategory.name && (!angular.isUndefined(bookmark))) {
				if(bookmark.title && bookmark.url) {
					// NOTE: Custom document ID is treated as a string here due to firebase not accepting plain integers
					database.collection("bookmarks").doc("" + vm.bookmarks.length + "").set({
						category: vm.currentCategory.name,
						title: bookmark.title,
						url: bookmark.url
					})
					.then(function() {
					    console.log("Document successfully written!");
					    displayChanges();
					})
					.catch(function(error) {
					    console.error("Error writing document: ", error);
					});
				}
				else {
					if(!bookmark.title || !bookmark.url) {
						vm.formInvalid = true;
						return vm.formInvalid;
					}
				}
			}
			else {
				vm.formInvalid = true;
				return vm.formInvalid;
			}

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
			    displayChanges();
			})
			.catch(function(error) {
			    // The document probably doesn't exist.
			    console.error("Error updating document: ", error);
			});

			vm.editedBookmark = null;
			vm.isEditing = false;
		}

		function isSelectedBookmark(bookmarkTitle) {
			return vm.editedBookmark !== null && vm.editedBookmark.title === bookmarkTitle;
		}

		function deleteBookmark() {
			let prevDocId = database._firestoreClient.localStore.targetIdGenerator.previousId;

			database.collection("bookmarks").doc("" + (prevDocId + 1) + "").delete().then(function() {
			    console.log("Document successfully deleted!");
			    displayChanges();
			}).catch(function(error) {
			    console.error("Error removing document: ", error);
			});
		}			
	});
})();