import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Health check endpoint for monitoring and observability
 * Returns the status of critical services (Firestore connectivity)
 */
export const healthCheckFn = functions.https.onRequest(async (req, res) => {
    // Set CORS headers for monitoring tools
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    const startTime = Date.now();
    const services: Record<string, 'healthy' | 'unhealthy'> = {};
    let overallStatus: 'healthy' | 'unhealthy' = 'healthy';

    try {
        // Check Firestore connectivity
        const db = getFirestore();
        await db.collection('_health').doc('ping').set({
            timestamp: Date.now(),
            source: 'healthCheck'
        });
        services.firestore = 'healthy';
    } catch (error) {
        services.firestore = 'unhealthy';
        overallStatus = 'unhealthy';
        console.error('Firestore health check failed:', error);
    }

    const responseTime = Date.now() - startTime;

    const response = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        services,
        version: process.env.FUNCTIONS_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
    };

    if (overallStatus === 'healthy') {
        res.status(200).json(response);
    } else {
        res.status(503).json(response);
    }
});
