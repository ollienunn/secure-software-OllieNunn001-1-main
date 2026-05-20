// alert.box.test.jsx
// testing - toggle component src/components/AlertBox.jsx

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AlertBox } from '../components/AlertBox';

// setup message and type
const setup = (message = '', type = 'INFO') => {
    const setMessage = vi.fn();
    const setType = vi.fn();

    render(
        <AlertBox
            message={message}
            setMessage={setMessage}
            type={type}
            setType={setType}
        />
    );

    return { setMessage, setType };
};

// test suite
describe('AlertBox', () => {
    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('does not render when message is empty', () => {
        setup('')

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('renders correctly with error type', () => {
        setup('Error occurred!', 'ERROR');
        expect(screen.getByText('Error occurred!')).toBeInTheDocument();
    
        const icon = document.querySelector('.bi-exclamation-triangle-fill');
        expect(icon).toBeInTheDocument();
    });
    
    it('renders correctly with info type', () => {
        setup('Here is some info.', 'INFO');
        expect(screen.getByText('Here is some info.')).toBeInTheDocument();
    

        const icon = document.querySelector('.bi-info-circle-fill');
        expect(icon).toBeInTheDocument();
    });
    
    it('renders correctly with success type', () => {
        setup('Success!', 'SUCCESS');
        expect(screen.getByText('Success!')).toBeInTheDocument();
    
        const icon = document.querySelector('.bi-check-circle-fill');
        expect(icon).toBeInTheDocument();
    });    

    it('calls setMessage and setType on close button click', () => {
        const { setMessage, setType } = setup('Close me', 'INFO');
        fireEvent.click(screen.getByRole('button'));
        
        expect(setMessage).toHaveBeenCalledWith('');
        expect(setType).toHaveBeenCalledWith('');
    });

    it('auto-dismisses success alert after 3 seconds', () => {
        vi.useFakeTimers();
        const { setMessage } = setup('Auto clear this', 'SUCCESS');

        vi.advanceTimersByTime(3000);
        expect(setMessage).toHaveBeenCalledWith('');
    });

    it('does not auto-dismiss non-success alert', () => {
        vi.useFakeTimers();
        const { setMessage } = setup('This should stay', 'ERROR');

        vi.advanceTimersByTime(3000);
        expect(setMessage).not.toHaveBeenCalled();
    });
});
