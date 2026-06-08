// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import App from '@/App';
import { __resetForTests } from '@/state/progressStore';

beforeEach(() => __resetForTests());
afterEach(cleanup);

/** The sidebar is the page's only navigation landmark; scope nav clicks to it. */
const nav = () => within(screen.getByRole('navigation'));

describe('app renders core flows', () => {
  it('renders the dashboard with blended readiness and category coverage', () => {
    render(<App />);
    expect(screen.getByText('Stripe interview readiness')).toBeTruthy();
    expect(screen.getByText('Skill coverage by category')).toBeTruthy();
  });

  it('renders the sample module (concept + quiz) from the learning-path rail', () => {
    render(<App />);
    fireEvent.click(nav().getByText('SQL Mental Model from First Principles'));
    // The hero heading carries the module title (also in the rail + breadcrumb, so
    // assert on the heading role specifically).
    expect(screen.getByRole('heading', { name: 'SQL Mental Model from First Principles' })).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Quiz' }));
    expect(screen.getByText(/Quiz —/)).toBeTruthy();
  });

  it('opens the sample problem in Focus Mode from the gym', () => {
    render(<App />);
    fireEvent.click(nav().getByText('Practice Gym'));
    fireEvent.click(screen.getByRole('button', { name: /Start ladder/ }));
    expect(screen.getByText('Recognize the 0/1 success flag')).toBeTruthy();
    expect(screen.getByText(/What you need to do/)).toBeTruthy();
  });

  it('renders the Data-Reasoning, Mock, and Panic pages', () => {
    render(<App />);
    fireEvent.click(nav().getByText(/Data reasoning/));
    expect(screen.getByText(/16 patterns/)).toBeTruthy();
    fireEvent.click(nav().getByText('Mock interviews'));
    expect(screen.getByText(/How to run this like a real interview/)).toBeTruthy();
    expect(screen.getByText(/Component 1/)).toBeTruthy();
    fireEvent.click(nav().getByText('Panic sheet'));
    expect(screen.getByText('The 7-step loop (say it out loud)')).toBeTruthy();
  });
});
