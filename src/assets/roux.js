function RouteNotFound(route) {
    var instance = new Error(route + " route not found");
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
}

RouteNotFound.prototype = Object.create(Error.prototype, {
    constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true
    }
});

function ActionNotFound(action) {
    var instance = new Error(action + " action not found");
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
}

ActionNotFound.prototype = Object.create(Error.prototype, {
    constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true
    }
});

function NoValidTargetDefined() {
    var instance = new Error("No valid target specified. Define a valid route or an action.");
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
}

NoValidTargetDefined.prototype = Object.create(Error.prototype, {
    constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true
    }
});


function RouteParameterNotSpecified(route, name) {
    var message = route + " uses " + name + " parameter." +
        " Request call doesn't supply any";
    var instance = new Error(message);
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
}

RouteParameterNotSpecified.prototype = Object.create(Error.prototype, {
    constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true
    }
});

if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ActionNotFound, Error);
    Object.setPrototypeOf(RouteNotFound, Error);
    Object.setPrototypeOf(NoValidTargetDefined, Error);
    Object.setPrototypeOf(RouteParameterNotSpecified, Error);
} else {
    ActionNotFound.__proto__ = Error;
    RouteNotFound.__proto__ = Error;
    NoValidTargetDefined.__proto__ = Error;
    RouteParameterNotSpecified.__proto__ = Error;
}


function RouteLoader(options) {
    this.baseUrl = location.origin;
    this.options = options
}

RouteLoader.prototype = {
    find: async function (route) {
        const routes = await this.loadRoutes();
        const uri = this.getRouteUri(routes, route);
        return this.createCallableUrl(uri, route)
    },
    loadRoutes: async function () {
        let routes;

        if (this.options.cache) {
            const routesJson = localStorage.getItem("rouxRoutes");
            if (routesJson) routes = JSON.parse(routesJson)
        }

        if (!routes) {
            const jsonRoutesSource = this.baseUrl + "/" + "loadRoutesForRoux";
            const response = await fetch(jsonRoutesSource);
            routes = await response.json();

            if (this.options.cache && !localStorage.getItem("rouxRoutes"))
                localStorage.setItem("rouxRoutes", JSON.stringify(routes))
        }

        return routes;
    },
    getRouteUri: function (routes, route) {
        if (route.name) {
            if (routes.hasOwnProperty(route.name))
                return routes[route.name].uri;
            else throw new RouteNotFound(route.name);
        }

        if (route.action) {
            for (let rName in routes) {
                if (routes[rName].action === route.action)
                    return routes[rName].uri;
            }
        } else throw new ActionNotFound(route.action);

        throw new NoValidTargetDefined;
    },
    createCallableUrl: function (uri, route) {

        if (route.params.length)
            uri = this.replaceUriParameters(uri, route);

        return this.baseUrl + "/" + uri;
    },
    replaceUriParameters: function (uri, route) {
        const rawSegments = uri.split("/");

        const segments = rawSegments.map((segment) => {
            let parameter;
            if (parameter = segment.match(/^{.*}$/g)) {
                let value = route.params.shift();

                if (!value) throw new RouteParameterNotSpecified(
                    route.name || route.action,
                    parameter[0]
                );

                return value
            }
            return segment;
        });
        return segments.join("/");
    }

};


function Request(data, routeOptions) {
    console.log(data);
    this.routeOptions = routeOptions;

    this.route = {
        name: data.name,
        action: data.action,
        params: data.params
    };

    this.options = data.options;
}

Request.prototype = {
    getRoute: function () {
        const loader = new RouteLoader(this.routeOptions);
        return loader.find(this.route)
    },

    resetRequest: function () {
        this.route = {
            name: "",
            action: "",
            params: ""
        };
        this.options = []
    },

    send: function () {
        return this.getRoute()
            .then(async url => {
                const response = await fetch(url, this.options);
                this.resetRequest();
                return await response.json();
            })
    }
};

function Roux(options = {}) {

    this.routeOptions = {
        cache: !!options.cache,
        as: options.as ? options.as : "",
        namespace: options.namespace ? options.namespace : ""
    };

    this.baseNamespace = "App\\Http\\Controllers";

    this.contentMimeTypes = {
        urlencoded: "application/x-www-form-urlencoded",
        text: "text/plain",
        form: "multipart/form-data",
        xml: "application/xml",
        json: "application/json"
    }
}

Roux.prototype = {
    setup: function (options) {
        this.routeOptions = Object.assign(this.routeOptions, options)
    },

    getDataType: function (type) {
        return this.contentMimeTypes.hasOwnProperty(type)
            ? this.contentMimeTypes[type]
            : type;
    },

    getRouteAction: function (action) {
        var namespace = this.baseNamespace +
            (this.routeOptions.namespace
                ? "\\" + this.routeOptions.namespace + "\\"
                : "");
        return namespace + action
    },

    getRouteName(name) {
        return this.routeOptions.as + name;
    },

    organiseOptions: function (options) {
        const optionData = {};

        if (options.hasOwnProperty("credentials")) {
            optionData["credentials"] = options.credentials;
        }
        if (options.hasOwnProperty("referrer")) {
            optionData["referrer"] = options.referrer;
        }
        if (options.hasOwnProperty("redirect")) {
            optionData["redirect"] = options.redirect;
        }
        if (options.hasOwnProperty("cache")) {
            optionData["cache"] = options.cache;
        }
        if (options.hasOwnProperty("mode")) {
            optionData["mode"] = options.mode;
        }
        if (options.hasOwnProperty("headers")) {
            optionData["headers"] = options.headers;
            optionData.headers["X-Requested-With"] = "XMLHttpRequest";
        } else {
            optionData["headers"] = {
                "X-Requested-With": "XMLHttpRequest"
            };
        }
        if (options.hasOwnProperty("data")) {
            optionData["body"] = options.data;
        }
        if (options.hasOwnProperty("method")) {
            optionData["method"] = options.method;
        }
        if (options.hasOwnProperty("csrf")) {
            optionData.headers["X-CSRF-TOKEN"] = options.csrf;


        } else {
            let token;
            token = document.head.querySelector("meta[name=csrf_token]");
            if (token) optionData.headers["X-CSRF-TOKEN"] = token.content;
            else {
                token = document.querySelector("input[name=_token]");
                if (token) optionData.headers["X-CSRF-TOKEN"] = token.value;
            }

        }
        if (options.hasOwnProperty("contentType")) {
            optionData.headers["Content-Type"] = this.getDataType(options.contentType)
        }
        return optionData
    },

    wrapParams: function (params) {
        return Array.isArray(params)
            ? params
            : [params]
    },

    call: function (name, params = [], options = {}) {
        let data;

        if (typeof name == "object" && name instanceof Object) {
            data = {
                params: this.wrapParams(name.params),
                name: this.getRouteName(name.route),
                action: this.getRouteAction(name.action),
                options: this.organiseOptions(name)
            }
        } else {
            data = {
                params: this.wrapParams(params),
                options: this.organiseOptions(options)
            };

            if (name.indexOf("@") !== -1)
                data["action"] = this.getRouteAction(name);
            else data["name"] = this.getRouteName(name);
        }

        const request = new Request(data, this.routeOptions);

        return request.send();
    },
};
