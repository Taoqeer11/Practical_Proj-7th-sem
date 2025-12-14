function formatContent(text) {
    if (!text) return '';
    
    // Format quiz content
    if (text.includes('Question') && text.includes('Correct Answer')) {
        return formatQuiz(text);
    }
    
    // Format diagnostic results
    if (text.includes('Level:') || text.includes('Weak') || text.includes('Average') || text.includes('Strong')) {
        return formatDiagnostic(text);
    }
    
    // Format AI tutor responses
    return formatAIResponse(text);
}

function formatQuiz(text) {
    let formatted = '<div class="formatted-content">';
    
    // Split by questions
    const questions = text.split(/\*\*Question \d+:\*\*/);
    
    if (questions.length > 1) {
        formatted += '<h3>Your Generated Quiz</h3>';
        
        for (let i = 1; i < questions.length; i++) {
            const questionContent = questions[i].trim();
            const parts = questionContent.split('**Correct Answer:**');
            
            if (parts.length === 2) {
                const questionPart = parts[0].trim();
                const answerPart = parts[1].trim();
                
                // Extract question text and options
                const lines = questionPart.split('\n').filter(line => line.trim());
                const questionText = lines[0].replace(/\*\*/g, '');
                const options = lines.slice(1).filter(line => line.match(/^[A-D]\)/));
                
                formatted += `
                    <div class="question">
                        <div class="question-number">Question ${i}</div>
                        <div class="question-text">${questionText}</div>
                        <div class="options">
                            ${options.map(option => `<div class="option">${option}</div>`).join('')}
                        </div>
                        <div class="correct-answer">Correct Answer: ${answerPart}</div>
                    </div>
                `;
            }
        }
    } else {
        // Fallback formatting
        formatted += formatAIResponse(text);
    }
    
    formatted += '</div>';
    return formatted;
}

function formatDiagnostic(text) {
    let formatted = '<div class="formatted-content">';
    
    // Extract level information
    const levelMatch = text.match(/(Weak|Average|Strong)/i);
    if (levelMatch) {
        const level = levelMatch[1];
        const levelClass = level === 'Strong' ? 'strong' : level === 'Average' ? 'average' : 'weak';
        
        formatted += `
            <div class="level-result">
                <div class="level-badge">${level} Level</div>
                <p>Your diagnostic assessment has been completed!</p>
            </div>
            <div class="recommendations">
                <h4>Recommended Next Steps:</h4>
                <ul>
                    ${level === 'Strong' ? 
                        '<li>Take advanced quizzes to challenge yourself</li><li>Help others by sharing your knowledge</li><li>Explore specialized topics in depth</li>' :
                        level === 'Average' ?
                        '<li>Focus on strengthening weak areas</li><li>Practice with targeted quizzes</li><li>Ask the AI tutor for clarification on difficult concepts</li>' :
                        '<li>Start with basic concepts and fundamentals</li><li>Use the AI tutor extensively for explanations</li><li>Take practice quizzes regularly</li>'
                    }
                </ul>
            </div>
        `;
    }
    
    formatted += '</div>';
    return formatted;
}

function formatAIResponse(text) {
    let formatted = '<div class="formatted-content">';
    
    // Format headings
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format code blocks
    text = text.replace(/```([\s\S]*?)```/g, '<div class="code-block">$1</div>');
    
    // Format bullet points
    text = text.replace(/^\* (.*$)/gim, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Format numbered lists
    text = text.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Format paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    paragraphs.forEach(paragraph => {
        if (paragraph.includes('<li>') || paragraph.includes('<div class="code-block">')) {
            formatted += paragraph;
        } else {
            formatted += `<div class="ai-response">${paragraph.trim()}</div>`;
        }
    });
    
    formatted += '</div>';
    return formatted;
}

// Auto-format content when page loads
document.addEventListener('DOMContentLoaded', function() {
    const outputBoxes = document.querySelectorAll('.output-box');
    outputBoxes.forEach(box => {
        const originalText = box.textContent || box.innerText;
        if (originalText.trim()) {
            box.innerHTML = formatContent(originalText);
        }
    });
});