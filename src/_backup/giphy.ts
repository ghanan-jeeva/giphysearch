export interface GiphyImage {
  id: string;
  title: string;
  images: {
    original: {
      url: string;
      width: string;
      height: string;
    };
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
  };
}

export interface GiphySearchResponse {
  data: GiphyImage[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
  meta: {
    status: number;
    msg: string;
    response_id: string;
  };
}

export interface SearchState {
  query: string;
  results: GiphyImage[];
  loading: boolean;
  error: string | null;
  offset: number;
  hasMore: boolean;
} 