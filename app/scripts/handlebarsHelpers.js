
Handlebars.registerHelper('cssClass', function(input) {
    return input.trim().replace(' ', '-').toLowerCase();
});

Handlebars.registerHelper('if_eq', function(a, b, opts) {
    if (a == b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});
