// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import App from '@/App';
import { __resetForTests } from '@/state/progressStore';

beforeEach(() => __resetForTests());
afterEach(cleanup);

describe('app renders core flows', () => {
  it('renders the dashboard with blended readiness and category coverage', () => {
    render(<App />);
    expect(screen.getByText('Stripe interview readiness')).toBeTruthy();
    expect(screen.getByText('Skill coverage by category')).toBeTruthy();
  });

  it('renders the sample module (concept + quiz) on the learning path', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: /Learning path/ })[0]);
    expect(screen.getByText('SQL Mental Model from First Principles')).toBeTruthy();
    expect(screen.getByText(/Quiz —/)).toBeTruthy();
  });

  it('opens the sample problem in Focus Mode from the gym', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: /Practice Gym/ })[0]);
    fireEvent.click(screen.getByRole('button', { name: /Start ladder/ }));
    // focus-title shows the first rung of the conditional ladder
    expect(screen.getByText('Recognize the 0/1 success flag')).toBeTruthy();
    expect(screen.getByText(/What you need to do/)).toBeTruthy();
  });

  it('renders the Data-Reasoning, Mock, and Panic pages', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Data reasoning/ }));
    expect(screen.getByText(/16 patterns/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Mock interviews/ }));
    expect(screen.getByText(/How to run this like a real interview/)).toBeTruthy();
    expect(screen.getByText(/Component 1/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Panic sheet/ }));
    expect(screen.getByText('The 7-step loop (say it out loud)')).toBeTruthy();
  });
});
