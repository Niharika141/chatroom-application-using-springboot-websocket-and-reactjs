import React, { useState, useEffect } from 'react';
import Stomp from 'stompjs';

const ChatApp = () => {
    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080/chat');
        const stomp = Stomp.over(socket);
        stomp.connect({}, () => {
            setStompClient(stomp);
            stomp.subscribe('/topic/public', message => {
                setMessages(prevMessages => [...prevMessages, JSON.parse(message.body)]);
            });
        });
        return () => {
            if (stomp.connected) stomp.disconnect();
        };
    }, []);

    const sendMessage = message => {
        stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(message));
    };

    const handleMessageChange = e => {
        setMessageContent(e.target.value);
    };

    const handleSubmit = e => {
        e.preventDefault();
        sendMessage({ content: messageContent, sender: 'user' });
        setMessageContent('');
    };

    const [messageContent, setMessageContent] = useState('');

    return (
        <div>
            <h1>Chat Room</h1>
            <div>
                {messages.map((message, index) => (
                    <div key={index}>
                        <strong>{message.sender}: </strong> {message.content}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={messageContent} onChange={handleMessageChange} />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default ChatApp;
