$(document).ready(function () {
    $("#nav li:has(ul)").addClass('suppressedLink').prepend("<span class='linkSuppressor' onClick='return true'></span>");
});