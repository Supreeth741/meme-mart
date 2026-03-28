import mongoose from 'mongoose';
import { env } from '../config/env';
import User from '../models/User';
import Category from '../models/Category';
import { logger } from './logger';

const DEFAULT_CATEGORIES = [
  { name: 'Games', slug: 'games', icon: 'sports_esports' },
  { name: 'Memes', slug: 'memes', icon: 'sentiment_very_satisfied' },
  { name: 'Anime and Manga', slug: 'anime-and-manga', icon: 'auto_awesome' },
  { name: 'Movies', slug: 'movies', icon: 'movie' },
  { name: 'Music', slug: 'music', icon: 'music_note' },
  { name: 'Politics', slug: 'politics', icon: 'gavel' },
  { name: 'Pranks', slug: 'pranks', icon: 'mood' },
  { name: 'Reactions', slug: 'reactions', icon: 'add_reaction' },
  { name: 'Sound Effects', slug: 'sound-effects', icon: 'graphic_eq' },
  { name: 'Sports', slug: 'sports', icon: 'sports_soccer' },
  { name: 'Television', slug: 'television', icon: 'tv' },
  { name: 'Twitter Trends', slug: 'twitter-trends', icon: 'trending_up' },
  { name: 'Viral', slug: 'viral', icon: 'whatshot' },
  { name: 'WhatsApp Audios', slug: 'whatsapp-audios', icon: 'chat' },
];

export async function seedDatabase(): Promise<void> {
  try {
    // Seed admin user
    const existingAdmin = await User.findOne({ username: env.admin.username, role: 'admin' });
    if (!existingAdmin) {
      await User.create({
        username: env.admin.username,
        email: env.admin.email,
        password: env.admin.password,
        role: 'admin',
        isVerified: true,
      });
      logger.info('Admin user created');
    } else {
      logger.info('Admin user already exists');
    }

    // Seed categories
    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
      }
    }
    logger.info(`Categories seeded (${DEFAULT_CATEGORIES.length} total)`);
  } catch (error) {
    logger.error('Seed error:', error);
  }
}

// Standalone seed script
if (require.main === module) {
  if (!env.mongoUri) {
    logger.error('MongoDB URI is not defined');
    process.exit(1);
  }
  mongoose.connect(env.mongoUri).then(async () => {
    logger.info('Connected to MongoDB for seeding');
    await seedDatabase();
    await mongoose.disconnect();
    process.exit(0);
  });
}
