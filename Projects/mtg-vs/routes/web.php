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

$router->get('/', function () {
	$votecount = app('db')->table('matchups')->count();
    return view('welcome', compact('votecount'));
});

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

		$router->get('vote', [
			'as' => 'tournaments.votes.create',
			'uses' => 'VoteController@generate'
		]);

		$router->post('vote', [
			'as' => 'tournaments.votes.store',
			'uses' => 'VoteController@save_vote'
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

		// Edit list of participants
		$router->get('cards', [
			'as' => 'tournaments.cards.index',
			'uses' => 'TournamentController@cards'
		]);

		// Delete list of participants
		$router->delete('cards/one', [
			'as' => 'tournaments.cards.delete',
			'uses' => 'TournamentController@deleteCard'
		]);

		// Delete list of participants
		$router->delete('cards/all', [
			'as' => 'tournaments.cards.destroy',
			'uses' => 'TournamentController@destroyCards'
		]);

		$router->post('cards/one', [
			'as' => 'tournaments.cards.addSingle',
			'uses' => 'TournamentController@addSingle'
		]);

		$router->post('cards/many', [
			'as' => 'tournaments.cards.addMulti',
			'uses' => 'TournamentController@addMulti'
		]);

		// Edit matchups
		$router->get('matchups', [
			'as' => 'tournaments.matchups.index',
			'uses' => 'TournamentController@matchups'
		]);
	});
});

$router->get('/image/{id}', ['as' => 'image', function($id) {
	return redirect()->to(get_image_link($id));
}]);

$router->get('/version', function () use ($router) {
    return $router->app->version();
});