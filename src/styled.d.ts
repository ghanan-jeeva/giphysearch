import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    background: string;
    color: string;
    gridBg: string;
    gridBorder: string;
    inputBg: string;
    inputBorder: string;
    inputShadow: string;
    inputFocus: string;
    toggleBg: string;
    toggleBorder: string;
    headingColor: string;
    headingShadow: string;
    headingOutline: string;
    searchIcon: string;
  }
} 