<?php


Route::group(["namespace" => "Hsntngr\Roux\Controller"], function () {
    Route::get("loadJsonRoutes", "JsonRouteController@getRoutesAsJson");
});