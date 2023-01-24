# Roux API

Roux Api provide you to use route names and actions while sending fetch calls in laravel projects
Note: Currently under development

**Installation**

install roux via composer

`composer require teomanofficial/roux`

Publish config and asset file of package. 

`php artisan vendor:publish --provider="Hsntngr\Roux\RouxServiceProvider" --tag="config" --tag="asset"`

Add roux service provider to providers in `config/app.php`

```
'providers' => [
    // ...
    Hsntngr\Roux\RouxServiceProvider::class
];
```

Add roux.js above your custom javascript files

```html
<script src="{{asset("js/roux.js")}}"></script>
<script src="{{asset("js/app.js")}}"></script>
```
Then start to use roux api..

Let assume we have a `user.greetings` route and takes two parameter.
```php
Route::get("welcome/{name}/{surname}", function ($name,$surname) {
    return response()->json("Welcome " . $name." ".$surname);
})->name("user.greetings");
```
with roux, you can use route name (user.greetings) as target. 
```js
roux = new FetchApiWithRoute();

roux.call("user.greetings",["Hasan Teoman","Tıngır"])
    .then(res => console.log(res))
//  welcome Hasan Teoman Tıngır
```
`call()` method takes three parameter, route, route parameters and fetch options. (Post data, headers, token etc.)

But you may pass above information in first parameter as ajax do

```js
roux.call({
    method: "GET",
    route: "users.get",
    params: userId
});
```

Instead of route names, also you may use route action as target

```js
roux.call({
    method: "POST",
    action: "PostController@store",
    contentType: "json",
    csrf: token,
    data: postData
});

roux.call("PostController@show", postId)
```

By  default, roux looks for csrf token in dom and set csrf header. 

```html
<!--common csrf fields in dom that roux looks for-->
@csrf
{{ csrf_field() }}
<input name="_token" value="{{ csrf_token() }}">
<meta name="csrf-field" content="{{ csrf_token() }}">
``` 

You can work with any api more elegant way by setting up default roux for each service

```js
var postApi = new Roux({
    as: "posts.",
    namespace: "Api"
})
```

now we can sand requests through postApi

```js
postApi.call("show", postId)
postApi.call("update", postId, {data: data})
```

Copyright [MIT LICENCE](./LICENSE.MD)
