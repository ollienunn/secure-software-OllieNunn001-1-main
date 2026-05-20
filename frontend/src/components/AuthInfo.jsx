// brain.jsx

import brain from '../assets/brain.png'

/// Custom alert component for displaying messages
export const AuthInfo = () => {
    return (
        <div>
            <h2 className="text-center"> Small Brain</h2>
            <img src={brain} alt="small-brain-img" className="img-fluid mb-3 mx-auto d-block" />
            <figure className="text-start">
                <blockquote className="blockquote">
                    <p>Why did the brain go to therapy?</p>
                </blockquote>
                <figcaption className="blockquote-footer">
                    It had too many “neuronal” issues to process <cite title="Source Title">- Some Individual</cite>
                </figcaption>
            </figure>
        </div>
    )
}