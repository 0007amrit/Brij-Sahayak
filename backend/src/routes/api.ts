import { Router } from 'express';
import { TempleController } from '../controllers/templeController.js';
import { AssistantController } from '../controllers/assistantController.js';
import { PlannerController } from '../controllers/plannerController.js';
import { SafetyController } from '../controllers/safetyController.js';
import { AuthorityController } from '../controllers/authorityController.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'BrajSahayak',
    version: '1.0.0',
    mode: 'LOCAL_DEVELOPMENT',
    aiProvider: process.env.AI_PROVIDER || 'mock',
    database: 'Prisma/SQLite (AWS RDS compatible)',
    timestamp: new Date().toISOString()
  });
});

// Temples & Parking
router.get('/temples', TempleController.getTemples);
router.get('/temples/:id', TempleController.getTempleById);
router.get('/parking/:templeId', TempleController.getParkingByTempleId);

// AI Braj Assistant
router.post('/assistant', AssistantController.ask);

// Yatra Planner
router.post('/planner', PlannerController.plan);

// Safety & Crowd Monitoring (Public View)
router.get('/safety/locations', SafetyController.getLocations);
router.get('/safety/locations/:id', SafetyController.getLocationById);
router.post('/safety/metrics', SafetyController.updateMetrics);

// Authority Portal (Decision Support & Administration)
router.post('/authority/login', AuthorityController.login);
router.get('/authority/dashboard', AuthorityController.getDashboard);
router.get('/authority/alerts', AuthorityController.getAlerts);
router.patch('/authority/alerts/:id', AuthorityController.acknowledgeAlert);
router.post('/authority/simulate-scenario', AuthorityController.simulateScenario);

export default router;
