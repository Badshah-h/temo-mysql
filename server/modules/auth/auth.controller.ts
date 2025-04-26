import express from 'express';
import { authService } from './auth.service';
import { handleError } from '../../utils/errorHandler';

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { tenantSlug, email, password, fullName } = req.body;
    const result = await authService.register({ tenantSlug, email, password, fullName });
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error);
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { tenantSlug, email, password } = req.body;
    const result = await authService.login({ tenantSlug, email, password });
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

// Get current user endpoint
router.get('/me', authService.authenticate, async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json({ user });
  } catch (error) {
    handleError(res, error);
  }
});

export default router; 