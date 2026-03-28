import { body, query, param } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

// Run validation and return errors
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array(),
    });
    return;
  }
  next();
};

export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validate,
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

export const uploadMediaValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be 1-200 characters'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('mediaType')
    .isIn(['video', 'image', 'audio'])
    .withMessage('Media type must be video, image, or audio'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('resolution').optional().trim(),
  body('fps').optional().isNumeric().withMessage('FPS must be a number'),
  body('duration').optional().isNumeric().withMessage('Duration must be a number'),
  validate,
];

export const searchValidation = [
  query('q').optional().trim().isLength({ max: 200 }),
  query('category').optional().trim(),
  query('mediaType').optional().isIn(['video', 'image', 'audio']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('sort').optional().isIn(['latest', 'popular', 'trending']),
  validate,
];

export const reportValidation = [
  body('reason')
    .isIn(['inappropriate', 'copyright', 'spam', 'offensive', 'other'])
    .withMessage('Valid reason required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description max 500 characters'),
  validate,
];

export const mongoIdParam = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate,
];
