import React from 'react';
import styled from 'styled-components';
import { GiphyImage } from '../types/giphy';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const GifCard = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const GifImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
`;

const GifTitle = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #f44336;
`;

interface GifGridProps {
  gifs: GiphyImage[];
  loading: boolean;
  error: string | null;
}

export const GifGrid: React.FC<GifGridProps> = ({ gifs, loading, error }) => {
  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (loading && gifs.length === 0) {
    return <LoadingMessage>Loading...</LoadingMessage>;
  }

  if (gifs.length === 0) {
    return <LoadingMessage>No GIFs found. Try a different search term!</LoadingMessage>;
  }

  return (
    <GridContainer>
      {gifs.map((gif) => (
        <GifCard key={gif.id}>
          <GifImage
            src={gif.images.fixed_height.url}
            alt={gif.title}
            loading="lazy"
          />
          <GifTitle>{gif.title}</GifTitle>
        </GifCard>
      ))}
      {loading && <LoadingMessage>Loading more...</LoadingMessage>}
    </GridContainer>
  );
}; 