import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding BrajSahayak Database ---');

  // 1. Seed User
  await prisma.user.upsert({
    where: { email: 'admin@brajsahayak.gov.in' },
    update: {},
    create: {
      name: 'Braj Safety Officer',
      email: 'admin@brajsahayak.gov.in',
      passwordHash: 'authority2026', // In production, use bcrypt
      role: 'AUTHORITY'
    }
  });
  console.log('Seeded Authority Admin User.');

  // 2. Seed 32 Temples
  const templesPath = path.resolve(__dirname, '../../data/seed/temples-data.json');
  const templesData = JSON.parse(fs.readFileSync(templesPath, 'utf-8'));

  for (const t of templesData) {
    const temple = await prisma.temple.upsert({
      where: { id: t.id },
      update: {
        index: t.index,
        name: t.name,
        hindiName: t.hindiName || t.name,
        area: t.area,
        zone: t.zone,
        city: t.city,
        category: t.category,
        timing: t.timing,
        route: t.route,
        parking: t.parking,
        lastMile: t.lastMile,
        zoneRule: t.zoneRule,
        nearby: t.nearby,
        helpline: t.helpline,
        disclaimer: t.disclaimer,
        imageUrl: t.imageUrl,
        latitude: t.latitude,
        longitude: t.longitude
      },
      create: {
        id: t.id,
        index: t.index,
        name: t.name,
        hindiName: t.hindiName || t.name,
        area: t.area,
        zone: t.zone,
        city: t.city,
        category: t.category,
        timing: t.timing,
        route: t.route,
        parking: t.parking,
        lastMile: t.lastMile,
        zoneRule: t.zoneRule,
        nearby: t.nearby,
        helpline: t.helpline,
        disclaimer: t.disclaimer,
        imageUrl: t.imageUrl,
        latitude: t.latitude,
        longitude: t.longitude
      }
    });

    // Extract suggested parking options
    await prisma.parkingOption.deleteMany({ where: { templeId: t.id } });

    // Derive primary parking locations from text
    const parkingKeywords = ['ISBT', 'Ramlila Maidan', 'Railway Ground', 'Mandi Parking', 'ITI Parking', 'Darukh Parking', 'MVDA Parking', 'Prem Mandir Parking', 'Rukmini Vihar Multilevel', 'Pawan Hans Helipad', 'Chhatikara Road Parking', 'Barsana Town Parking', 'Nandgaon Town Parking', 'Dan Ghati Parikrama Parking', 'Kusum Sarovar Visitor Area', 'Gita Mandir Premises', 'Keshi Ghat Roadside', 'Radha Kund Parikrama Parking', 'Baldeo Town Parking'];
    
    let matchedOptions = parkingKeywords.filter(k => t.parking.toLowerCase().includes(k.toLowerCase().replace(' parking', '')));
    if (matchedOptions.length === 0) {
      matchedOptions = [`${t.area} Designated Visitor Parking`, `${t.name} Perimeter Parking`];
    }

    for (const opt of matchedOptions) {
      await prisma.parkingOption.create({
        data: {
          templeId: t.id,
          name: opt.endsWith('Parking') ? opt : `${opt} Parking`,
          locationDesc: `Designated reference parking for ${t.name}. Access via ${t.route.split(';')[0]}.`,
          vehicleTypes: 'Two-Wheeler, Four-Wheeler',
          isSuggested: true,
          capacityHint: 'Reference capacity: subject to local festival traffic',
          walkingMinutes: Math.floor(Math.random() * 8) + 4
        }
      });
    }
  }
  console.log(`Seeded ${templesData.length} Temples and Parking Options.`);

  // 3. Seed Crowd Monitoring Locations
  const crowdLocationsPath = path.resolve(__dirname, '../../data/seed/crowd-locations.json');
  const crowdData = JSON.parse(fs.readFileSync(crowdLocationsPath, 'utf-8'));

  for (const loc of crowdData) {
    await prisma.crowdLocation.upsert({
      where: { id: loc.id },
      update: {
        name: loc.name,
        locationType: loc.locationType,
        area: loc.area,
        capacity: loc.capacity,
        currentCrowd: loc.currentCrowd,
        entryRate: loc.entryRate,
        exitRate: loc.exitRate,
        notes: loc.notes,
        latitude: loc.latitude,
        longitude: loc.longitude
      },
      create: {
        id: loc.id,
        name: loc.name,
        locationType: loc.locationType,
        area: loc.area,
        capacity: loc.capacity,
        currentCrowd: loc.currentCrowd,
        entryRate: loc.entryRate,
        exitRate: loc.exitRate,
        notes: loc.notes,
        latitude: loc.latitude,
        longitude: loc.longitude
      }
    });

    // Calculate initial metric
    const occupancyRatio = loc.currentCrowd / loc.capacity;
    let riskLevel = 'LOW';
    let riskScore = 25;

    if (occupancyRatio >= 1.2 || (occupancyRatio >= 0.9 && loc.entryRate > loc.exitRate * 1.5)) {
      riskLevel = 'CRITICAL';
      riskScore = 94;
    } else if (occupancyRatio >= 0.8 || (occupancyRatio >= 0.7 && loc.entryRate > loc.exitRate * 1.2)) {
      riskLevel = 'HIGH';
      riskScore = 78;
    } else if (occupancyRatio >= 0.5) {
      riskLevel = 'MEDIUM';
      riskScore = 48;
    }

    await prisma.crowdMetric.create({
      data: {
        locationId: loc.id,
        crowdCount: loc.currentCrowd,
        capacity: loc.capacity,
        entryRate: loc.entryRate,
        exitRate: loc.exitRate,
        occupancyRatio: parseFloat(occupancyRatio.toFixed(2)),
        riskLevel,
        riskScore
      }
    });

    // If Critical or High, seed active alert
    if (riskLevel === 'CRITICAL') {
      await prisma.crowdAlert.create({
        data: {
          locationId: loc.id,
          riskLevel: 'CRITICAL',
          riskScore: 94,
          title: `CRITICAL CROWD SURGE: ${loc.name}`,
          reasons: JSON.stringify([
            `Current crowd (${loc.currentCrowd}) exceeds designed threshold capacity (${loc.capacity}) by ${(occupancyRatio * 100 - 100).toFixed(0)}%.`,
            `Entry rate (${loc.entryRate}/min) heavily exceeds exit rate (${loc.exitRate}/min), creating dangerous net accumulation of ${loc.entryRate - loc.exitRate}/min.`,
            `Narrow bottleneck points identified near entry gates.`
          ]),
          recommendedActions: JSON.stringify([
            `Activate auxiliary holding zones at outer boundary.`,
            `Temporarily pause entry batches into inner sanctum lanes.`,
            `Dispatch advisory to e-rickshaw stands to hold incoming traffic.`,
            `Open one-way egress gate #2 to accelerate dispersal.`
          ]),
          status: 'ACTIVE'
        }
      });
    } else if (riskLevel === 'HIGH') {
      await prisma.crowdAlert.create({
        data: {
          locationId: loc.id,
          riskLevel: 'HIGH',
          riskScore: 78,
          title: `HIGH CONGESTION ADVISORY: ${loc.name}`,
          reasons: JSON.stringify([
            `Occupancy ratio reached ${(occupancyRatio * 100).toFixed(0)}% of recommended threshold.`,
            `Inflow velocity is outpacing outflow.`
          ]),
          recommendedActions: JSON.stringify([
            `Announce queue delays over public address system.`,
            `Position volunteer marshals at platform concourse staircases.`,
            `Verify emergency clearance lanes remain unobstructed.`
          ]),
          status: 'ACTIVE'
        }
      });
    }
  }

  console.log(`Seeded ${crowdData.length} Monitored Crowd Locations and Initial Telemetry.`);
  console.log('--- Database Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
