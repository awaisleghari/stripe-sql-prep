// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import App from '@/App';
import { __resetForTests } from '@/state/progressStore';

beforeEach(() => __resetForTests());
afterEach(cleanup);

/** The sidebar is the page's only navigation landmark; scope nav clicks to it.
 *  Route views are lazy-loaded, so assert with findBy* after each navigation. */
const nav = () => within(screen.getByRole('navigation'));

describe('app renders core flows', () => {
  it('renders the dashboard with blended readiness and category coverage', async () => {
    render(<App />);
    expect(await screen.findByText('Stripe interview readiness')).toBeTruthy();
    expect(screen.getByText('Skill coverage by category')).toBeTruthy();
  });

  it('renders the sample module (concept + quiz) from the learning-path rail', async () => {
    render(<App />);
    fireEvent.click(nav().getByText('SQL Mental Model from First Principles'));
    expect(await screen.findByRole('heading', { name: 'SQL Mental Model from First Principles' })).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Quiz' }));
    expect(await screen.findByText(/Quiz —/)).toBeTruthy();
  });

  it('opens the sample problem in Focus Mode from the gym', async () => {
    render(<App />);
    fireEvent.click(nav().getByText('Practice Gym'));
    fireEvent.click(await screen.findByRole('button', { name: /Start ladder/ }));
    expect(await screen.findByText('Recognize the 0/1 success flag')).toBeTruthy();
    expect(screen.getByText(/What you need to do/)).toBeTruthy();
  });

  it('renders the Data-Reasoning, Mock, and Panic pages', async () => {
    render(<App />);
    fireEvent.click(nav().getByText(/Data reasoning/));
    expect(await screen.findByText(/16 patterns/)).toBeTruthy();
    fireEvent.click(nav().getByText('Mock interviews'));
    expect(await screen.findByText(/How to run this like a real interview/)).toBeTruthy();
    expect(screen.getByText(/Component 1/)).toBeTruthy();
    fireEvent.click(nav().getByText('Panic sheet'));
    expect(await screen.findByText('The 7-step loop (say it out loud)')).toBeTruthy();
  });
});
