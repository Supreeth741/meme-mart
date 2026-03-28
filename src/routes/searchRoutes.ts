import { Router } from 'express';
import { SearchController } from '../controllers/searchController';
import { searchValidation } from '../middleware/validation';

const router = Router();

router.get('/', searchValidation, SearchController.search);

export default router;
