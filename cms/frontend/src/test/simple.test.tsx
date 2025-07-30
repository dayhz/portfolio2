import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple component for testing
const TestComponent = ({ message }: { message: string }) => {
  return <div>{message}</div>;
};

describe('Simple Frontend Test', () => {
  it('should render component', () => {
    render(<TestComponent message="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should handle basic interactions', () => {
    const handleClick = () => {};
    render(<button onClick={handleClick}>Click me</button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
});