import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface YatraPlannerInput {
  startLocation: string; // e.g. "Mathura Junction", "Vrindavan", "Prem Mandir"
  startTime: string;     // "09:00"
  durationHours: number; // e.g. 5
  selectedTempleIds: string[]; // e.g. ["M010", "M011"]
  pace?: 'relaxed' | 'standard' | 'fast';
}

export interface ScheduledStop {
  stopNumber: number;
  templeId: string;
  name: string;
  area: string;
  arrivalTime: string;
  departureTime: string;
  allocatedMinutes: number;
  darshanTiming: string;
  suggestedParking: string;
  lastMileGuidance: string;
  travelLegFromPrevious: {
    estimatedMinutes: number;
    distanceGuidance: string;
    notice: string;
  };
  nearbyRecommended: string;
}

export interface YatraItineraryResponse {
  summary: {
    startLocation: string;
    startTime: string;
    endTime: string;
    totalDurationHours: number;
    stopsPlanned: number;
    feasibilityNotice: string;
  };
  stops: ScheduledStop[];
  returnGuidance: {
    suggestedDepartureTime: string;
    returnTransitTip: string;
  };
  planningDisclaimer: string;
}

export class YatraPlannerService {
  /**
   * Builds a practical, time-budgeted itinerary using reference data.
   */
  public static async planYatra(input: YatraPlannerInput): Promise<YatraItineraryResponse> {
    const { startLocation, startTime, durationHours, selectedTempleIds, pace = 'standard' } = input;

    // Fetch temple records
    const temples = await prisma.temple.findMany({
      where: {
        id: { in: selectedTempleIds }
      },
      include: {
        parkingList: true
      }
    });

    if (temples.length === 0) {
      throw new Error('Please select at least one temple from the Braj directory.');
    }

    // Sort order: prioritize clustering by city/zone to minimize backtracking
    // E.g. Mathura temples together, Vrindavan temples together
    const sortedTemples = [...temples].sort((a, b) => {
      if (a.city === b.city) return a.index - b.index;
      return a.city.localeCompare(b.city);
    });

    // Dwell times per temple by pace (minutes)
    const dwellTime = pace === 'relaxed' ? 75 : pace === 'fast' ? 45 : 60;
    const totalMinutesAvailable = Math.round(durationHours * 60);

    // Parse start time (e.g. "09:00")
    const [startH, startM] = startTime.split(':').map(Number);
    let currentMinutes = (startH || 9) * 60 + (startM || 0);

    const stops: ScheduledStop[] = [];
    let minutesUsed = 0;

    for (let i = 0; i < sortedTemples.length; i++) {
      const t = sortedTemples[i];
      // Estimate inter-temple travel time
      let transitMin = 20;
      let distanceGuidance = 'Local transit via e-rickshaw or main bypass';

      if (i === 0) {
        // From startLocation to first temple
        transitMin = 25;
        distanceGuidance = `Proceed from ${startLocation} towards ${t.area}`;
      } else {
        const prev = sortedTemples[i - 1];
        if (prev.city !== t.city) {
          transitMin = 45; // Between different Braj towns (e.g. Mathura <-> Vrindavan)
          distanceGuidance = `Inter-town route from ${prev.city} to ${t.city}`;
        } else {
          transitMin = 20; // Within same town
          distanceGuidance = `Short local transfer within ${t.city}`;
        }
      }

      // Check if adding this stop exceeds budget
      if (minutesUsed + transitMin + dwellTime > totalMinutesAvailable && stops.length > 0) {
        break; // Stop adding more if exceeding total hours
      }

      // Add transit time
      currentMinutes += transitMin;
      minutesUsed += transitMin;

      const arrivalH = Math.floor(currentMinutes / 60) % 24;
      const arrivalM = currentMinutes % 60;
      const arrivalTimeStr = `${String(arrivalH).padStart(2, '0')}:${String(arrivalM).padStart(2, '0')}`;

      // Add dwell time
      currentMinutes += dwellTime;
      minutesUsed += dwellTime;

      const departH = Math.floor(currentMinutes / 60) % 24;
      const departM = currentMinutes % 60;
      const departureTimeStr = `${String(departH).padStart(2, '0')}:${String(departM).padStart(2, '0')}`;

      stops.push({
        stopNumber: i + 1,
        templeId: t.id,
        name: t.name,
        area: `${t.area}, ${t.city}`,
        arrivalTime: arrivalTimeStr,
        departureTime: departureTimeStr,
        allocatedMinutes: dwellTime,
        darshanTiming: t.timing,
        suggestedParking: t.parking,
        lastMileGuidance: t.lastMile,
        travelLegFromPrevious: {
          estimatedMinutes: transitMin,
          distanceGuidance,
          notice: 'Estimated reference transit time under typical conditions; not live GPS telemetry.'
        },
        nearbyRecommended: t.nearby
      });
    }

    const endH = Math.floor(currentMinutes / 60) % 24;
    const endM = currentMinutes % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    let feasibilityNotice = 'Feasible itinerary within the requested time envelope.';
    if (stops.length < sortedTemples.length) {
      feasibilityNotice = `Notice: Due to the ${durationHours}-hour limit, only ${stops.length} out of ${sortedTemples.length} selected locations could be accommodated safely without rushing.`;
    }

    // Save itinerary record
    try {
      await prisma.itinerary.create({
        data: {
          durationHours,
          startLocation,
          placesList: JSON.stringify(selectedTempleIds),
          scheduleJson: JSON.stringify(stops),
          notes: feasibilityNotice
        }
      });
    } catch (err) {
      console.warn('Could not persist itinerary log:', err);
    }

    return {
      summary: {
        startLocation,
        startTime,
        endTime: endTimeStr,
        totalDurationHours: durationHours,
        stopsPlanned: stops.length,
        feasibilityNotice
      },
      stops,
      returnGuidance: {
        suggestedDepartureTime: endTimeStr,
        returnTransitTip: `Allow 30-45 minutes buffer for returning to ${startLocation} or heading to Mathura Junction during peak evening hours.`
      },
      planningDisclaimer: 'ESTIMATED ITINERARY DISCLAIMER: Travel durations, dwell times, and opening hours are based on static reference models. They do NOT reflect live congestion or unexpected temple aarti schedule closures.'
    };
  }
}
