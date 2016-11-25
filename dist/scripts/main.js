"use strict";Handlebars.registerHelper("cssClass",function(e){return e.trim().replace(" ","-").toLowerCase()}),Handlebars.registerHelper("if_eq",function(e,t,i){return e==t?i.fn(this):i.inverse(this)});var mixitupMultiFilter={$filterGroups:null,$filterUi:null,$reset:null,groups:[],outputArray:[],outputString:"",init:function(){var e=this;e.$filterUi=$("form.mix-filter-form"),e.$filterGroups=$(".mix-filter-group"),e.$reset=$(".mix-reset"),e.$container=$(".mix-container"),e.$checkboxes=e.$filterGroups.filter(".mix-checkboxes"),e.$search=e.$filterGroups.filter(".mix-search"),e.$filterGroups.each(function(){e.groups.push({$inputs:$(this).find("input"),active:[],tracker:!1})}),e.bindHandlers()},bindHandlers:function(){var e=this,t=300,i=-1,r=function(){clearTimeout(i),i=setTimeout(function(){e.parseFilters()},t)};e.$checkboxes.on("change",function(){e.parseFilters()}),e.$search.on("keyup change",r),e.$reset.on("click",function(t){t.preventDefault(),console.log(e.$filterUi),e.$filterUi[0].reset(),e.$filterUi.each(function(e,t){t.reset()}),e.$filterUi.find('input[type="text"]').val(""),e.parseFilters(),e.$container.mixItUp("filter",e.$container.mixItUp("getOption","load.filter"))})},parseFilters:function(){for(var e,t=this,i=0;e=t.groups[i];i++)e.active=[],e.$inputs.each(function(){var t="",i=$(this),r=3;i.is(":checked")&&e.active.push(this.value),i.is('[type="text"]')&&this.value.length>=r&&(t=this.value.trim().toLowerCase().replace(" ","-"),e.active[0]='[class*="'+t+'"]')}),e.active.length&&(e.tracker=0);t.concatenate()},concatenate:function(){var e=this,t="",i=!1,r=function(){for(var t,i=0,r=0;t=e.groups[r];r++)t.tracker===!1&&i++;return i<e.groups.length},o=function(){for(var i,r=0;i=e.groups[r];r++)i.active[i.tracker]&&(t+=i.active[i.tracker]),r===e.groups.length-1&&(e.outputArray.push(t),t="",n())},n=function(){for(var t=e.groups.length-1;t>-1;t--){var r=e.groups[t];if(r.active[r.tracker+1]){r.tracker++;break}t>0?r.tracker&&(r.tracker=0):i=!0}};e.outputArray=[];do o();while(!i&&r());e.outputString=e.outputArray.join();var a=e.$container.mixItUp("getOption","load.filter");!e.outputString.length&&(e.outputString=a),console.log("Selected filters",e.outputString),e.$container.mixItUp("isLoaded")&&e.$container.mixItUp("filter",e.outputString)}},appModule=function(){var e=function(e,t,i){var r,o="https://",n="values",a="json",l={},s=[];!t>0&&(t=1),"list"===i&&"cells"===i||(i="list"),r=o+"spreadsheets.google.com/feeds/"+i+"/"+e+"/"+t+"/public/"+n+"?alt="+a;var c=new $.Deferred;return $.getJSON(r,{localCache:!0,cacheTTL:1}).done(function(e){$.each(e.feed.entry,function(e,t){l={},$.each(t,function(e,t){e.match(/^gsx\$/g)&&(l[e.replace(/^gsx\$/g,"")]=t.$t)}),s.push(l)}),console.log("Spreadsheet loaded",r),c.resolve(s)}).fail(function(){console.warn("Cannot retrieve spreadsheet",r),c.reject()}),c},t=function(){var e,t,i,r=[],o=[],n=$(".mix-container");if(n.find(".tile.front-face").filter("[id]").each(function(){e=$(this),i=e.data(),$.each(i,function(i,n){$.inArray(i,["title","content","toggle"])===-1&&(t="#"+e.attr("id"),i=i.replace(/([A-Z])/g,"-$1").toLowerCase(),"background-image"===i?(r.push(t+":before, "+t+" ~ div:before, "+t+" ~ div ~ div:before, "+t+" ~ div ~ div ~ div:before, "+t+" ~ div ~ div ~ div ~ div:before, "+t+" ~ div ~ div ~ div ~ div ~ div:before{"+i+":url("+n+")}"),o.push(n)):"background-color"===i?r.push(t+":before, "+t+" ~ div:before, "+t+" ~ div ~ div:before, "+t+" ~ div ~ div ~ div:before, "+t+" ~ div ~ div ~ div ~ div:before, "+t+" ~ div ~ div ~ div ~ div ~ div{"+i+":"+n+"}"):"favicon"===i?(r.push(t+" .favicon:before, "+t+" ~ div:before, "+t+" ~ div ~ div:before, "+t+" ~ div ~ div ~ div:before, "+t+" ~ div ~ div ~ div ~ div:before, "+t+" ~ div ~ div ~ div ~ div ~ div:before{background-image:url("+n+")}"),o.push(n)):r.push(t+"{"+i+":"+n+"}"))})}),$("#tile_styles").html(r.join("")),"undefined"!=typeof imagePreloader){$.unique(o);var a=new imagePreloader;a.preload(o).then(function(e){console.log("Background images preloaded",e)})}},i=function(e){var i=$("#tiles-template").html(),r=Handlebars.compile(i),o={tiles:e},n=r(o),a=$(".mix-container");a.find(".mix").remove(),a.find(".mixitup-fail-message").after(n);var i=$("#filters-template").html(),r=Handlebars.compile(i),o={tiles:e},n=r(o),a=$(".mix-active-filters");a.html(n),$(".mix .front-face").after('<div class="back-face"></div><div class="top-face"></div><div class="bottom-face"></div><div class="left-face"></div><div class="right-face"></div>'),t()},r=function(){var t="1IzzSvOkYAS_900A94xGtwYzf4vzTXCZD6qm54KSspXk",r=$("#spreadsheet");r&&r.val()?t=r.val():r.val(t);var o=1,r=$("#sheet");return r&&r.val()&&(o=r.val()),e(t,o,"list").done(function(e){i(e),$(".mix").tooltip({trigger:"hover",html:!0,delay:{show:2e3,hide:100}})}).fail(function(){alert("Your spreadsheet could not be loaded. Ensure that your document is shared publicly.")})},o=function(){mixitupMultiFilter.init();var e=$(".mix-container");e.mixItUp({selectors:{target:".mix",filter:".filter",sort:".sort"},load:{filter:".root"},controls:{enable:!0},animation:{easing:"cubic-bezier(0.86, 0, 0.07, 1)",queueLimit:3,duration:600},callbacks:{onMixLoad:function(e){console.log("MixItUp ready"),(adsbygoogle=window.adsbygoogle||[]).push({})},onMixEnd:function(e){console.log("Mixitup end",e.activeFilter,e);var t=e.activeFilter.split(",");$(".remove-filter").each(function(){var e=$(this);e.toggleClass("hidden",$.inArray(e.data("filter"),t)===-1)})}}});$(".remove-filter").on("click",function(t){var i=$(this).data("filter"),r=e.mixItUp("getState"),o=r.activeFilter.split(",");console.log("removeFilter",i),console.log("activeFilters",o),o=$.grep(o,function(e){return e!==i});var n=o.join(",")||e.mixItUp("getOption","load.filter");e.mixItUp("filter",n),console.log("newFilter",n)})};$(function(){r().done(function(){o()}),$("#source_form").on("submit",function(e){e.preventDefault(),$(".mixitup-reset").trigger("click"),r().done(function(){$("#source_modal").modal("hide")})}),$("#settings_form").on("submit",function(e){e.preventDefault();var t=[],i=$("#tile_size");if(i&&i.val()){var r=parseInt(i.val());console.log("Tile size changed to",r),t.push(".mix,.gap{width:"+(r+2)+"px !important;height: "+(r+2)+"px !important}"),t.push(".mix{transform: scale("+r/125+") translateZ("+(-300-r/2)+"px)}"),t.push(".mix:hover{transform: scale("+r/125+") translateZ("+-r/2+"px)}"),t.push(".mix .content-wrapper{transform: scale("+125/r+")}");var o=$("html");o.toggleClass("tile-title-hidden",r<100),o.toggleClass("tile-subtitle-hidden",r<125),o.toggleClass("tile-description-hidden",r<150)}$("#settings_styles").html(t.join("")),console.log("cssRules",t.join("")),$("#settings_modal").modal("hide")}),$('input[type="range"]').on("input",function(){var e=$(this);e.next(".input-group-addon").html(e.val())}),$(".reset-form").on("click",function(e){var t=$(this).parents("form");t.find("[data-default-value]").each(function(){var e=$(this);e.val(e.data("default-value"))})}),$(".clear-local-storage").on("click",function(){$("form").garlic("destroy"),localStorage.clear(),sessionStorage.clear(),location.reload()})})}();