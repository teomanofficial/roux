<?php

namespace Hsntngr\Roux\Controller;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;

class JsonRouteController extends Controller
{
    protected $config;

    public function __construct()
    {
        $this->config = config("roux");
    }

    public function getRoutesAsJson()
    {
        $routes = $this->getRoutes();

        return response()->json($routes);
    }

    protected function getRoutes()
    {

        $routes = app("router")
            ->getRoutes()
            ->getRoutes();

        $organisedRoutes = [];

        foreach ($routes as $route) {
            $routeName = $this->getRouteName($route);
            if (!$routeName) continue;
            if ($this->exclude($routeName)) continue;
            $organisedRoutes[$routeName] = $this->makeRouteBag($route);
        }

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
                ? $route->action["uses"]
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


}
