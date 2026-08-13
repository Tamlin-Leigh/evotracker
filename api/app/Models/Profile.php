<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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

    public function photos(): BelongsToMany
    {
        return $this->belongsToMany(Photo::class, 'profile_photo')
            ->withPivot('is_current')
            ->withTimestamps();
    }

    public function currentPhoto(): ?Photo
    {
        return $this->photos()->wherePivot('is_current', true)->first();
    }
}
