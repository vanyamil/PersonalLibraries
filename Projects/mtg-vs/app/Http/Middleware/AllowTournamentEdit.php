<?php

namespace App\Http\Middleware;

use Closure;

use App\Tournament;

class AllowTournamentEdit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $tournament = Tournament::findOrFail($request->route('tournament'));
        $password = $request->input('password');
        
        if($password != $tournament->password)
            return abort(401);

        return $next($request);
    }
}
