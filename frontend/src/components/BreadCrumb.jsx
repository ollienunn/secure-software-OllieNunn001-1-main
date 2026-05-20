// BreadCrumb.jsx

import { useLocation, useParams, Link } from 'react-router-dom';
import '../styles/Navigation.css';

const SEGMENT_ROUTE_MAP = {
    'game': '/game/:gameId',
    'question': '/game/:gameId/question/:questionId',
};

// This component generates breadcrumbs based on the current URL path.
export const BreadCrumb = ({ children }) => {
    const location = useLocation();
    const params = useParams();

    const segments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const isLast = i === segments.length - 1;

        let linkPath;
        let label = segment.charAt(0).toUpperCase() + segment.slice(1);

        if (SEGMENT_ROUTE_MAP[segment]) {
            const template = SEGMENT_ROUTE_MAP[segment];

            // only generate based on templates - SEGMENT_ROUTE_MAP
            const needsGameId = template.includes(':gameId');
            const needsQuestionId = template.includes(':questionId');

            const hasRequiredParams =
                (!needsGameId || params.gameId) &&
                (!needsQuestionId || params.questionId);

            if (hasRequiredParams) {
                linkPath = template
                    .replace(':gameId', params.gameId)
                    .replace(':questionId', params.questionId);
            }
        }

        // Generate the label based on the segment
        let content;
        if (isLast || !linkPath) {
            content = label;
        } else {
            content = <Link to={linkPath}>{label}</Link>;
        }

        // Add the breadcrumb item
        breadcrumbs.push(
            <li
                key={i}
                className={`breadcrumb-item${isLast ? ' active' : ''}`}
                {...(isLast ? { 'aria-current': 'page' } : {})}
            >
                {content}
            </li>
        );
    }

    return (
        <div className="container mt-3">
            <div className="breadcrumb-container">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">🏠 Home</Link>
                    </li>
                    {breadcrumbs}
                </ol>
            </div>
            {children}
        </div>
    );
};
