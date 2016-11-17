var $ = require('jQuery');

$(function () {
    var encryptedString = sessionStorage.getItem('encryptedString');
    sessionStorage.removeItem('encryptedString');

    $("pre").text(encryptedString);
});