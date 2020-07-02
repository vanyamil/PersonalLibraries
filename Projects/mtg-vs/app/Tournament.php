<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Tournament extends Model 
{
    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The "type" of the primary ID column.
     *
     * @var string
     */
    protected $keyType = 'char';

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = [
        'due_at', 
        'start_time',
    ];

    /**
     * Get the cards that participate in this round-robin tournament.
     */
    public function cards()
    {
        return $this->belongsToMany('App\Card', 'round_robin_cards');
    }

    /**
     * Get the votes cast on this tournament.
     */
    public function votes()
    {
        return $this->hasMany('App\Vote');
    }


}