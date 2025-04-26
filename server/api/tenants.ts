import express from 'express';
import { TenantModel } from '../db/models/Tenant';

const router = express.Router();

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Tenants test endpoint is working' });
});

// GET /api/tenants - List all tenants
router.get('/', async (req, res) => {
  try {
    const tenants = await TenantModel.getAll();
    res.json({ tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ message: 'Failed to fetch tenants' });
  }
});

export default router;