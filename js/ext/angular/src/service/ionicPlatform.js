(function(ionic) {'use strict';

angular.module('ionic.service.platform', [])

/**
 * @ngdoc service
 * @name $ionicPlatform
 * @module ionic
 * @description
 * An angular abstraction of {@link ionic.utility:ionic.Platform}.
 *
 * Used to detect the current platform, as well as do things like override the
 * Android back button in PhoneGap/Cordova.
 */
.provider('$ionicPlatform', function() {

  return {
    $get: ['$q', '$rootScope', function($q, $rootScope) {
      return {
        /**
         * @ngdoc method
         * @name $ionicPlatform#onHardwareBackButton
         * @description
         * Some platforms have a hardware back button, so this is one way to
         * bind to it.
         * @param {function} callback the callback to trigger when this event occurs
         */
        onHardwareBackButton: function(cb) {
          ionic.Platform.ready(function() {
            document.addEventListener('backbutton', cb, false);
          });
        },

        /**
         * @ngdoc method
         * @name $ionicPlatform#offHardwareBackButton
         * @description
         * Remove an event listener for the backbutton.
         * @param {function} callback The listener function that was
         * originally bound.
         */
        offHardwareBackButton: function(fn) {
          ionic.Platform.ready(function() {
            document.removeEventListener('backbutton', fn);
          });
        },

        /**
         * @ngdoc method
         * @name $ionicPlatform#registerBackButtonAction
         * @description
         * Register a hardware back button action. Only one action will execute
         * when the back button is clicked, so this method decides which of
         * the registered back button actions has the highest priority.
         *
         * For example, if an actionsheet is showing, the back button should
         * close the actionsheet, but it should not also go back a page view
         * or close a modal which may be open.
         *
         * @param {function} callback Called when the back button is pressed,
         * if this listener is the highest priority.
         * @param {number} priority Only the highest priority will execute.
         * @param {*=} actionId The id to assign this action. Default: a
         * random unique id.
         * @returns {function} A function that, when called, will deregister
         * this backButtonAction.
         */
        registerBackButtonAction: function(fn, priority, actionId) {
          var self = this;

          if(!self._hasBackButtonHandler) {
            // add a back button listener if one hasn't been setup yet
            $rootScope.$backButtonActions = {};
            self.onHardwareBackButton(self.hardwareBackButtonClick);
            self._hasBackButtonHandler = true;
          }

          var action = {
            id: (actionId ? actionId : ionic.Utils.nextUid()),
            priority: (priority ? priority : 0),
            fn: fn
          };
          $rootScope.$backButtonActions[action.id] = action;

          // return a function to de-register this back button action
          return function() {
            delete $rootScope.$backButtonActions[action.id];
          };
        },

        /**
         * @private
         */
        hardwareBackButtonClick: function(e){
          // loop through all the registered back button actions
          // and only run the last one of the highest priority
          var priorityAction, actionId;
          for(actionId in $rootScope.$backButtonActions) {
            if(!priorityAction || $rootScope.$backButtonActions[actionId].priority >= priorityAction.priority) {
              priorityAction = $rootScope.$backButtonActions[actionId];
            }
          }
          if(priorityAction) {
            priorityAction.fn(e);
            return priorityAction;
          }
        },

        is: function(type) {
          return ionic.Platform.is(type);
        },

        /**
         * @ngdoc method
         * @name $ionicPlatform#ready
         * @description
         * Trigger a callback once the device is ready,
         * or immediately if the device is already ready.
         * @param {function} callback The function to call.
         */
        ready: function(cb) {
          var q = $q.defer();

          ionic.Platform.ready(function(){
            q.resolve();
            cb();
          });

          return q.promise;
        }
      };
    }]
  };

});

})(ionic);
