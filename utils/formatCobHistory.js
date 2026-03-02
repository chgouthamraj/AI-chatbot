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
