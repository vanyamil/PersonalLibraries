<?php

use Illuminate\Database\Seeder;

class FillCardsFromJSON extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
    	$cast = function($obj) { return (array) $obj; };

    	$list = json_decode(file_get_contents("oracle-cards-short.json"));
    	$true_list = array_map($cast, $list);

        app('db')->table('cards')->insert($true_list);
    }
}
