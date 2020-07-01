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
}