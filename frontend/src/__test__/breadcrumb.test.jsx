//  breadcrumb.test.jsx
// testing - toggle component src/components/BreadCrumb.jsx

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BreadCrumb } from '../components/BreadCrumb';
import { useLocation, useParams } from 'react-router-dom';

// setup dom - for location and dynamic params
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLocation: vi.fn(),
        useParams: vi.fn(),
        Link: actual.Link,
    };
});

// test suite
describe('BreadCrumb', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    it('renders only Home on root path', () => {
        useLocation.mockReturnValue({ pathname: '/' });
        useParams.mockReturnValue({});
    
        render(
            <BreadCrumb />, 
            { wrapper: MemoryRouter }
        );
    
        const breadcrumbList = screen.getByRole('list');
        const items = within(breadcrumbList).getAllByRole('listitem');
    
        expect(items).toHaveLength(1);
        expect(items[0]).toHaveTextContent('Home');
        expect(within(items[0]).getByRole('link')).toHaveAttribute('href', '/');
    });
    
    it('renders plain segments when no SEGMENT_ROUTE_MAP matches', () => {
        useLocation.mockReturnValue({ pathname: '/alpha/beta' });
        useParams.mockReturnValue({});
    
        render(
            <BreadCrumb />, 
            { wrapper: MemoryRouter }
        );
    
        const items = screen.getAllByRole('listitem');
        const itemTexts = items.map(item => item.textContent);
    
        expect(itemTexts).toEqual(['Home', 'Alpha', 'Beta']);
    
        // should only havbe home link
        expect(within(items[0]).getByRole('link')).toHaveAttribute('href', '/');
        expect(items[1].querySelector('a')).toBeNull();
        expect(items[2].querySelector('a')).toBeNull();
        expect(items[2]).toHaveAttribute('aria-current', 'page');
    });
    
    it('handles missing params gracefully', () => {
        useLocation.mockReturnValue({ pathname: '/game/unknown/question' });
        useParams.mockReturnValue({}); 
    
        render(
            <BreadCrumb />, 
            { wrapper: MemoryRouter }
        );
    
        const items = screen.getAllByRole('listitem');
        const itemTexts = items.map(item => item.textContent);
    
        expect(itemTexts).toEqual(['Home', 'Game', 'Unknown', 'Question']);
    
        // home linked
        expect(within(items[0]).getByRole('link')).toHaveAttribute('href', '/');
    
        // Game and Question not links here
        expect(within(items[1]).queryByRole('link')).toBeNull();
        expect(within(items[3]).queryByRole('link')).toBeNull();
    });
    
    
    it('renders long paths correctly', () => {
        useLocation.mockReturnValue({ pathname: '/a/b/c/d/e' });
        useParams.mockReturnValue({});
    
        render(
            <BreadCrumb />, 
            { wrapper: MemoryRouter }
        );
    
        const items = screen.getAllByRole('listitem');
        const itemTexts = items.map(item => item.textContent);
    
        expect(itemTexts).toEqual(['Home', 'A', 'B', 'C', 'D', 'E']);
        expect(items[5]).toHaveAttribute('aria-current', 'page');
    });    
});
