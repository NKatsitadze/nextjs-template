import { z } from 'zod';

export const ObjectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Must be a valid id');

export const IdParamsSchema = z.object({ id: ObjectIdSchema });
