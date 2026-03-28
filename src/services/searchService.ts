import Media from '../models/Media';
import { SearchQuery, PaginatedResponse, IMedia } from '../interfaces';

export class SearchService {
  static async search(query: SearchQuery): Promise<PaginatedResponse<IMedia>> {
    const { q, category, mediaType, page = 1, limit = 10, sort = 'latest' } = query;

    const filter: any = {};

    // Text search on title
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (mediaType) {
      filter.mediaType = mediaType;
    }

    // Sort options
    let sortQuery: any = { createdAt: -1 };
    if (sort === 'popular') {
      sortQuery = { views: -1, downloads: -1 };
    } else if (sort === 'trending') {
      sortQuery = { engagement: -1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Media.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    return {
      data: data as unknown as IMedia[],
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
