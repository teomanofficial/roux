<?php

namespace Hsntngr\Roux\Controller;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;

class JsonRouteController extends Controller
{
    protected $config;

    public function __construct()
    {
        $this->config = $this->getConfig();
    }

    public function getRoutesAsJson()
    {
        $routes = $this->getRoutes();
        $this->config["cache"] = $this->config["cache"]["onBrowser"];
        return response()->json([
            "routes" => $routes,
            "config" => $this->config
        ]);
    }

    protected function getRoutes()
    {
        if ($this->config["cache"]["onServer"]
            && Cache::has("rouxRoutes"))
            return Cache::get("rouxRoutes");

        $routes = app("router")->getRoutes()
            ->getRoutes();

        $organisedRoutes = [];
        foreach ($routes as $route) {
            $routeName = $this->getRouteName($route);
            if (!$routeName) continue;
            if ($this->exclude($routeName)) continue;
            $organisedRoutes[$routeName] = $this->makeRouteBag($route);
        }

        if ($this->config["cache"]["onServer"]
            && !Cache::has("rouxRoutes"))
            Cache::forever("rouxRoutes", $organisedRoutes);

        return $organisedRoutes;
    }

    protected function getRouteName($route)
    {
        return array_key_exists("as", $route->action)
            ? $route->action["as"]
            : "";
    }

    protected function makeRouteBag($route)
    {
        return [
            "uri" => trim($route->uri, "/"),
            "methods" => $route->methods,
            "action" => array_key_exists("uses", $route->action)
                ? class_basename($route->action["uses"])
                : "",
            "prefix" => array_key_exists("prefix", $route->action)
                ? trim($route->action["prefix"], "/")
                : "",
        ];
    }

    protected function exclude($routeName)
    {
        foreach ($this->config["exclude"] as $exclude) {
            if (substr($exclude, -1) == "*") {
                $pattern = "#^" . substr($exclude, 0, strlen($exclude) - 1) . "#";
                return preg_match($pattern, $routeName);
            }
            return $routeName == $exclude;
        }

    }

    protected function getConfig()
    {
        $config = config("roux");
        $config["locale"] = app()->getLocale();
        return $config;
    }

}