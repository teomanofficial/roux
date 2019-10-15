<?php


Route::group(["namespace" => "Hsntngr\Roux\Controller"], function () {
    Route::get("loadRoutesForRoux", "JsonRouteController@getRoutesAsJson");
});
