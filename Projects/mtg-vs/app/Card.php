<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Card extends Model 
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
     * Get the tournaments in which this card participated.
     */
    public function tournaments()
    {
        return $this->belongsToMany('App\Tournament', 'participations')->withPivot(['wins', 'losses']);
    }

    /**
     * Scope a query to only include cards from a given tournament.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  mixed  $tournament
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInTournament($query, $tournament)
    {
        return $query->whereIn('id', function($query) use ($tournament) { 
            $query->select('card_id')
                ->from('participations')
                ->where('tournament_id', $tournament);
        });
    }

    /**
     * Return a random card.
     * @param $only_id Should only the ID be returned or the full card (default)
     */
    public static function random($only_id = false) {
        // Get one random from count
        $cardCount = self::count();
        $counter = rand(0, $cardCount - 1);
        $query = self::skip($counter);

        // Return either ID or the full card as requested
        return $only_id ? $query->value('id') : $query->first();
    }

    /** Return the name of a card from its ID */
    public static function name_from_id($id) {
        return self::find($id, 'name');
    }

    /** Return the link to the card's image */
    public static function image_link($card) {
        $id = is_string($card) ? $card : $card->id;
        $one = $id[0];
        $two = $id[1];
        return "https://img.scryfall.com/cards/normal/front/${one}/${two}/${id}.jpg";
    }
}