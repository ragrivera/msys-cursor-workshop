import { Router } from 'express';
import { z } from 'zod';
import { db } from '@/database';
import { logger } from '@/utils/logger';

const router = Router();

// Validation schemas
const arenaSchema = z.object({
  name: z.string().min(1, 'Arena name is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  location: z.string().optional(),
});

/**
 * @swagger
 * /api/arenas:
 *   get:
 *     summary: Get all arenas
 *     tags: [Arenas]
 *     responses:
 *       200:
 *         description: List of arenas
 */
router.get('/', async (_req, res, next) => {
  try {
    const arenas = await db('arenas').select('*').orderBy('name');
    res.json(arenas);
  } catch (err) {
    logger.error('Error fetching arenas:', err);
    return next(err);
  }
});

/**
 * @swagger
 * /api/arenas:
 *   post:
 *     summary: Create a new arena
 *     tags: [Arenas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               location:
 *                 type: string
 */
router.post('/', async (req, res, next) => {
  try {
    const validatedData = arenaSchema.parse(req.body);

    const [arena] = await db('arenas').insert(validatedData).returning('*');

    logger.info(`Arena created: ${arena.name}`);
    res.status(201).json(arena);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: err.errors,
      });
    }
    logger.error('Error creating arena:', err);
    return next(err);
  }
});

/**
 * @swagger
 * /api/arenas/{id}:
 *   get:
 *     summary: Get arena by ID
 *     tags: [Arenas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const arena = await db('arenas').where({ id }).first();

    if (!arena) {
      return res.status(404).json({
        status: 'error',
        message: 'Arena not found',
      });
    }

    res.json(arena);
  } catch (err) {
    logger.error('Error fetching arena:', err);
    return next(err);
  }
});

export default router;
