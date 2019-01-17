<?php

return [

    /*************************************
     ****  Only named routes returns  ****
     ****     Response Type: Json     ****
     *************************************/

    // Cache routes
    "cache" => [
        // Uses default cache driver
        "onServer" => false,
        // Uses localStorage
        // First calls always send request for routes
        "onBrowser" => false
    ],

    // exclude some of your routes
    "exclude" => [
//        "admin.*",
//        "an.another.secret.route"
    ],

    // Will add locale parameter to url
    // app_url/*locale*/i-believe-i-can-fly
    "localize" => false,
];