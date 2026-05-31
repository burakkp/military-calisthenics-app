# Military Calisthenics Tracker - Project Plan

## Project Overview

Build a personal Military Calisthenics Tracker Progressive Web App (PWA) for a single user.

The application helps track workouts, progression, weight, push-up records, workout completion, notes, and training streaks.

Primary goal:

* Simple
* Fast
* Mobile-first
* No monthly cost
* Personal use only

The application must work on:

* Android
* Desktop browsers

The application should be installable as a PWA.

---

# User Profile

Target User:

* Age: 37
* Height: 177 cm
* Weight: 90 kg
* Current max push-ups: 10
* No pull-up bar available
* Football player
* Wants military-style fitness training
* Wants long-term workout history preservation

---

# Technology Stack

Frontend:

* React
* TypeScript
* Vite
* TailwindCSS

PWA:

* vite-plugin-pwa

Hosting:

* Cloudflare Pages

Backend:

* Cloudflare Pages Functions

Storage:

* Cloudflare KV

Source Control:

* GitHub

CI/CD:

* GitHub Actions

---

# Architecture

```text
User
 ↓
PWA (React)
 ↓
Pages Function API
 ↓
Cloudflare KV
```

LocalStorage should be used as an offline cache.

Cloudflare KV is the source of truth.

---

# MVP Features

## Dashboard

Display:

* Current Week
* Weight
* Current Push-up Max
* Completion Percentage
* Current Streak
* Longest Streak

Example:

Week 4
Weight: 88.2kg
Push-up Max: 15
Current Streak: 8 days

---

## Workout Plan

Training Days:

Monday

* Push-ups
* Squats
* Plank
* Glute Bridge

Wednesday

* Jumping Jacks
* Burpees
* Mountain Climbers
* Walking

Friday

* Push-ups
* Reverse Lunges
* Squats
* Side Plank

Sunday

* Brisk Walk
* Jog/Walk

---

## Workout Tracking

User can:

* Mark workout completed
* Mark workout incomplete
* Save workout notes

Example:

"Round 3 was difficult"

---

## Exercise Library

Each exercise must include:

* Name
* Description
* Easier variation
* Common mistakes
* Safety tips

Exercises:

* Push-up
* Squat
* Plank
* Side Plank
* Glute Bridge
* Reverse Lunge
* Jumping Jack
* Burpee
* Mountain Climber
* Brisk Walk

---

## Progress Tracking

Track:

* Weight History
* Push-up Max History
* Weekly Completion Rate
* Streak History

Visual charts are optional in MVP.

---

## Notes

Allow user to save notes.

Examples:

* Knee feels better
* Push-ups easier today
* Need longer warm-up

---

# Offline Support

Requirements:

* App must work without internet
* Show last synchronized data
* Queue updates locally
* Sync automatically when online

Use:

* LocalStorage

Synchronization strategy:

LocalStorage -> Cloudflare KV

---

# Cloudflare KV Data Model

Key:

fitness:user

Value:

```json
{
  "profile": {
    "weight": 90,
    "maxPushups": 10
  },
  "week": 1,
  "streak": 0,
  "longestStreak": 0,
  "completed": {
    "monday": true,
    "wednesday": false,
    "friday": false,
    "sunday": false
  },
  "notes": [
    {
      "date": "2026-05-31",
      "text": "Workout completed"
    }
  ]
}
```

---

# API Endpoints

GET /api/progress

Returns:

```json
{
  "success": true,
  "data": {}
}
```

POST /api/progress

Body:

```json
{
  "week": 2,
  "weight": 89.5
}
```

Response:

```json
{
  "success": true
}
```

---

# Security

Personal project.

No user registration.

Use:

X-App-Secret header

Environment Variable:

APP_SECRET

Pages Function validates secret before processing requests.

---

# PWA Requirements

Installable

Offline capable

Responsive

Home screen icon

Splash screen

Auto update enabled

---

# GitHub Actions

Pipeline:

1. Install dependencies
2. Run lint
3. Run build
4. Deploy to Cloudflare Pages

Branch Strategy:

main

Automatic deployment on merge.

---

# Future Version 2

Potential Features:

* Workout timer
* Rest timer
* Push notifications
* Exercise GIFs
* Progress charts
* Export data
* Import data
* Google Fit integration
* Garmin integration

---

# Future Version 3

AI Coach

User can enter:

* Pain levels
* Recovery
* Workout difficulty

AI suggests:

* Deload weeks
* Progression
* Exercise substitutions

Potential provider:

* OpenAI API

Not required for MVP.

---

# Success Criteria

The application is successful if:

* User can install it on Android
* User can track workouts daily
* User does not lose workout history
* User can continue using app after changing devices
* Hosting cost remains near zero
* Application loads in less than 2 seconds

```
```
