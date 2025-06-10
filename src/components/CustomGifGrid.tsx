import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';

interface CustomGifGridProps {
  searchTerm: string;
}

const API_KEY = process.env.REACT_APP_GIPHY_API_KEY;
const LIMIT = 12;

async function fetchGifs({ pageParam = 0, queryKey }: { pageParam?: number; queryKey: [string, string] }) {
  const searchTerm = queryKey[1];
  const res = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(searchTerm)}&limit=${LIMIT}&offset=${pageParam}&rating=g&lang=en`
  );
  const data = await res.json();
  return { gifs: data.data, nextOffset: pageParam + LIMIT, totalCount: data.pagination.total_count };
}

const GifCard: React.FC<{ gif: any }> = ({ gif }) => {
  const [loaded, setLoaded] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });

  return (
    <div ref={ref} style={{ borderRadius: 8, overflow: 'hidden', background: '#fff', position: 'relative', minHeight: 200 }}>
      {inView ? (
        <>
          {!loaded && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #e0e0e0 25%, #f8fafc 75%)',
                filter: 'blur(8px)',
                zIndex: 1,
                transition: 'opacity 0.3s',
              }}
            />
          )}
          <img
            src={gif.images.fixed_height.url}
            alt={gif.title}
            style={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
              display: 'block',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.4s',
              position: 'relative',
              zIndex: 2,
            }}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        </>
      ) : (
        <div
          style={{
            width: '100%',
            height: 200,
            background: 'linear-gradient(90deg, #e0e0e0 25%, #f8fafc 75%)',
            borderRadius: 8,
          }}
        />
      )}
    </div>
  );
};

const CustomGifGrid: React.FC<CustomGifGridProps> = ({ searchTerm }) => {
  const { data, isLoading, isError } = useQuery(
    ['gifs', searchTerm],
    () => fetchGifs({ pageParam: 0, queryKey: ['gifs', searchTerm] }),
    { enabled: !!searchTerm }
  );
  const gifs = data ? data.gifs : [];

  if (isLoading) return <div>Loading GIFs...</div>;
  if (isError) return <div>Error loading GIFs.</div>;
  if (!gifs || gifs.length === 0) return <div>No GIFs found.</div>;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem',
      padding: '1rem',
    }}>
      {gifs.map((gif: any) => (
        <GifCard key={gif.id} gif={gif} />
      ))}
    </div>
  );
};

export default CustomGifGrid; 