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

        $.getJSON(url)
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
                        + ', ' + tileId + ' + .tile:before'
                        + ', ' + tileId + ' + .tile + .tile:before'
                        + ', ' + tileId + ' + .tile + .tile + .tile:before'
                        + ', ' + tileId + ' + .tile + .tile + .tile + .tile:before'
                        + ', ' + tileId + ' + .tile + .tile + .tile + .tile + .tile:before'
                        + '{' + key + ':url(' + value + ')}');
                    } else if (key === 'background-color') {
                        cssRules.push(tileId + ' .content:before'
                        + ', ' + tileId + ' + .tile .content:before'
                        + ', ' + tileId + ' + .tile + .tile .content:before'
                        + ', ' + tileId + ' + .tile + .tile + .tile .content:before'
                        + ', ' + tileId + ' + .tile + .tile + .tile + .tile .content:before'
                        + ', ' + tileId + ' + .tile + .tile + .tile + .tile + .tile .content:before'
                        + '{' + key + ':' + value + '}');
                    } else {
                        cssRules.push(tileId + '{' + key + ':' + value + '}');
                    }
                }

            });
        });

        // Append new rules to the head
        $('#tile_styles').html(cssRules.join(''));

    };



    /**
    * Draw grid from data
    * @param {Object} json - JSON data
    */
    var prepareGrid = function (json) {

        // Build template
        var source = $('#grids-template').html();
        var template = Handlebars.compile(source);
        var context = {
            grids: json
        };
        var html = template(context);

        // Append template to the mixitup container
        var $container = $('.mix-container');
        $container.find('.mix').remove();
        $container.find('.mixitup-fail-message').after(html);

        // Adapt text to the tile
        //if ($().flowtype) {
        //    $('.tile .title').flowtype();
        //}

        // Append missing cube faces
        $('.front-face').after('<div class="back-face"></div>'
            + '<div class="top-face"></div>'
            + '<div class="bottom-face"></div>'
            + '<div class="left-face"></div>'
            + '<div class="right-face"></div>');
        /*$('.front-face').after('<div class="tile back-face"></div>'
            + '<div class="tile top-face"></div>'
            + '<div class="tile bottom-face"></div>'
            + '<div class="tile left-face"></div>'
            + '<div class="tile right-face"></div>');*/

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
            load: {
        		filter: '.tile-filter'
        	},
            controls: {
                enable: false // we won't be needing these
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
                }
            }
        });

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
                //cssRules.push('.object{transform: scale(' + (size / 125) + ')}');
                //cssRules.push('.front-face,.back-face,.top-face,.bottom-face,.left-face,.right-face{width:' + (size + 2) + 'px !important;height: ' + (size + 2) + 'px !important}');

                // Add some *-hidden class to the grid container
                var $container = $('html'); // $('.mix-container');
                $container.toggleClass('tile-title-hidden', (size < 100));
                $container.toggleClass('tile-subtitle-hidden', (size < 125));
                $container.toggleClass('tile-description-hidden', (size < 150));

                // Adapt text to the tile
                //if ($().flowtype) {
                //    $('.tile .title').flowtype();
                //}

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

    });


})();
