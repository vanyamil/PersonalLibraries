<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

use Illuminate\Http\Request;

use App\Tournament;

$router->get('/', function () {
	$votecount = app('db')->table('matchups')->count();
    return view('welcome', compact('votecount'));
});

$router->get('/vote', function () {
    return view('matchup');
});
$router->get('/vote/new', 'VoteController@generate');
$router->post('/vote', 'VoteController@save_vote');

$router->get('/card/random', 'CardController@random');
$router->get('/card/named', 'CardController@named');
$router->get('/card/name_of/{id}', 'CardController@name_from_id');
$router->get('/card/{id}', [
	'as' => 'card', 
	'uses' => 'CardController@view'
]);

$router->get('user', "UserController@anonymous");
$router->get('/user/{name}', [
	'as' => 'user', 
	'uses' => 'UserController@getUser'
]);

// $router->resource('tournaments', 'TournamentController'); Laravel version - have to do manually here
$router->group(['prefix' => 'tournaments'], function($router) {
	$router->get('/', [
		'as' => 'tournaments.index',
		'uses' => 'TournamentController@index'
	]);

	$router->get('create', [
		'as' => 'tournaments.create',
		'uses' => 'TournamentController@create'
	]);

	$router->post('/', [
		'as' => 'tournaments.store',
		'uses' => 'TournamentController@store'
	]);

	$router->group(['prefix' => '{tournament}'], function($router) {
		$router->get('/', [
			'as' => 'tournaments.show',
			'uses' => 'TournamentController@show'
		]);

		$router->get('edit', [
			'as' => 'tournaments.edit',
			'uses' => 'TournamentController@edit'
		]);

		$router->put('/', [
			'as' => 'tournaments.update',
			'uses' => 'TournamentController@update'
		]);

		$router->delete('/', [
			'as' => 'tournaments.destroy',
			'uses' => 'TournamentController@destroy'
		]);
	});
});

$router->get('/image/{id}', ['as' => 'image', function($id) {
	return redirect()->to(get_image_link($id));
}]);

$router->get('/version', function () use ($router) {
    return $router->app->version();
});