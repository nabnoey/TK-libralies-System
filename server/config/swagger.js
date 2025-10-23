const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TK Libraries System API',
      version: '1.0.0',
      description: 'API documentation for TK Libraries System - Movie Seat & Karaoke Room Reservation System',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            userId: {
              type: 'integer',
              description: 'User ID',
            },
            email: {
              type: 'string',
              description: 'User email',
            },
            name: {
              type: 'string',
              description: 'User name',
            },
            provider: {
              type: 'string',
              description: 'Authentication provider (google, dev-test, etc.)',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
            },
          },
        },
        MovieSeat: {
          type: 'object',
          properties: {
            movieId: {
              type: 'integer',
              description: 'Movie Seat ID',
            },
            name: {
              type: 'string',
              description: 'Movie seat name',
            },
            image: {
              type: 'string',
              description: 'Movie seat image URL',
            },
            status: {
              type: 'boolean',
              description: 'Seat status (true = available, false = occupied)',
            },
          },
        },
        KaraokeRoom: {
          type: 'object',
          properties: {
            karaokeId: {
              type: 'integer',
              description: 'Karaoke Room ID',
            },
            name: {
              type: 'string',
              description: 'Karaoke room name',
            },
            image: {
              type: 'string',
              description: 'Karaoke room image URL',
            },
            status: {
              type: 'boolean',
              description: 'Room status (true = available, false = occupied)',
            },
          },
        },
        Reservation: {
          type: 'object',
          properties: {
            reservationId: {
              type: 'integer',
              description: 'Reservation ID',
            },
            userId: {
              type: 'integer',
              description: 'User ID',
            },
            reservationType: {
              type: 'string',
              enum: ['karaoke', 'movie'],
              description: 'Type of reservation',
            },
            itemId: {
              type: 'integer',
              description: 'ID of the reserved item (karaokeId or movieId)',
            },
            reservationDate: {
              type: 'string',
              format: 'date',
              description: 'Date of reservation (YYYY-MM-DD) - defaults to today if not specified',
            },
            numberOfPeople: {
              type: 'integer',
              description: 'Number of people in the reservation (auto-calculated from friendEmails.length + 1)',
              readOnly: true,
            },
            friendEmails: {
              type: 'array',
              items: {
                type: 'string',
                format: 'email'
              },
              minItems: 3,
              maxItems: 5,
              description: 'Array of friend emails (must be registered users, need 3-5 friends)',
            },
            timeSlot: {
              type: 'string',
              description: 'Time slot (deprecated - not used anymore)',
              nullable: true,
            },
            queueNumber: {
              type: 'integer',
              description: 'Queue number (1 = currently using, 2+ = waiting in queue)',
              nullable: true,
            },
            startedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When user started using the resource',
              nullable: true,
            },
            endedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When user finished using the resource',
              nullable: true,
            },
            status: {
              type: 'string',
              enum: ['pending', 'awaiting_checkin', 'confirmed', 'cancelled', 'completed'],
              description: 'Reservation status',
            },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            notificationId: {
              type: 'integer',
              description: 'Notification ID',
            },
            userId: {
              type: 'integer',
              description: 'User ID who receives the notification',
            },
            reservationId: {
              type: 'integer',
              description: 'Related reservation ID (if any)',
              nullable: true,
            },
            type: {
              type: 'string',
              enum: ['reservation_approved', 'reservation_rejected', 'checkin_reminder', 'reservation_cancelled', 'queue_ready', 'queue_update'],
              description: 'Notification type',
            },
            title: {
              type: 'string',
              description: 'Notification title',
            },
            message: {
              type: 'string',
              description: 'Notification message',
            },
            isRead: {
              type: 'boolean',
              description: 'Whether the notification has been read',
            },
            readAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the notification was read',
              nullable: true,
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata (queueNumber, roomId, etc.)',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the notification was created',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routers/*.js', './index.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
