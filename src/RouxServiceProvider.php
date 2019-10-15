<?php

namespace Hsntngr\Roux;

use Illuminate\Support\ServiceProvider;

class RouxServiceProvider extends ServiceProvider
{
    public function boot()
    {
        $this->loadRoutesFrom(__DIR__ . "/route/route.php");

        $this->publishes([
            __DIR__ . "/assets/roux.js" => public_path("js/roux.js"),
        ],"asset");

        $this->publishes([
            __DIR__ . "/config/roux.php" => config_path("roux.php")
        ],"config");
    }
}