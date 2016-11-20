/*eslint-env browser, jquery */
/*global adsbygoogle:true */
/**
* Common web helpers.
* @module
* @external $
* @external adsbygoogle
* @return {Object} Public functions / variables
*/

/*eslint-disable no-unused-vars*/
var appModule = (function () {
    /*eslint-enable no-unused-vars*/
    'use strict';



    /**
    * Load a Google drive spreadsheet as JSON object
    * https://developers.google.com/gdata/samples/spreadsheet_sample
    *
    * @param {string} key Google drive ID of the spreadsheet
    * @param {integer} [worksheet] Spreadsheet page starting from 1
    * @param {string} [feed] Feed type, list or cells
    * @return {object} jquery deferred
    */
    var loadData = function (key, worksheet, feed) {

        var url,
        cors = 'https://',
        mode = 'values', //values / basic
        type = 'json',
        row = {},
        rows = [];

        // Default worksheet id
        if (!worksheet > 0) {
            worksheet = 1;
        }
        //default feed
        if (feed !== 'list' || feed !== 'cells') {
            feed = 'list';
        }

        url = cors + 'spreadsheets.google.com/feeds/' + feed + '/' + key + '/' + worksheet + '/public/' + mode + '?alt=' + type;

        var dfd = new $.Deferred();

        $.getJSON(url, {
            localCache: true,
            cacheTTL: 1
        })
        .done(function(json) {
            $.each(json.feed.entry, function (k, entry) {
                row = {};
                $.each(entry, function (key, value) {
                    if (key.match(/^gsx\$/g)) {
                        row[key.replace(/^gsx\$/g, '')] = value['$t'];
                    }
                });
                rows.push(row);
            });
            console.log('Spreadsheet loaded', url);
            dfd.resolve(rows);
        })
        .fail(function () {
            console.warn('Cannot retrieve spreadsheet', url);
            dfd.reject();
        });

        return dfd;
    };



    /**
    * Append CSS rules for each tile according to the provided data attributs
    */
    var updateStyle = function () {

        var cssRules = [], $tile, tileId, data;
        var preloads = [];

        var $container = $('.mix-container');
        $container.find('.tile.front-face').filter('[id]').each(function () {

            $tile = $(this);
            data = $tile.data();

            // For each data attribute
            $.each(data, function (key, value) {
                if ($.inArray(key, ['title', 'content', 'toggle']) === -1) {
                    tileId = '#' + $tile.attr('id');
                    key = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                    if (key === 'background-image') {
                        cssRules.push(tileId + ':before'
                        + ', ' + tileId + ' ~ div:before'
                        + ', ' + tileId + ' ~ div ~ div:before'
                        + ', ' + tileId + ' ~ div ~ div ~ div:before'
                        + ', ' + tileId + ' ~ div ~ div ~ div ~ div:before'
                        + ', ' + tileId + ' ~ div ~ div ~ div ~ div ~ div:before'
                        + '{' + key + ':url(' + value + ')}');
                        preloads.push(value);
                    } else if (key === 'background-color') {
                        cssRules.push(tileId + ':before'
                        + ', ' + tileId + ' ~ div:before'
                        + ', ' + tileId + ' ~ div ~ div:before'
                        + ', ' + tileId + ' ~ div ~ div ~ div:before'
                        + ', ' + tileId + ' ~ div ~ div ~ div ~ div:before'
                        + ', ' + tileId + ' ~ div ~ div ~ div ~ div ~ div'
                        + '{' + key + ':' + value + '}');
                    } else if (key === 'favicon') {
                        cssRules.push(tileId + ' .favicon:before'
                        + ', ' + tileId + ' ~ div:before'
                        + ', ' + tileId + ' ~ div ~ div:before'
                        + ', ' + tileId + ' ~ div ~ div ~ div:before'
                        + ', ' + tileId + ' ~ div ~ div ~ div ~ div:before'
                        + ', ' + tileId + ' ~ div ~ div ~ div ~ div ~ div:before'
                        + '{background-image:url(' + value + ')}');
                        preloads.push(value);
                    } else {
                        cssRules.push(tileId + '{' + key + ':' + value + '}');
                    }
                }

            });

        });

        // Append new rules to the head
        $('#tile_styles').html(cssRules.join(''));

        // Preload images
        if (typeof imagePreloader !== 'undefined') {
            $.unique(preloads);
            var preloader = new imagePreloader();
            preloader.preload(preloads).then(function(status){
                    console.log('Background images preloaded', status);
                });
        }

    };



    /**
    * Draw grid from data
    * @param {Object} json - JSON data
    */
    var prepareGrid = function (json) {

        // Build tiles template
        var source = $('#tiles-template').html();
        var template = Handlebars.compile(source);
        var context = {
            tiles: json
        };
        var html = template(context);
        var $container = $('.mix-container');
        $container.find('.mix').remove();
        $container.find('.mixitup-fail-message').after(html);

        // Build filters template
        var source = $('#filters-template').html();
        var template = Handlebars.compile(source);
        var context = {
            tiles: json
        };
        var html = template(context);
        var $container = $('.mix-active-filters');
        $container.html(html);

        // Append missing cube faces
        $('.mix .front-face').after('<div class="back-face"></div>'
            + '<div class="top-face"></div>'
            + '<div class="bottom-face"></div>'
            + '<div class="left-face"></div>'
            + '<div class="right-face"></div>');

        // Append CSS rules according to the provided data attributs
        updateStyle();

    };



    /**
    * Get Google spreadsheet JSON from input source
    * @return {Object} jqxhr
    */
    var updateData = function () {

        var spreadsheet = '1IzzSvOkYAS_900A94xGtwYzf4vzTXCZD6qm54KSspXk';
        var $input = $('#spreadsheet');
        if ($input && $input.val()) {
            spreadsheet = $input.val();
        } else {
            $input.val(spreadsheet);
        }

        var sheet = 1;
        var $input = $('#sheet');
        if ($input && $input.val()) {
            sheet = $input.val();
        }

        return loadData(spreadsheet, sheet, 'list')
            .done(function (json) {
                prepareGrid(json);

                $('.mix').tooltip({
                    trigger: 'hover',
                    html: true,
                    delay: {'show': 2000, 'hide': 100}
                });

            })
            .fail(function () {
                alert('Your spreadsheet could not be loaded. Ensure that your document is shared publicly.');
            });

    };



    /**
    * Initialize Mixitup
    */
    var init = function () {
        // Initialize multiFilter code
        mixitupMultiFilter.init();

        // Instantiate MixItUp
        var $container = $('.mix-container');
        $container.mixItUp({
            selectors: {
        		target: '.mix',
                filter: '.filter',
                sort: '.sort'
        	},
            load: {
        		filter: '.root' //all none '.tile-filter.none'
        	},
            controls: {
                enable: true // we won't be needing these
            },
            animation: {
                easing: 'cubic-bezier(0.86, 0, 0.07, 1)',
                queueLimit: 3,
                duration: 600
            },
            callbacks: {
                onMixLoad: function(state){
                    console.log('MixItUp ready');
                    (adsbygoogle = window.adsbygoogle || []).push({});
                },
                onMixEnd: function (state) {

                    console.log('Mixitup end', state.activeFilter, state);

                    var activeFilters = state.activeFilter.split(',');

                    //var filter = state.activeFilter.replace(/([^\.])(\.)/g, '$1, $2').replace(/([^\s,]+)/g, '[data-filter="$1"]');
                    //var filter = '[data-filter="' + state.activeFilter + '"]';
                    //console.log('filter', filter);

                    $('.remove-filter').each(function () {
                        var $btn = $(this);
                        $btn.toggleClass('hidden', ($.inArray($btn.data('filter'), activeFilters) === -1));
                    });
                    //$('.mix-active-filters').html(history.join(' | '));
                    /*
                    var attr = 'mix-active-filter';
                    var array = [];
                    var $container = $('.mix-active-filters');

                    // Build active filter buttons
                    if (state.activeFilter !== '.mix') {
                        state.activeFilter.split(',').forEach(function (filter) {
                            array.push('<li><button type="button" class="btn btn-default btn-xs filter" data-filter="' + filter + '" data-' + attr + '="' + filter + '"><span class="glyphicon glyphicon-remove"></span> ' + filter.replace(/^\./, '') + '</button></li>');
                        });
                    }
                    $container.html(array.join(''));
                    */

                }
            }
        });

        // Watch "Remove filter" buttons
        var attr = 'filter';
        //var $container = $('.mix-active-filters');
        $('.remove-filter').on('click', function (e) {
            var removeFilter = $(this).data('filter');
            var state = $container.mixItUp('getState');
            var activeFilters = state.activeFilter.split(',');
            console.log('removeFilter', removeFilter);
            console.log('activeFilters', activeFilters);
            activeFilters = $.grep(activeFilters, function(value) {
                return value !== removeFilter;
            });
            var newFilter = activeFilters.join(',') || $container.mixItUp('getOption', 'load.filter');
            $container.mixItUp('filter', newFilter);
            console.log('newFilter', newFilter);
            //e.preventDefault();
            /*var filter = $(this).data(attr);
            var $checkboxes = $('.mix-container').find('input[type="checkbox"][value="' + filter + '"]').first();
            if ($checkboxes.length === 1) {
                $checkboxes.attr('checked', false).trigger('change');
            }*/
        });

        // Watch the reset button and restaure the default filter
        //$('mix-reset').on('click', function () {
        //    $container.mixItUp('filter', $container.mixItUp('getOption', 'load.filter'));
        //});

    };



    $(function () {

        // Load Google spreadsheet and initialize Mixitup
        updateData().done(function () {
            init();
        });

        // Watch source changes
        $('#source_form').on('submit', function (e) {
            e.preventDefault();
            $('.mixitup-reset').trigger('click');
            updateData().done(function () {
                $('#source_modal').modal('hide');
            });
        });

        // Watch settings changes
        $('#settings_form').on('submit', function (e) {
            e.preventDefault();
            var cssRules = [];
            var $input = $('#tile_size');
            if ($input && $input.val()) {

                var size = parseInt($input.val());
                console.log('Tile size changed to', size);

                // Add new CSS rules to the head
                cssRules.push('.mix,.gap{width:' + (size + 2) + 'px !important;height: ' + (size + 2) + 'px !important}');
                cssRules.push('.mix{transform: scale(' + (size / 125) + ') translateZ(' + (-300 - size / 2) + 'px)}');
                cssRules.push('.mix:hover{transform: scale(' + (size / 125) + ') translateZ(' + (-size / 2) + 'px)}');
                cssRules.push('.mix .content-wrapper{transform: scale(' + (125 / size) + ')}');

                /*
                var width = size;
                var height = size;
                var depth = size;
                cssRules.push('.front-face,.back-face,.top-face,.bottom-face{width:' + (width + 2) + 'px !important;}');
                cssRules.push('.left-face,.right-face{width:' + (depth + 2) + 'px !important;}');
                cssRules.push('.front-face,.back-face,.left-face,.right-face{height: ' + (height + 2) + 'px !important}');
                cssRules.push('.top-face,.bottom-face{height: ' + (depth + 2) + 'px !important}');
                */

                // Add some *-hidden class to the grid container
                var $container = $('html'); // $('.mix-container');
                $container.toggleClass('tile-title-hidden', (size < 100));
                $container.toggleClass('tile-subtitle-hidden', (size < 125));
                $container.toggleClass('tile-description-hidden', (size < 150));

            }
            $('#settings_styles').html(cssRules.join(''));
            console.log('cssRules', cssRules.join(''));
            $('#settings_modal').modal('hide');
        });

        // Watch range changes and display value
        $('input[type="range"]').on('input', function () {
            var $input = $(this);
            $input.next('.input-group-addon').html($input.val());
        });

        // Reset values button
        $('.reset-form').on('click', function (e) {
            var $form = $(this).parents('form');
            $form.find('[data-default-value]').each(function () {
                var $input = $(this);
                $input.val($input.data('default-value'));
            });
        });

        $('.clear-local-storage').on('click', function () {
            $('form').garlic('destroy');
            localStorage.clear();
            sessionStorage.clear();
            location.reload();
        });

        // Replace JS alert by a bsic Bootstrap modal
        /*
        var proxied = window.alert;
        window.alert = function () {
            console.log('Alert', arguments);
            var modalId = 'alert_modal';
            var $modal = $('#' + modalId);
            if (!$modal) {
                var html = '<div id="' + modalId + '" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="Alert" aria-hidden="true"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h3 id="myModalLabel">Modal header</h3></div><div class="modal-body"><p></p></div><div class="modal-footer"><button class="btn" data-dismiss="modal" aria-hidden="true">Close</button></div>';
                $('body').append(html);
            }
            $modal.find('.modal-body').text(arguments[0]);
            $modal.modal('show');
        };
        */

    });


})();
