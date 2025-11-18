/**
 * TryHackMe Stats Module
 * Displays enhanced stats cards with user progress data
 * 
 * TO UPDATE YOUR STATS:
 * 1. Visit your TryHackMe profile: https://tryhackme.com/p/[username]
 * 2. Update the values in the 'userStats' object below with your current stats
 * 3. The stats will automatically refresh when the page loads
 */

(() => {
    'use strict';

    // TryHackMe username
    const THM_USERNAME = 'DankKnight';
    const THM_PROFILE_URL = `https://tryhackme.com/p/${THM_USERNAME}`;

    // UPDATE THESE VALUES WITH YOUR CURRENT TRYHACKME STATS
    // Note: TryHackMe doesn't have a public API, so these need to be manually updated
    const userStats = {
        rank: '7%',           // Your global rank percentage (e.g., "Top 7%", "5%")
        level: 8,            // Your current level
        streak: 45,           // Your current day streak
        roomsCompleted: 59,  // Total rooms completed
        badgesEarned: 10,     // Total badges earned
        userRank: 'Top 7%'    // Display format for rank (used in card)
    };

    document.addEventListener('DOMContentLoaded', () => {
        const statsContainer = document.getElementById('thm-stats-container');
        if (!statsContainer) return;

        renderStatsCards(statsContainer);
    });

    /**
     * Render stat cards with user data
     */
    function renderStatsCards(container) {
        const stats = [
            {
                icon: 'fas fa-trophy',
                label: 'Global Rank',
                value: userStats.userRank,
                color: 'text-yellow-500'
            },
            {
                icon: 'fas fa-layer-group',
                label: 'Level',
                value: userStats.level,
                color: 'text-cyber-green'
            },
            {
                icon: 'fas fa-fire',
                label: 'Day Streak',
                value: userStats.streak,
                color: 'text-orange-500'
            },
            {
                icon: 'fas fa-door-open',
                label: 'Rooms Completed',
                value: userStats.roomsCompleted,
                color: 'text-blue-500'
            },
            {
                icon: 'fas fa-award',
                label: 'Badges Earned',
                value: userStats.badgesEarned,
                color: 'text-purple-500'
            }
        ];

        container.innerHTML = stats.map(stat => `
            <div class="thm-stat-card">
                <div class="thm-stat-icon ${stat.color}">
                    <i class="${stat.icon}" aria-hidden="true"></i>
                </div>
                <div class="thm-stat-content">
                    <div class="thm-stat-value">${stat.value}</div>
                    <div class="thm-stat-label">${stat.label}</div>
                </div>
            </div>
        `).join('');
    }
})();
