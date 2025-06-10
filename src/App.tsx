import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import styled, { createGlobalStyle, keyframes, ThemeProvider } from 'styled-components';
import debounce from 'lodash/debounce';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Grid } from '@giphy/react-components';

const gf = new GiphyFetch(process.env.REACT_APP_GIPHY_API_KEY || '');
const queryClient = new QueryClient();

// Google Fonts
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Montserrat:wght@400;700&family=Poppins:wght@700&display=swap');
  body {
    font-family: 'Montserrat', Arial, sans-serif;
    background: linear-gradient(135deg, #f8fafc 0%, #e3e9f3 100%);
    min-height: 100vh;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
`;

const CenteredBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8vh;
  width: 100%;
  box-sizing: border-box;
`;

const Description = styled.div`
  font-family: 'Bangers', cursive;
  font-size: 2.2rem;
  color: ${({ theme }) => theme.headingColor};
  margin-bottom: 2rem;
  font-weight: 400;
  text-align: center;
  letter-spacing: 0.01em;
  width: 100%;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: ${({ theme }) => theme.headingOutline};
  box-sizing: border-box;
  padding-left: 1rem;
  padding-right: 1rem;
  @media (max-width: 600px) {
    font-size: 1.3rem;
    padding: 0 0.5rem;
    margin-bottom: 1.2rem;
  }
`;

const CatMascot = styled.div`
  width: 80px;
  height: 80px;
  margin-bottom: 1.2rem;
  transition: transform 0.18s cubic-bezier(0.4, 1.4, 0.6, 1.0);
  will-change: transform;
  &:hover {
    transform: scale(1.13) rotate(-6deg);
    filter: brightness(1.1) drop-shadow(0 2px 8px #ffe08288);
  }
  @media (max-width: 600px) {
    width: 56px;
    height: 56px;
  }
`;

const SearchContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin-bottom: 2.5rem;
  position: relative;
  display: flex;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  background: ${({ theme }) => theme.inputBg};
  border: 3px solid ${({ theme }) => theme.inputBorder};
  border-radius: 32px;
  box-shadow: ${({ theme }) => theme.inputShadow};
  transition: box-shadow 0.18s, border 0.18s, background 0.18s;
  box-sizing: border-box;
  @media (max-width: 600px) {
    max-width: 98vw;
    min-width: 0;
    padding: 0 0.5rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1.2rem 3.5rem 1.2rem 3.2rem;
  font-size: 1.2rem;
  border: none;
  border-radius: 32px;
  background: transparent;
  outline: none;
  transition: box-shadow 0.2s;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 3.5rem;
  font-family: 'Montserrat', Arial, sans-serif;
  color: ${({ theme }) => theme.color};

  &:focus {
    box-shadow: ${({ theme }) => theme.inputFocus};
  }
  @media (max-width: 600px) {
    font-size: 1rem;
    padding: 1rem 2.8rem 1rem 2.5rem;
    border-radius: 24px;
  }
`;

const SearchIconWrapper = styled.span`
  position: absolute;
  left: 1.1rem;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  height: 100%;
  pointer-events: none;
`;

const StyledSearchIconSVG = styled.svg`
  height: 1.4em;
  width: 1.4em;
  vertical-align: middle;
  display: block;
  color: ${({ theme }) => theme.searchIcon};
`;

const ClearButton = styled.button`
  position: absolute;
  right: 0.9rem;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
  color: #b0b0b0;
  font-size: 1.2rem;
  outline: none;
  padding: 0;
`;

const StyledClearIconSVG = styled.svg`
  height: 1.2em;
  width: 1.2em;
  vertical-align: middle;
  display: block;
`;

const GridContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem 2rem 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  @media (max-width: 1000px) {
    max-width: 100vw;
    padding: 0 0.5rem 2rem 0.5rem;
  }
`;

const Spinner = styled.div`
  border: 4px solid #e0e0e0;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 2rem auto;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Cartoon Cat SVG
const CatSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="50" rx="28" ry="22" fill="#ffe082" stroke="#222" strokeWidth="4"/>
    <ellipse cx="40" cy="50" rx="20" ry="16" fill="#fffbe7" stroke="#222" strokeWidth="2"/>
    <ellipse cx="32" cy="48" rx="3" ry="4" fill="#222"/>
    <ellipse cx="48" cy="48" rx="3" ry="4" fill="#222"/>
    <ellipse cx="40" cy="58" rx="6" ry="3" fill="#fff" stroke="#222" strokeWidth="1.5"/>
    <path d="M20 30 Q25 10 40 20 Q55 10 60 30" stroke="#222" strokeWidth="3" fill="none"/>
    <polygon points="18,32 10,10 28,22" fill="#ffe082" stroke="#222" strokeWidth="2"/>
    <polygon points="62,32 70,10 52,22" fill="#ffe082" stroke="#222" strokeWidth="2"/>
    <line x1="20" y1="45" x2="5" y2="45" stroke="#222" strokeWidth="2"/>
    <line x1="20" y1="48" x2="5" y2="48" stroke="#222" strokeWidth="2"/>
    <line x1="60" y1="45" x2="75" y2="45" stroke="#222" strokeWidth="2"/>
    <line x1="60" y1="48" x2="75" y2="48" stroke="#222" strokeWidth="2"/>
  </svg>
);

const SpeechBubble = styled.div`
  position: relative;
  display: inline-block;
  background: #fffbe7;
  border: 3px solid #222;
  border-radius: 24px;
  padding: 1.2rem 2rem;
  font-family: 'Bangers', cursive;
  font-size: 1.3rem;
  color: #222;
  margin: 2rem auto 0 auto;
  text-align: center;
  box-shadow: 0 4px 24px rgba(33,150,243,0.08);
  &:after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -24px;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
    border-top: 24px solid #fffbe7;
    border-radius: 0 0 12px 12px;
    z-index: 1;
  }
  &:before {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -28px;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 21px solid transparent;
    border-right: 21px solid transparent;
    border-top: 28px solid #222;
    border-radius: 0 0 14px 14px;
    z-index: 0;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(248, 250, 252, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const CatBounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-18px); }
`;

const AnimatedCat = styled(CatMascot)`
  animation: ${CatBounce} 1.2s infinite;
`;

const LoadingText = styled.div`
  font-family: 'Bangers', cursive;
  font-size: 1.5rem;
  color: #222;
  margin-top: 1.2rem;
  text-shadow: 2px 2px 0 #fff, 4px 4px 0 #2196f3;
`;

const SearchIconSVG = () => (
  <StyledSearchIconSVG fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </StyledSearchIconSVG>
);

const ClearIconSVG = () => (
  <StyledClearIconSVG fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </StyledClearIconSVG>
);

const lightTheme = {
  background: 'linear-gradient(135deg, #f8fafc 0%, #e3e9f3 100%)',
  color: '#222',
  gridBg: '#fff',
  gridBorder: '#e0e0e0',
  inputBg: '#fffbe7',
  inputBorder: '#222',
  inputShadow: '0 6px 24px #ffe08255, 0 2px 0 #90caf9',
  inputFocus: '0 4px 24px #90caf988',
  toggleBg: '#fff',
  toggleBorder: '#222',
  headingColor: '#222',
  headingOutline: '-2px 2px 0 #fff, 2px 4px 0 #90caf9',
  headingShadow: '2px 2px 0 #fff, 4px 4px 0 #90caf9',
  searchIcon: '#b0b0b0',
};
const darkTheme = {
  background: 'linear-gradient(135deg, #23272f 0%, #181a20 100%)',
  color: '#fff',
  gridBg: '#23272f',
  gridBorder: '#333',
  inputBg: '#23272f',
  inputBorder: '#ffe082',
  inputShadow: '0 6px 24px #ffe08255, 0 2px 0 #90caf9',
  inputFocus: '0 4px 24px #ffe08299',
  toggleBg: '#23272f',
  toggleBorder: '#90caf9',
  headingColor: '#f5e9c8',
  headingOutline: '-2px 2px 0 #111b2b, 2px 4px 0 #90caf9',
  headingShadow: '2px 2px 0 #90caf9, 4px 4px 0 #111b2b',
  searchIcon: '#fff',
};

const GridWrapper = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto 2rem auto;
  padding: 2rem 1rem 2.5rem 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 600px) {
    padding: 1rem 0.2rem 1.5rem 0.2rem;
    margin: 0 auto 1rem auto;
  }
`;

const NightModeToggle = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 2rem;
  background: ${({ theme }) => theme.toggleBg};
  color: ${({ theme }) => theme.color};
  border: 2.5px solid ${({ theme }) => theme.toggleBorder};
  border-radius: 20px;
  font-family: 'Bangers', cursive;
  font-size: 1.1rem;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(33,150,243,0.12);
  transition: background 0.2s, color 0.2s, border 0.2s;
`;

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTerm, setActiveTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [gridWidth, setGridWidth] = useState(900);
  const [gifCount, setGifCount] = useState(0);
  const [noResults, setNoResults] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<any>(null);
  const [trendingKey, setTrendingKey] = useState(0); // for Grid key reset

  // Stable debounced function for >3 chars
  const debouncedSetActiveTerm = useCallback(
    debounce((value: string) => {
      console.log('Debounced search executing:', value);
      setActiveTerm(value);
      setLoading(false);
    }, 500),
    []
  );

  // Hybrid search logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Input changed:', { value, currentActiveTerm: activeTerm });
    setSearchTerm(value);
    setNoResults(false);

    // Cancel any pending debounce
    debouncedSetActiveTerm.cancel();

    if (value.length <= 3) {
      // For short terms, search immediately
      setActiveTerm(value);
      setLoading(false);
    } else {
      // For longer terms, debounce
      setLoading(true);
      debouncedSetActiveTerm(value);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setActiveTerm('');
    setLoading(false);
    setNoResults(false);
    if (inputRef.current) inputRef.current.focus();
    debouncedSetActiveTerm.cancel();
  };

  // Responsive grid width and columns
  React.useEffect(() => {
    function handleResize() {
      const width = Math.min(window.innerWidth, 1000) - 32; // 32px for padding
      setGridWidth(width > 320 ? width : 320);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive columns for Giphy Grid
  let gridColumns = 3;
  if (gridWidth < 500) gridColumns = 1;
  else if (gridWidth < 800) gridColumns = 2;
  else gridColumns = Math.max(2, Math.floor(gridWidth/300));

  // Theme object
  const theme = nightMode ? darkTheme : lightTheme;

  // Giphy Grid fetchers
  const fetchGifs = useCallback(
    (offset: number) => gf.search(activeTerm, { offset, limit: 12 }),
    [activeTerm]
  );

  const fetchTrending = useCallback(
    (offset: number) => gf.trending({ offset, limit: 12 }),
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <GlobalStyle />
        <AppContainer style={{ background: theme.background, color: theme.color, minHeight: '100vh' }}>
          <NightModeToggle onClick={() => setNightMode(n => !n)}>
            {nightMode ? '☀️ Light Mode' : '🌙 Night Mode'}
          </NightModeToggle>
          <CenteredBox>
            <CatMascot><CatSVG /></CatMascot>
            <Description>
              Find GIFs quick and easy. Search and discover the perfect GIF for any moment!
            </Description>
            <SearchContainer>
              <SearchIconWrapper>
                <SearchIconSVG />
              </SearchIconWrapper>
              <SearchInput
                ref={inputRef}
                type="text"
                placeholder="Search for GIFs..."
                value={searchTerm}
                onChange={handleInputChange}
                aria-label="Search GIFs"
                autoFocus
              />
              {searchTerm && (
                <ClearButton onClick={handleClear} aria-label="Clear search">
                  <ClearIconSVG />
                </ClearButton>
              )}
            </SearchContainer>
          </CenteredBox>
          <GridContainer>
            <GridWrapper>
              {activeTerm ? (
                <Grid
                  key={activeTerm}
                  width={Math.min(window.innerWidth, 1000) - 32}
                  columns={gridColumns}
                  gutter={18}
                  fetchGifs={fetchGifs}
                  noLink
                  borderRadius={18}
                  noResultsMessage={
                    <div style={{
                      textAlign: 'center',
                      fontFamily: "'Bangers', cursive",
                      fontSize: '1.5rem',
                      color: theme.headingColor,
                      textShadow: theme.headingOutline,
                      margin: '2rem 0'
                    }}>
                      <span role="img" aria-label="cat">😺</span>
                      <br />
                      No results found!<br />Try a different keyword.
                    </div>
                  }
                />
              ) : (
                <Grid
                  key={trendingKey}
                  width={Math.min(window.innerWidth, 1000) - 32}
                  columns={gridColumns}
                  gutter={18}
                  fetchGifs={fetchTrending}
                  noLink
                  borderRadius={18}
                  noResultsMessage={
                    <div style={{
                      textAlign: 'center',
                      fontFamily: "'Bangers', cursive",
                      fontSize: '1.5rem',
                      color: theme.headingColor,
                      textShadow: theme.headingOutline,
                      margin: '2rem 0'
                    }}>
                      <span role="img" aria-label="cat">😺</span>
                      <br />
                      No results found!<br />Try a different keyword.
                    </div>
                  }
                />
              )}
            </GridWrapper>
          </GridContainer>
        </AppContainer>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
