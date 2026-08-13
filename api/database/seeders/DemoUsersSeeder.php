<?php

namespace Database\Seeders;

use App\Models\Measurement;
use App\Models\Profile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DemoUsersSeeder extends Seeder
{
    private const BODY_PART_BASE_CM = [
        'neck' => 38.0,
        'shoulder_left' => 44.0,
        'shoulder_right' => 44.0,
        'chest' => 100.0,
        'waist' => 88.0,
        'hips' => 102.0,
        'thigh_left' => 58.0,
        'thigh_right' => 58.0,
        'calf_left' => 38.0,
        'calf_right' => 38.0,
        'bicep_left' => 32.0,
        'bicep_right' => 32.0,
        'forearm_left' => 27.0,
        'forearm_right' => 27.0,
    ];

    private const ARM_PARTS = [
        'shoulder_left', 'shoulder_right', 'bicep_left', 'bicep_right', 'forearm_left', 'forearm_right',
    ];

    private const WEEKS_OF_HISTORY = 8;

    /**
     * Seed two demo users, each with a profile and 8 weeks (2 months) of
     * measurements logged once a week across every tracked body part.
     */
    public function run(): void
    {
        $this->seedUser(
            email: 'alex.rivera@example.com',
            name: 'Alex Rivera',
            profile: ['first_name' => 'Alex', 'last_name' => 'Rivera', 'age' => 29, 'height' => 178, 'weight' => 82, 'gender' => 'male', 'goal_note' => 'Cutting while keeping arm size.'],
            weeklyLossRate: -0.30,
            weeklyArmRate: 0.12,
        );

        $this->seedUser(
            email: 'jordan.blake@example.com',
            name: 'Jordan Blake',
            profile: ['first_name' => 'Jordan', 'last_name' => 'Blake', 'age' => 34, 'height' => 165, 'weight' => 68, 'gender' => 'female', 'goal_note' => 'General toning, steady and slow.'],
            weeklyLossRate: -0.18,
            weeklyArmRate: -0.10,
        );
    }

    private function seedUser(string $email, string $name, array $profile, float $weeklyLossRate, float $weeklyArmRate): void
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => 'password']
        );

        Profile::updateOrCreate(['user_id' => $user->id], $profile);

        Measurement::where('user_id', $user->id)->delete();

        $today = Carbon::now();

        for ($week = 0; $week <= self::WEEKS_OF_HISTORY; $week++) {
            $measuredAt = (clone $today)->subDays(7 * (self::WEEKS_OF_HISTORY - $week))->setTime(9, 0, 0);

            foreach (self::BODY_PART_BASE_CM as $part => $base) {
                $weeklyRate = in_array($part, self::ARM_PARTS, true) ? $weeklyArmRate : $weeklyLossRate;
                $jitter = mt_rand(-15, 15) / 100;
                $value = round($base + ($weeklyRate * $week) + $jitter, 1);

                Measurement::create([
                    'user_id' => $user->id,
                    'body_part' => $part,
                    'value_cm' => $value,
                    'measured_at' => $measuredAt,
                ]);
            }
        }
    }
}
