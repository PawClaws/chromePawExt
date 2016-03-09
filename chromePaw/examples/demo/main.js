/*global angular, paw, Paw, Train , Hammer */
angular.module('demo', [])
    .controller('demoCtrl', function($scope) {
        window.paw = new Paw();
        paw.showTouches = true;
        paw.setDefaultTouchLocation('500px 300px');
        Train.mixFunctionInto(paw, 'demo', function(done) {
            this.tap().wait(500)
                .doubleTap().wait(300)
                .swipeUp().wait(1000)
                .swipeUp().wait(1000)
                .swipeUp().wait(1000)
                .swipeDown()
                .swipeDown()
                .wait(1000)
                .doubleTap().wait()
                .swipeUp().wait(1000)
                .pinchOut().wait(1000)
                .pinchOut().wait(1000)
                .pinchIn().wait(1000)
                .pinchIn().wait(1000)
                .tap().wait(1000)
                .doubleTap()
                .then(function() {
                    alert('Done');
                })
                .then(done);
        });

        $scope.m = {
        };

        $scope.fn = {
        };
        var hammer = new Hammer(window.vw);

        hammer.on('swipe', function(ev) {
            var gesture = ev.gesture;
            var dist = -gesture.deltaY;
            window.vw.scrollTop += dist;
        });

        hammer.on('doubletap', function() {
            window.vw.style.zoom = window.vw.style.zoom || 1;
            window.vw.style.zoom = window.vw.style.zoom === 1 ? 2 : 1;
        });

        hammer.on('pinch', function(ev) {
            var gesture = ev.gesture;
            window.clearTimeout(window.debounce);
            window.debounce = setTimeout(function() {
                //console.log('setting zoom to',gesture.scale);
                window.vw.style.zoom = gesture.scale;
            }, 20);
        });

        hammer.on('wheel', function(ev) {
            window.vw.scrollTop += ev.deltaY;
        });
    });
