<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>聊天室 - Room {{ $user['room_id'] }}</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        body {
            font-family: Arial, sans-serif;
        }

        #chat-box {
            width: 100%;
            height: 400px;
            border: 1px solid #ccc;
            overflow-y: scroll;
            padding: 10px;
            margin-bottom: 10px;
        }

        #message-input {
            width: 80%;
        }

        #send-btn {
            width: 18%;
        }

        .message {
            margin: 5px 0;
        }

        .self {
            text-align: right;
            color: green;
        }

        .other {
            text-align: left;
            color: blue;
        }
    </style>
</head>

<body>

    <h2>聊天室 - Room {{ $user['room_id'] }}</h2>
    <div id="chat-box"></div>

    <input type="text" id="message-input" placeholder="输入消息...">
    <button id="send-btn">发送</button>

    <script>
        const user = @json($user);
        const websocketUrl = "{{ $websocket_url }}?room_id=" + encodeURIComponent(user.room_id);
        const chatBox = document.getElementById('chat-box');
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');

        const socket = new WebSocket(websocketUrl);

        socket.onopen = function() {
            appendMessage("系统", "已连接聊天室：" + user.room_id, 'other');
        };

        socket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.user_id === user.id) {
                    appendMessage("我", data.message, 'self');
                } else {
                    appendMessage(data.name, data.message, 'other');
                }
            } catch (e) {
                console.error("消息解析失败:", event.data);
            }
        };

        socket.onclose = function() {
            appendMessage("系统", "已断开连接", 'other');
        };

        socket.onerror = function() {
            appendMessage("系统", "连接出错", 'other');
        };

        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            const payload = {
                name: user.name,
                user_id: user.id,
                room_id: user.room_id,
                message: message
            };
            appendMessage("我", message, 'self');

            socket.send(JSON.stringify(payload));
            messageInput.value = '';
        }

        function appendMessage(sender, message, type) {
            const div = document.createElement('div');
            div.classList.add('message', type);
            div.innerHTML = `<strong>${sender}:</strong> ${message}`;
            chatBox.appendChild(div);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    </script>

</body>

</html>
