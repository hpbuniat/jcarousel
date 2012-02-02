/*!
 * jCarousel Swipe Plugin v@VERSION
 * http://sorgalla.com/jcarousel/
 *
 * Copyright 2011, Jan Sorgalla
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * or GPL Version 2 (http://www.opensource.org/licenses/gpl-2.0.php) licenses.
 *
 * Date: @DATE
 */

(function(jCarousel, window) {
    var document = window.document,
        isTouch = "ontouchstart" in window,
        eventNames = {
            start: (isTouch ? 'touchstart' : 'mousedown'),
            move:  (isTouch ? 'touchmove'  : 'mousemove'),
            stop:  (isTouch ? 'touchend'   : 'mouseup')
        };

    jCarousel.plugin('swipe', function($) {
        var jCarousel = this;

        return {
            started:   false,
            moved:     false,
            startX:    null,
            startY:    null,
            startPos:  null,
            startTime: null,
            width:     0,
            onMove:    jCarousel.noop,
            _init: function() {
                this.carousel().element()
                    .bind(eventNames.start + '.' + this.pluginName, jCarousel.proxy(this._start, this))
                    .bind(eventNames.stop  + '.' + this.pluginName,  jCarousel.proxy(this._stop, this));

                this.onMove = jCarousel.proxy(this._move, this);
                $(document).bind(eventNames.move + '.' + this.pluginName, this.onMove);
            },
            _destroy: function() {
                $(document).unbind(eventNames.move + '.' + this.pluginName, this.onMove);
            },
            _start: function(e) {
                e.stopPropagation();
                e.preventDefault();

                this._dispatchEvent(e, 'mousedown');

                var carousel = this.carousel();

                if (carousel.animating) {
                    return this;
                }

                // Mark as animating to prevent interaction from plugins
                carousel.animating = true;

                var touches = this._getTouches(e);

                this.started   = true;
                this.moved     = false;
                this.startPos  = parseFloat(carousel.list().css(carousel.lt)) || 0;
                this.startX    = touches[0].pageX;
                this.startY    = touches[0].pageY;
                this.startTime = Number(new Date());

                var width  = 0,
                    margin = 0,
                    // Remove right/bottom margin from total width
                    lrb    = carousel.vertical ?
                                'bottom' :
                                (carousel.rtl ? 'left'  : 'right');

                carousel.items().each(function() {
                    var el = $(this);
                    width += carousel._dimension(el);
                    margin = el.css('margin-' + lrb);
                });

                this.width = width - (parseFloat(margin) || 0);

                return this;
            },
            _stop: function(e) {
                var moved = this.moved,
                    carousel = this.carousel(),
                    touches = this._getTouches(e),
                    distance = carousel.vertical ?
                                   this.startY - touches[0].pageY :
                                   this.startX - touches[0].pageX,
                    startTime = this.startTime;

                this.started = this.moved = false;
                this.startPos = this.startX = this.startY = this.startTime = null;

                carousel.animating = false;

                if (!moved) {
                    this._dispatchEvent(e, 'mouseup');
                    this._dispatchEvent(e, 'click');
                    return this;
                }

                var scrollNearest  = function() {
                        var self    = this,
                            items   = this.items(),
                            pos     = parseFloat(this.list().css(this.lt)) || 0,
                            current = items.eq(0),
                            stop    = false,
                            stop2   = false,
                            lrb     = this.vertical ? 'bottom' : (this.rtl ? 'left'  : 'right'),
                            width;

                        if (this.rtl && !this.vertical) {
                            pos = (pos + this.list().width() - this._clipping()) * -1;
                        }

                        items.each(function() {
                            if (stop2) {
                                return false;
                            }

                            var el  = $(this),
                                dim = self._dimension(el);

                            pos += dim;
                            current = el;

                            if (stop) {
                                if (distance > 0) {
                                    current = el;
                                }

                                stop2 = true;
                                return false;
                            }

                            if (pos >= 0) {
                                if (Number(new Date()) - startTime < 250) {
                                    if (distance > 0) {
                                        stop = true;
                                    } else {
                                        stop2 = true;
                                        return false;
                                    }
                                } else {
                                    width = dim - (parseFloat(el.css('margin-' + lrb)) || 0);

                                    if ((Math.abs(pos) - dim + (width / 2)) <= 0) {
                                        stop = true;
                                    } else {
                                        stop2 = true;
                                        return false;
                                    }
                                }
                            }
                        });

                    this.scroll(current);
                };

                if (carousel.rtl && !carousel.vertical) {
                    var right = parseFloat(carousel.list().css('right')) || 0;

                    if (right > 0) {
                        carousel.scroll(0);
                    } else if (!carousel.circular && right < -(this.width - carousel._clipping())) {
                        carousel.scroll(-1);
                    } else {
                        scrollNearest.apply(carousel);
                    }
                } else {
                    var left = parseFloat(carousel.list().css(carousel.lt)) || 0;

                    if (left > 0) {
                        carousel.scroll(0);
                    } else if (!carousel.circular && left < -(this.width - carousel._clipping())) {
                        carousel.scroll(-1);
                    } else {
                        scrollNearest.apply(carousel);
                    }
                }

                return this;
            },
            _move: function(e) {
                if (!this.started) {
                    return this;
                }

                var touches = this._getTouches(e);

                // Ensure swiping with one touch and not pinching
                if (touches.length > 1 || e.scale && e.scale !== 1) {
                    return this;
                }

                var carousel = this.carousel(),
                    element  = carousel.element(),
                    x        = touches[0].pageX,
                    y        = touches[0].pageY,
                    offset   = element.offset(),
                    width    = jCarousel.outerWidth(element),
                    height   = jCarousel.outerHeight(element),
                    left     = offset.left,
                    right    = left + width,
                    top      = offset.top,
                    bottom   = top + height;

                // Check if we are inside the element
                if (x <= left || x >= right || y <= top || y >= bottom) {
                    return this._stop(e);
                }

                this.moved = true;

                var distance = carousel.vertical ? this.startY - y :  this.startX - x,
                    list = carousel.list(),
                    clip = carousel._clipping(),
                    pos = parseFloat(list.css(carousel.rtl && !carousel.vertical ? 'right' : carousel.lt)) || 0,
                    slowdown = 0;

                if (pos > 0) {
                    slowdown = pos * .75;
                } else if (pos < -(this.width - clip)) {
                    slowdown = (pos + (this.width - clip)) * .75;
                }

                if (carousel.rtl && !carousel.vertical) {
                    slowdown *= -1;
                }

                carousel.list()
                    .css(carousel.lt, (this.startPos - distance - slowdown) + 'px');

                return this;
            },
            _getTouches: function(e) {
                if (!isTouch) {
                    return [e];
                }

                if (e.originalEvent) {
                    if (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length > 0) {
                        return e.originalEvent.changedTouches;
                    }

                    if (e.originalEvent.touches && e.originalEvent.touches.length > 0) {
                        return e.originalEvent.touches;
                    }
                }

                if (e.changedTouches && e.changedTouches.length > 0) {
                    return e.changedTouches;
                }

                return e.touches;
            },
            _dispatchEvent: function(e, name) {
                if (!isTouch) {
                    return;
                }

                var touch = this._getTouches(e)[0],
                    target = this._getRootNode(touch.target),
                    event = document.createEvent('MouseEvent');

                event.initMouseEvent(name, true, true, touch.view, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
                target.dispatchEvent(event);
            },
            _getRootNode: function(target) {
                while (target.nodeType !== 1) {
                    target = target.parentNode;
                }

                return target;
            }
        };
    });
})(jCarousel, window);
