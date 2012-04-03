/*!
 * jCarousel Ajax Plugin v@VERSION
 * http://sorgalla.com/jcarousel/
 *
 * Copyright 2011, Jan Sorgalla
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * or GPL Version 2 (http://www.opensource.org/licenses/gpl-2.0.php) licenses.
 *
 * Date: @DATE
 */
jCarousel.plugin('loader', function($) {
    var jCarousel = this;

    return {
        options: {
            placeholder: function(index) {
                return '<li class="jcarousel-loader-placeholder"></li>';
            },
            load: function(first, last, type, ready) {
            },
            size: null,
            locked: false
        },
        _init: function() {
            this.carousel()
                ._bind('reload.' + this.pluginName, jCarousel.proxy(this.reload, this))
                ._bind('scroll.' + this.pluginName, jCarousel.proxy(this.scroll, this));

            this.init();
        },
        init: function() {
            if (!this.option('locked')) {
                this._load(0, 'init');
            }

            return this;
        },
        reload: function() {
            if (!this.option('locked')) {
                this._load(this.carousel().first().index(), 'reload');
            }

            return this;
        },
        scroll: function(e, carousel, target) {
            if (!this.option('locked')) {
                var parsed = jCarousel.parseTarget(target),
                    index  = parsed.target;

                if (parsed.relative) {
                    index = carousel.first().index() + parsed.target;
                } else {
                    if (typeof index === 'object') {
                        index = index.index();
                    }
                }

                this._load(index, 'scroll');
            }

            return this;
        },
        _prepare: function(from) {
            var placeholder = this.option('placeholder'),
                carousel = this.carousel(),
                items    = carousel.items(),
                clip     = carousel._clipping(),
                first    = null,
                last     = Math.min(carousel.last() ? carousel.last().index() : 0, from),
                wh       = 0,
                isPh     = false,
                size     = this.option('size'),
                curr;

            while (true) {
                if (size !== null && last > size) {
                    break;
                }

                curr = items.eq(last);
                isPh = false;

                if (curr.size() === 0) {
                    curr = $(placeholder.call(this, last)).appendTo(carousel.list());
                    isPh = true;
                }

                if (isPh && first === null) {
                    first = last;
                }

                if (last >= from) {
                    wh += carousel._dimension(curr);

                    if (wh >= clip) {
                        break;
                    }
                }

                last++;
            }

            if (first === null) {
                return null;
            }

            carousel._reload();

            return [first, last];

        },
        _load: function(from, type) {
            var range = this._prepare(from);

            if (range !== null) {
                var carousel = this.carousel(),
                    ready    = jCarousel.proxy(carousel.reload, carousel);

                this.option('load').apply(this, range.concat(type, ready));
            }
        }
    };
});
