<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    protected $fillable = [
        'user_id', 'first_name', 'last_name', 'age', 'height', 'weight', 'gender', 'goal_note',
    ];

    protected $casts = [
        'age' => 'integer',
        'height' => 'float',
        'weight' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
