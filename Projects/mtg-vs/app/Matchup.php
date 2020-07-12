<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Matchup extends Model 
{
    /**
     * Get the cards that participate in this tournament.
     */
    public function cards()
    {
        return [
            $this->belongsTo('App\Card', 'card1_id'),
            $this->belongsTo('App\Card', 'card2_id')
        ];
    }

    /**
     * Get the tournament for which this matchup is recorded.
     */
    public function tournament()
    {
        return $this->belongsTo('App\Tournament');
    }
}