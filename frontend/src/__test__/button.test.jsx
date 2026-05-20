// input.test.jsx
// testing - primitive component insdie src/components/buttons/Button.jsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../components/buttons/Button'; 

// Test Suite
describe('Testing Button Component', () => {
    it('renders with provided text', () => {
        render(
            <Button 
                variant="primary" 
                text="Submit" 
            />
        );

        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('applies the correct Bootstrap variant class', () => {
        render(
            <Button     
                variant="danger" 
                text="Delete" 
            />
        );
        const btn = screen.getByRole('button', { name: /delete/i });

        expect(btn).toHaveClass('btn');
        expect(btn).toHaveClass('btn-danger');
    });

    it('respects custom type prop', () => {
        render(
            <Button 
                variant="success" 
                text="Submit" 
                type="submit" 
            />
        );
        const btn = screen.getByRole('button', { name: /submit/i });
        expect(btn).toHaveAttribute('type', 'submit');
    });

    it('calls onClick when clicked', async () => {
        const handleClick = vi.fn();

        render(
            <Button 
                variant="info" 
                text="Click Me" 
                onClick={handleClick} 
            />
        );

        const btn = screen.getByRole('button', { name: /click me/i });
        await userEvent.click(btn);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('forwards extra props - id & aria-label', () => {
        render(
            <Button 
                variant="warning" 
                text="Warn" 
                id="MM-Button" 
                aria-label="important warning" 
            />
        );

        const btn = screen.getByRole('button', { name: /warn/i });

        expect(btn).toHaveAttribute('id', 'MM-Button');
        expect(btn).toHaveAttribute('aria-label', 'important warning');
    });
});
