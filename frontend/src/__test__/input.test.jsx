// input.test.jsx
// testing Input and MediaInput components inside src/components/inputs/ - Input.jsx & MediaInput.jsx 

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';

import Input from '../components/inputs/Input';
import MediaInput from '../components/inputs/MediaInput';

describe('Input Component', () => {
    it('renders label and input correctly', () => {
        render(
            <Input
                label="Your Name"
                type="text"
                value=""
                onChange={() => {}}
                placeholder="Enter name"
            />
        );
        expect(screen.getByText(/your name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter name/i)).toBeInTheDocument();
    });

    it('sets the correct input type', () => {
        render(
            <Input
                label="Email"
                type="email"
                value=""
                onChange={() => {}}
                placeholder="Enter email"
            />
        );

        const input = screen.getByPlaceholderText(/enter email/i);
        expect(input).toHaveAttribute('type', 'email');
    });

    it('runs onChange handler when typing', async () => {
        const handleChange = vi.fn();
        render(
            <Input
                label="Math Answer"
                type="text"
                value=""
                onChange={handleChange}
                placeholder="Type answer"
            />
        );

        const input = screen.getByPlaceholderText(/type answer/i);
        await userEvent.type(input, '42');

        expect(handleChange).toHaveBeenCalled();
    });

    it('uses value prop properly', () => {
        render(
            <Input
                label="Answer"
                type="text"
                value="Euler"
                onChange={() => {}}
                placeholder="Enter answer"
            />
        );

        const input = screen.getByPlaceholderText(/enter answer/i);
        expect(input).toHaveValue('Euler');
    });

    it('forwards ref into the input', () => {
        const inputRef = createRef();
        render(
            <Input
                label="Focus Target"
                type="text"
                value=""
                onChange={() => {}}
                placeholder="Focus here"
                inputRef={inputRef}
            />
        );

        expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    });
});

describe('MediaInput Component', () => {
    it('shows file input when mode is "upload"', () => {
        render(
            <MediaInput
                mediaInputMode="upload"
                currState={{ visual: '' }}
                setState={() => {}}
            />
        );
        const input = screen.getByLabelText(/upload image/i);
        expect(input).toHaveAttribute('type', 'file');
    });

    it('shows text input when mode is not "upload"', () => {
        render(
            <MediaInput
                mediaInputMode="url"
                currState={{ visual: '' }}
                setState={() => {}}
            />
        );

        const input = screen.getByLabelText(/video url/i);
        expect(input).toHaveAttribute('type', 'text');
        expect(input).toHaveAttribute('placeholder', 'Enter a URL to YouTube video');
    });

    it('pulls visual value from currState for youtube video URL', () => {
        render(
            <MediaInput
                mediaInputMode="url"
                currState={{ visual: 'https://www.youtube.com/watch?v=J_e38x4Jm6I&ab_channel=MarkFeltonProductions' }}
                setState={() => {}}
            />
        );

        const input = screen.getByPlaceholderText(/youtube video/i);
        expect(input).toHaveValue('https://www.youtube.com/watch?v=J_e38x4Jm6I&ab_channel=MarkFeltonProductions');
    });

    it('updates state when typing in video URL mode', async () => {
        const setState = vi.fn();
        render(
            <MediaInput
                mediaInputMode="url"
                currState={{ visual: '' }}
                setState={setState}
            />
        );
        
        const input = screen.getByPlaceholderText(/youtube video/i);
        await userEvent.type(input, 'https://www.youtube.com/watch?v=J_e38x4Jm6I&ab_channel=MarkFeltonProductions');
        expect(setState).toHaveBeenCalled();
    });
});
