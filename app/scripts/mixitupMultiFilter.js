
var mixitupMultiFilter = {

    // Declare any variables we will need as properties of the object
    $filterGroups: null,
    $filterUi: null,
    $reset: null,
    groups: [],
    outputArray: [],
    outputString: '',

    // The "init" method will run on document ready and cache any jQuery objects we will need.
    init: function () {
        var self = this; // As a best practice, in each method we will asign "this" to the variable "self" so that it remains scope-agnostic. We will use it to refer to the parent "checkboxFilter" object so that we can share methods and properties between all parts of the object.

        self.$filterUi = $('form.mix-filter-form');
        self.$filterGroups = $('.mix-filter-group');
        self.$reset = $('.mix-reset');
        self.$container = $('.mix-container');
        self.$checkboxes = self.$filterGroups.filter('.mix-checkboxes');
        self.$search = self.$filterGroups.filter('.mix-search');

        self.$filterGroups.each(function () {
            self.groups.push({
                $inputs: $(this).find('input'),
                active: [],
                tracker: false
            });
        });

        self.bindHandlers();
    },

    // The "bindHandlers" method will listen for whenever a form value changes.
    bindHandlers: function () {
        var self = this,
        typingDelay = 300,
        typingTimeout = -1,
        resetTimer = function () {
            clearTimeout(typingTimeout);

            typingTimeout = setTimeout(function () {
                self.parseFilters();
            }, typingDelay);
        };

        self.$checkboxes.on('change', function () {
            self.parseFilters();
        });

        self.$search.on('keyup change', resetTimer);

        self.$reset.on('click', function (e) {
            e.preventDefault();
            console.log(self.$filterUi);
            self.$filterUi[0].reset();

            self.$filterUi.each(function (i, form) {
                form.reset();
            });
            self.$filterUi.find('input[type="text"]').val('');
            self.parseFilters();

            // Restore the default filter
            self.$container.mixItUp('filter', self.$container.mixItUp('getOption', 'load.filter'));

        });

    },

    // The parseFilters method checks which filters are active in each group:
    parseFilters: function () {
        var self = this;

        // loop through each filter group and add active filters to arrays
        for(var i = 0, group; group = self.groups[i]; i++) {
            group.active = []; // reset arrays
            group.$inputs.each(function () {
                var searchTerm = '',
                $input = $(this),
                minimumLength = 3;

                if ($input.is(':checked')) {
                    group.active.push(this.value);
                }

                if ($input.is('[type="text"]') && this.value.length >= minimumLength) {
                    searchTerm = this.value
                    .trim()
                    .toLowerCase()
                    .replace(' ', '-');

                    group.active[0] = '[class*="' + searchTerm + '"]';
                }
            });
            group.active.length && (group.tracker = 0);
        }

        self.concatenate();
    },

    // The "concatenate" method will crawl through each group, concatenating filters as desired:
    concatenate: function () {
        var self = this,
        cache = '',
        crawled = false,
        checkTrackers = function () {
            var done = 0;

            for(var i = 0, group; group = self.groups[i]; i++) {
                (group.tracker === false) && done++;
            }

            return (done < self.groups.length);
        },
        crawl = function () {
            for(var i = 0, group; group = self.groups[i]; i++) {
                group.active[group.tracker] && (cache += group.active[group.tracker]);

                if(i === self.groups.length - 1) {
                    self.outputArray.push(cache);
                    cache = '';
                    updateTrackers();
                }
            }
        },
        updateTrackers = function () {
            for(var i = self.groups.length - 1; i > -1; i--) {
                var group = self.groups[i];

                if(group.active[group.tracker + 1]) {
                    group.tracker++;
                    break;
                } else if(i > 0) {
                    group.tracker && (group.tracker = 0);
                } else {
                    crawled = true;
                }
            }
        };

        self.outputArray = []; // reset output array

        do{
            crawl();
        }
        while(!crawled && checkTrackers());

        self.outputString = self.outputArray.join();

        // If the output string is empty, show all rather than none:
        var defaultFilter = self.$container.mixItUp('getOption', 'load.filter');
        //!self.outputString.length && (self.outputString = 'all');
        !self.outputString.length && (self.outputString = defaultFilter);

        console.log('Selected filters', self.outputString);

        // ^ we can check the console here to take a look at the filter string that is produced

        // Send the output string to MixItUp via the 'filter' method:
        if(self.$container.mixItUp('isLoaded')) {
            self.$container.mixItUp('filter', self.outputString);
        }

    }
};
