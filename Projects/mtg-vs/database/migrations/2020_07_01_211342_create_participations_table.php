<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateParticipationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('participations', function (Blueprint $table) {
            $table->char('tournament_id', 9);

            $table->uuid('card_id')
                  ->index();

            $table->integer('wins')->default(0);
            $table->integer('losses')->default(0);

            /*********************/

            $table->primary(['tournament_id', 'card_id']);

            /*********************/

            $table->foreign('tournament_id')
                  ->references('id')
                  ->on('tournaments')
                  ->onDelete('cascade');

            $table->foreign('card_id')
                  ->references('id')
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
        Schema::dropIfExists('participations');
    }
}
