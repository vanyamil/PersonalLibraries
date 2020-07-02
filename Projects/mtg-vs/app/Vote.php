<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Vote extends Model 
{
    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = [
        'voted_at', 
    ];

    /**
     * Get the tournament for which this vote was cast.
     */
    public function cards()
    {
        return $this->belongsTo('App\Tournament');
    }

    /**
     * Get the winning card.
     */
    public function winner()
    {
        return $this->belongsTo('App\Card', 'winner', 'scryfall_id');
    }

    /**
     * Get the losing card.
     */
    public function loser()
    {
        return $this->belongsTo('App\Card', 'loser', 'scryfall_id');
    }
}