// Convert a flat message list into "User"/"Bot" lines for prompts.
function formatCobHistory(messages) {
    return messages.map((message,i) => {
        if(i%2 === 0) {
            return `User: ${message}`;
        } else {
            return `Bot: ${message}`;
        }   
    }).join('\n');  
}

export { formatCobHistory }
