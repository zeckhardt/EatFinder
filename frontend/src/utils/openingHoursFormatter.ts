interface DayHours {
    day: string;
    hours: string;
}

const combineConsecutiveDays = (dayHours: DayHours[]): DayHours[] => {
    const result: DayHours[] = [];
    if (dayHours.length === 0) {
        return result;
    }

    let i = 0;
    while (i < dayHours.length) {
        const currentDay = dayHours[i];
        let consecutiveEnd = i;

        // Find consecutive days with same hours
        // Make sure we don't combine if the hours are 'Closed' and we have specific hours coming up
        while (
            consecutiveEnd + 1 < dayHours.length &&
            dayHours[consecutiveEnd + 1].hours === currentDay.hours
            ) {
            consecutiveEnd++;
        }

        if (consecutiveEnd > i) {
            // Multiple consecutive days with same hours
            result.push({
                day: `${currentDay.day} - ${dayHours[consecutiveEnd].day}`,
                hours: currentDay.hours
            });
        } else {
            result.push(currentDay);
        }
        i = consecutiveEnd + 1;
    }
    return result;
};

export const formatOpeningHours = (openingHours?: string): DayHours[] => {
    if (!openingHours || openingHours.toLowerCase() === 'unknown') {
        return [{ day: '', hours: 'Unknown' }];
    }

    // Handle special cases
    if (openingHours.toLowerCase() === '24/7') {
        return [{ day: 'All Days', hours: '24/7' }];
    }
    if (openingHours.toLowerCase() === 'closed' || openingHours.toLowerCase() === 'off') {
        return [{ day: 'Status', hours: 'Closed' }];
    }

    const dayMap: { [key: string]: string } = {
        'mo': 'Monday',
        'tu': 'Tuesday',
        'we': 'Wednesday',
        'th': 'Thursday',
        'fr': 'Friday',
        'sa': 'Saturday',
        'su': 'Sunday',
        'ph': 'Public Holiday' // Added Public Holiday to map
    };

    const allDaysOrdered = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayHours: { [key: string]: string } = {};

    // Initialize all days as 'Closed'
    allDaysOrdered.forEach(day => {
        dayHours[day] = 'Closed';
    });

    // Add Public Holiday to dayHours if it's explicitly mentioned
    dayHours['Public Holiday'] = 'Closed'; // Default for PH

    try {
        const timePeriods = openingHours.split(';').map(period => period.trim());

        timePeriods.forEach(period => {
            const match = period.match(/^([a-zA-Z,-]+)\s+(.+)$/);

            if (match) {
                const daysPart = match[1].toLowerCase();
                const timesPart = match[2];

                const daysToApply: string[] = [];

                if (daysPart.includes('-')) {
                    // Handle ranges like "mo-fr"
                    const rangeParts = daysPart.split('-');
                    if (rangeParts.length === 2) {
                        const startDayAbbr = rangeParts[0].trim();
                        const endDayAbbr = rangeParts[1].trim();

                        const startDay = dayMap[startDayAbbr];
                        const endDay = dayMap[endDayAbbr];

                        if (startDay && endDay) {
                            const startIndex = allDaysOrdered.indexOf(startDay);
                            const endIndex = allDaysOrdered.indexOf(endDay);

                            if (startIndex !== -1 && endIndex !== -1) {
                                for (let i = startIndex; i <= endIndex; i++) {
                                    daysToApply.push(allDaysOrdered[i]);
                                }
                            }
                        }
                    }
                } else {
                    // Handle comma-separated days or single day like "mo,we,fr" or "su" or "ph"
                    const individualDayAbbrs = daysPart.split(',');
                    individualDayAbbrs.forEach(dayAbbr => {
                        const fullDay = dayMap[dayAbbr.trim()];
                        if (fullDay) {
                            daysToApply.push(fullDay);
                        }
                    });
                }

                // Apply hours to all identified days
                daysToApply.forEach(day => {
                    dayHours[day] = timesPart;
                });
            } else {
                // If no day pattern is found, try to parse as time only (applies to all days not explicitly set)
                // This part might be problematic if it overwrites specific daily hours.
                // Consider if a time-only string should truly apply to *all* days.
                // For the given example, this block might not be strictly necessary.
                if (period.match(/^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/)) {
                    allDaysOrdered.forEach(day => {
                        if (dayHours[day] === 'Closed') { // Only apply if not already set by a specific day pattern
                            dayHours[day] = period;
                        }
                    });
                    // Also apply to Public Holiday if not set
                    if (dayHours['Public Holiday'] === 'Closed') {
                        dayHours['Public Holiday'] = period;
                    }
                }
            }
        });

        const result: DayHours[] = [];

        // Add normal days in order
        allDaysOrdered.forEach(day => {
            result.push({
                day: day,
                hours: dayHours[day]
            });
        });

        // Add Public Holiday if it was specified and has hours
        if (openingHours.toLowerCase().includes('ph') && dayHours['Public Holiday'] !== 'Closed') {
            result.push({
                day: 'Public Holiday',
                hours: dayHours['Public Holiday']
            });
        }


        // Combine consecutive days with same hours
        return combineConsecutiveDays(result);

    } catch (error) {
        console.warn('Error parsing opening hours:', openingHours, error);
        return [{ day: '', hours: openingHours }];
    }
};