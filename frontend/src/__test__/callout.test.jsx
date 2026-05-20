// callout.test.jsx
// testing - primitive component src/components/choices/Callout.jsx

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CallOut from '../components/CallOut';

// test suite
describe('CallOut Component', () => {
    it('renders children inside the alert box', () => {
        render(
            <CallOut 
                type="alert-success">Math is beautiful!
            </CallOut>
        );

        expect(screen.getByText(/math is beautiful/i)).toBeInTheDocument();
    });

    it('applies correct class based on type prop', () => {
        render(
            <CallOut type="alert-danger">
                Incorrect answer!
                </CallOut>
            );
        const div = screen.getByText(/incorrect answer/i).closest('div');

        expect(div).toHaveClass('alert');
        expect(div).toHaveClass('alert-danger');
        expect(div).toHaveClass('text-start');
    });

    it('renders without crashing even with empty children', () => {
        render(
            <CallOut 
                type="alert-info">
            </CallOut>
        );
        
        const div = screen.getByRole('alert');
        expect(div).toBeInTheDocument();
    });
});