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
        'voted_at'
    ];

    /**
     * Get the matchup for which this vote was cast.
     */
    public function matchup()
    {
        return $this->belongsTo('App\Matchup');
    }

    /**
     * Get the tournament for which this vote is recorded.
     */
    public function tournament()
    {
        return $this->matchup()->tournament();
    }
}