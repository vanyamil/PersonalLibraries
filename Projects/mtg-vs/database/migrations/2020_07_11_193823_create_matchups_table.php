<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMatchupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('matchups', function (Blueprint $table) {
            $table->id();
            $table->timestamp('created_at')
                  ->useCurrent();

            $table->char('tournament_id', 9);
            $table->uuid('card1_id');
            $table->uuid('card2_id');

            /*********************/

            $table->foreign('tournament_id')
                  ->references('id')
                  ->on('tournaments')
                  ->onDelete('cascade');

            $table->foreign('card1_id')
                  ->references('id')
                  ->on('cards');

            $table->foreign('card2_id')
                  ->references('id')
                  ->on('cards');

            /*********************/

            $table->unique(['tournament_id', 'card1_id', 'card2_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('matchups');
    }
}
