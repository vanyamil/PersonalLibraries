<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRoundRobinCardsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('round_robin_cards', function (Blueprint $table) {
            $table->char('tournament_id', 9)
                  ->primary();

            $table->uuid('card_id')
                  ->index();

            /*********************/

            $table->foreign('tournament_id')
                  ->references('id')
                  ->on('tournaments')
                  ->onDelete('cascade');

            $table->foreignUuid('card_id')
                  ->references('scryfall_id')
                  ->on('cards');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('card_tournament');
    }
}
