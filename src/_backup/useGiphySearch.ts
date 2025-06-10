import { useState, useCallback } from 'react';
import { SearchState, GiphyImage } from '../types/giphy';
import { searchGifs } from '../services/giphyService';
import debounce from 'lodash/debounce';

const initialState: SearchState = {
  query: '',
  results: [],
  loading: false,
  error: null,
  offset: 0,
  hasMore: true,
};

export const useGiphySearch = () => {
  const [state, setState] = useState<SearchState>(initialState);

  const search = useCallback(
    debounce(async (query: string, offset: number = 0) => {
      if (!query.trim()) {
        setState(initialState);
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await searchGifs(query, offset);
        setState(prev => ({
          ...prev,
          results: offset === 0 ? response.data : [...prev.results, ...response.data],
          loading: false,
          hasMore: response.pagination.offset + response.pagination.count < response.pagination.total_count,
          offset: response.pagination.offset + response.pagination.count,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch GIFs. Please try again.',
        }));
      }
    }, 500),
    []
  );

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      search(state.query, state.offset);
    }
  }, [state.loading, state.hasMore, state.query, state.offset, search]);

  const handleSearch = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
    search(query);
  }, [search]);

  return {
    ...state,
    handleSearch,
    loadMore,
  };
}; 