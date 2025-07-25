import React from 'react';
import styled from 'styled-components';
import { useTheme } from '@/contexts/ThemeContext';

const Switch = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <StyledWrapper>
      <input 
        className="theme-checkbox" 
        type="checkbox" 
        checked={isDark}
        onChange={toggleTheme}
      />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .theme-checkbox {
    --toggle-size: 12px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 36px;
    height: 24px;
    background: -webkit-gradient(
        linear,
        left top,
        right top,
        color-stop(50%, #efefef),
        color-stop(50%, #2a2a2a)
      )
      no-repeat;
    background: -o-linear-gradient(left, #efefef 50%, #2a2a2a 50%) no-repeat;
    background: linear-gradient(to right, #efefef 50%, #2a2a2a 50%) no-repeat;
    background-size: 205%;
    background-position: 0;
    -webkit-transition: 0.4s;
    -o-transition: 0.4s;
    transition: 0.4s;
    border-radius: 99em;
    position: relative;
    cursor: pointer;
    font-size: var(--toggle-size);
  }

  .theme-checkbox::before {
    content: "";
    width: 12px;
    height: 12px;
    position: absolute;
    top: 6px;
    left: 6px;
    background: -webkit-gradient(
        linear,
        left top,
        right top,
        color-stop(50%, #efefef),
        color-stop(50%, #2a2a2a)
      )
      no-repeat;
    background: -o-linear-gradient(left, #efefef 50%, #2a2a2a 50%) no-repeat;
    background: linear-gradient(to right, #efefef 50%, #2a2a2a 50%) no-repeat;
    background-size: 205%;
    background-position: 100%;
    border-radius: 50%;
    -webkit-transition: 0.4s;
    -o-transition: 0.4s;
    transition: 0.4s;
  }

  .theme-checkbox:checked::before {
    left: 18px;
    background-position: 0;
  }

  .theme-checkbox:checked {
    background-position: 100%;
  }`;

export default Switch;
