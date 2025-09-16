import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders WhatsApp Marketing Platform', () => {
  render(<App />);
  const titleElement = screen.getByText(/WhatsApp Marketing Platform/i);
  expect(titleElement).toBeInTheDocument();
});
