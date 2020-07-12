<?php

use Illuminate\Database\Seeder;

use App\Card;

class FillCardsFromJSON extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
    	$cast = function($obj) { 
            return [
                'name' => $obj->name,
                'id' => $obj->scryfall_id
            ]; 
        };

    	$list = json_decode(file_get_contents("oracle-cards-short.json"));
    	$true_list = array_map($cast, $list);

        Card::insert($true_list);
    }
}
