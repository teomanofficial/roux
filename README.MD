# Roux API

Roux Api provide you to use route names and actions while sending fetch calls in laravel projects
Note: Currently under development

**Installation**

install roux via composer

`composer require hsntngr/roux`

Publish config and asset file of package. 

`php artisan vendor:publish --provider="Hsntngr\Roux\RouxServiceProvider::class" --tag="config" --tag="asset"`

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
```php
Route::get("welcome/{name}/{surname}", function ($name,$surname) {
    return response()->json("Welcome " . $name." ".$surname);
})->name("user.greeting");
```
with roux, you can use route names as target. 
```js
roux.call("user.greeting",["Hasan Teoman","Tıngır"])
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
```


Copyright [MIT LICENCE](./LICENSE.MD)