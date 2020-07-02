<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVotesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();

            $table->char('tournament_id', 9)
                  ->index();

            $table->uuid('winner')
                  ->index();

            $table->uuid('loser')
                  ->index();

            $table->boolean('ordered');

            $table->string('voter', 20);

            $table->timestamp('voted_at')
                  ->useCurrent();

            /*********************/

            $table->foreign('tournament_id')
                  ->references('id')
                  ->on('tournaments')
                  ->onDelete('cascade');

            $table->foreign('winner')
                  ->references('scryfall_id')
                  ->on('cards');

            $table->foreign('loser')
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
        Schema::dropIfExists('votes');
    }
}
