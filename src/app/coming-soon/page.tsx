'use client';

import { useComingSoonCountDown } from "hooks/useCominSoonCountDown";
import React from "react";

export default function ReleasePage() {
    const { days, hours, minutes, seconds } = useComingSoonCountDown("2025-12-11T00:00:00");

    const arrayUnitTime = [
        {
            name: 'days',
            unit: days
        },
        {
            name: 'hours',
            unit: hours
        },
        {
            name: 'minutes',
            unit: minutes
        },
        {
            name: 'seconds',
            unit: seconds
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
            {/* Countdown */}
            <h1 className="text-3xl font-bold mb-4">🚀 Coming Soon</h1>
            <div className="flex gap-6 text-center mb-12">
                {arrayUnitTime.map((item) => (
                    <div key={item.name} className="bg-white shadow-lg rounded-2xl p-4 w-20">
                        <p className="text-2xl font-bold">{item.unit}</p>
                        <p className="text-xs uppercase">{item.name}</p>
                    </div>
                ))}
            </div>

            {/* Features */}
            <section className="mb-12 w-full max-w-2xl">
                <h2 className="text-xl font-semibold mb-4">✨ Features</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Fast performance</li>
                    <li>User-friendly design</li>
                    <li>Secure and reliable</li>
                </ul>
            </section>

            <section className="mb-12 w-full max-w-2xl">
                <p className="text-justify">Meet iMan—the classroom co-pilot teachers actually love. Purpose-built for busy rooms, iMan keeps the day flowing with visual schedules, gentle timers, and playful transitions; sparks richer learning with storytime prompts, small-group coaching, and hands-on challenges; and lightens paperwork with objective, teacher-approved notes and photo moments. iMan helps with cleanup, turn-taking, and peaceful problem-solving, while privacy-first controls, offline reliability, and a one-tap pause keep you in charge. No coding required—just drag, drop, and go. Safe, durable, and endlessly adaptable, iMan engages kids, saves time, and turns everyday moments into meaningful memories—finally, a robot that fits your classroom (not the other way around).</p>
            </section>

            {/* Pictures */}
            <section className="mb-12 w-full max-w-2xl">
                <h2 className="text-xl font-semibold mb-4">🖼️ Picture</h2>
                <div className="grid grid-cols-1 gap-4">
                    <img src="iMan-2.jpg" alt="pic1" className="rounded-lg shadow w-full" />
                </div>
            </section>

            {/* Price */}
            {/* <section className="text-center w-full max-w-2xl">
                <h2 className="text-xl font-semibold mb-4">💰 Price</h2>
                <p className="text-2xl font-bold text-green-600">$1500</p>
            </section> */}
        </div>
    );
}
