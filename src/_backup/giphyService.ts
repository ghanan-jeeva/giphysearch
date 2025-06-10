import { GiphyFetch, IGif, GifsResult } from '@giphy/js-fetch-api';
import { GiphySearchResponse, GiphyImage } from '../types/giphy';

const GIPHY_API_KEY = process.env.REACT_APP_GIPHY_API_KEY || 'YOUR_API_KEY'; // You'll need to replace this with your actual API key
const gf = new GiphyFetch(GIPHY_API_KEY);

function mapIGifToGiphyImage(gif: IGif): GiphyImage {
  return {
    id: String(gif.id),
    title: gif.title,
    images: {
      original: {
        url: gif.images.original.url,
        width: gif.images.original.width,
        height: gif.images.original.height,
      },
      fixed_height: {
        url: gif.images.fixed_height.url,
        width: gif.images.fixed_height.width,
        height: gif.images.fixed_height.height,
      },
    },
  };
}

function mapGifsResultToGiphySearchResponse(result: GifsResult): GiphySearchResponse {
  return {
    data: result.data.map(mapIGifToGiphyImage),
    pagination: result.pagination,
    meta: result.meta,
  };
}

export const searchGifs = async (query: string, offset: number = 0): Promise<GiphySearchResponse> => {
  try {
    const response = await gf.search(query, {
      limit: 25,
      offset,
      rating: 'g',
      lang: 'en',
    });
    return mapGifsResultToGiphySearchResponse(response);
  } catch (error) {
    console.error('Error searching GIFs:', error);
    throw error;
  }
};

export const getTrendingGifs = async (offset: number = 0): Promise<GiphySearchResponse> => {
  try {
    const response = await gf.trending({
      limit: 25,
      offset,
      rating: 'g',
    });
    return mapGifsResultToGiphySearchResponse(response);
  } catch (error) {
    console.error('Error fetching trending GIFs:', error);
    throw error;
  }
}; 