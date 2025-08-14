import { Router } from 'express';
import { z } from 'zod';
import {
  listAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from './appointments.service';

const router = Router();

// Validation schemas
const appointmentSchema = z.object({
  arena_id: z.number().int(),
  start_time: z.string(),
  end_time: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const appointments = await listAppointments();
    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const appointment = await getAppointmentById(id);
    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const parse = appointmentSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);
    const appointment = await createAppointment(parse.data);
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parse = appointmentSchema.partial().safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);
    const updated = await updateAppointment(id, parse.data);
    if (!updated)
      return res.status(404).json({ message: 'Appointment not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteAppointment(id);
    if (!deleted)
      return res.status(404).json({ message: 'Appointment not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

