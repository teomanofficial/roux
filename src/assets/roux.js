class RouteNotFound extends Error {
    constructor(name) {
        const message = name + " route not found!";
        super(message);
        this.name = this.constructor.name;
    }
}

class NoValidTargetDefined extends Error {
    constructor() {
        const message = "No target specified. Define a route or an action.";
        super(message);
        this.name = this.constructor.name;
    }
}

class ActionNotFound extends Error {
    constructor(name) {
        const message = name + " action not found!";
        super(message);
        this.name = this.constructor.name;
    }
}

class RouteParameterNotSpecified extends Error {
    constructor(route, name) {
        const message = route + " uses " + name + " parameter." +
            " Request call doesn't have a value for it";
        super(message);
        this.name = this.constructor.name;
    }
}

class FetchApiWithRoute {
    constructor() {
        this.params = [];
        this.options = {};
        this.name = "";
        this.action = "";
        this.config = {
            appOrigin: window.location.origin,
            cache: false
        };
        this.contentMimeTypes = {
            urlencoded: "application/x-www-form-urlencoded",
            text: "text/plain",
            form: "multipart/form-data",
            xml: "application/xml",
            json: "application/json"
        }
    }

    async loadRoutes() {
        const jsonRoutesSource = window.location.origin + "/" + "loadJsonRoutes";
        const request = await fetch(jsonRoutesSource);
        return await request.json();
    }

    getRouteUri(routes) {
        if (this.name) {
            if (routes.hasOwnProperty(this.name))
                return routes[this.name].uri;
            else throw new RouteNotFound(this.name);
        }

        if (this.action) {
            for (let rName in routes) {
                if (routes[rName].action === this.action)
                    return routes[rName].uri;
            }
        } else throw new ActionNotFound(this.action);

        throw new NoValidTargetDefined;
    };

    mergeConfig(config) {
        this.config = Object.assign(this.config, config)
    };

    wrapParams(params) {
        return Array.isArray(params)
            ? params
            : [params]
    };

    organiseOptions(options) {
        const optionData = {};
        
        optionData.headers = {
            // its needed to specify to ajax request
            // and also reduce to cors attacks
            "X-Requested-With": "XMLHttpRequest"
        };

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
        }
        if (options.hasOwnProperty("data")) {
            optionData["body"] = options.data;
        }
        if (options.hasOwnProperty("method")) {
            optionData["method"] = options.method;
        }
        if (options.hasOwnProperty("csrf")) {
            optionData.headers["X-CSRF-TOKEN"] = options.csrf;
        }
        if (options.hasOwnProperty("contentType")) {
            optionData.headers["Content-Type"] = this
                .getDataType(options.contentType)
        }
        return optionData
    };

    getDataType(type) {
        return this.contentMimeTypes.hasOwnProperty(type)
            ? this.contentMimeTypes[type]
            : type;
    }

    cacheRoutes(routes) {
        localStorage.setItem("rouxRoutes", JSON.stringify(routes))
    };

    replaceUriParameters(uri) {
        const rawSegments = uri.split("/");

        const segments = rawSegments.map((segment) => {
            let parameter;
            if (parameter = segment.match(/^{.*}$/g)) {
                let value = this.params.shift();
                if (!value) throw new
                RouteParameterNotSpecified(this.name || this.action, parameter[0]);
                return value
            }
            return segment;
        });
        return segments.join("/");
    };

    getLocalizedUri(uri) {
        return this.config.locale + "/" + uri;
    };

    createCallableUrl(routes) {
        let uri = this.getRouteUri(routes);
        if (this.params.length)
            uri = this.replaceUriParameters(uri);
        if (this.config.localize)
            uri = this.getLocalizedUri(uri);
        return this.config.appOrigin + "/" + uri;
    };

    getRoute() {
        if (this.config.cache) {
            const routes = JSON.parse(localStorage.getItem("rouxRoutes"));
            if (routes) {
                const url = this.createCallableUrl(routes);
                return Promise.resolve(url);
            }
        }
        return this.loadRoutes()
            .then((res) => {
                this.mergeConfig(res.config);
                if (this.config.cache) {
                    this.cacheRoutes(res.routes);
                }
                return this.createCallableUrl(res.routes)
            });
    };

    resetRoux() {
        this.params = [];
        this.options = {};
        this.name = "";
        this.action = "";
    }

    call(name, params = [], options = {}) {
        if (typeof name == "object" && name instanceof Object) {
            this.params = this.wrapParams(name.params);
            this.name = name.route;
            this.action = name.action;
            this.options = this.organiseOptions(name)
        } else {
            this.name = name;
            this.params = this.wrapParams(params);
            this.options = this.organiseOptions(options);
        }
        return this.getRoute()
            .then(async (url) => {
                const request = await fetch(url, this.options);
                this.resetRoux();
                return await request.json();
            })
    };
}
