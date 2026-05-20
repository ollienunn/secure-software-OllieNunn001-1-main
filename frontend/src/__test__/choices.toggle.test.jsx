// choices.toggle.test.jsx
// testing - toggle component src/components/choices/ChoiceToggle.jsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ChoicesToggle from '../components/choices/ChoicesToggle';

// test suite
describe('ChoicesToggle Component', () => {

    // check render for curr type selected 
    it('renders the select with current questionType value', () => {
        render(
            <ChoicesToggle
                questionType="Single-Choice"
                setQuestionType={() => {}}
            />
        );
        const select = screen.getByLabelText(/question type/i);
        expect(select).toHaveValue('Single-Choice');
    });

    // check if render all types
    it('shows all 3 question type options', () => {
        render(
            <ChoicesToggle
                questionType="Judgement"
                setQuestionType={() => {}}
            />
        );
        expect(screen.getByText(/judgement question/i)).toBeInTheDocument();
        expect(screen.getByText(/multi-answer choice question/i)).toBeInTheDocument();
        expect(screen.getByText(/single-answer choice question/i)).toBeInTheDocument();
    });

    it('calls setQuestionType when select value changes', async () => {
        const setQuestionType = vi.fn();
        render(
            <ChoicesToggle
                questionType="Judgement"
                setQuestionType={setQuestionType}
            />
        );

        const select = screen.getByLabelText(/question type/i);
        await userEvent.selectOptions(select, 'Multi-Choice');
        expect(setQuestionType).toHaveBeenCalledWith('Multi-Choice');

        await userEvent.selectOptions(select, 'Single-Choice');
        expect(setQuestionType).toHaveBeenCalledWith('Single-Choice');
    });
});
