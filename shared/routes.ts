import { z } from 'zod';
import { insertUserSchema, insertApartmentSchema, insertBookingSchema, insertMaintenanceSchema, insertPaymentSchema, users, apartments, bookings, maintenanceRequests, payments } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  apartments: {
    list: {
      method: 'GET' as const,
      path: '/api/apartments',
      input: z.object({
        minPrice: z.coerce.number().optional(),
        maxPrice: z.coerce.number().optional(),
        bedrooms: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof apartments.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/apartments/:id',
      responses: {
        200: z.custom<typeof apartments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/apartments',
      input: insertApartmentSchema,
      responses: {
        201: z.custom<typeof apartments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/apartments/:id',
      input: insertApartmentSchema.partial(),
      responses: {
        200: z.custom<typeof apartments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  bookings: {
    list: {
      method: 'GET' as const,
      path: '/api/bookings',
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookings',
      input: insertBookingSchema,
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id/status',
      input: z.object({
        status: z.enum(["pending", "confirmed", "cancelled"]),
      }),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  maintenance: {
    list: {
      method: 'GET' as const,
      path: '/api/maintenance',
      responses: {
        200: z.array(z.custom<typeof maintenanceRequests.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/maintenance',
      input: insertMaintenanceSchema,
      responses: {
        201: z.custom<typeof maintenanceRequests.$inferSelect>(),
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/maintenance/:id/status',
      input: z.object({
        status: z.enum(["open", "in_progress", "resolved"]),
      }),
      responses: {
        200: z.custom<typeof maintenanceRequests.$inferSelect>(),
      },
    },
  },
  payments: {
    process: {
      method: 'POST' as const,
      path: '/api/payments',
      input: insertPaymentSchema,
      responses: {
        201: z.custom<typeof payments.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
