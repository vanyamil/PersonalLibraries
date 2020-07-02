<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTournamentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tournaments', function (Blueprint $table) {
            $table->char('id', 9)
                  ->primary();

            $table->char('password', 9);

            $table->timestamp('start_time');

            $table->timestamp('due_at');

            $table->boolean('active')
                  ->default(0);

            $table->boolean('public');

            $table->enum('type', [
                'round-robin',
                'fixed-pairs'
            ]);

            $table->timestamps();

            $table->string('name', 100);

            $table->text('description');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tournaments');
    }
}
