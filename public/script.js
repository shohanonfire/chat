const ADMIN_ID = '6471397661';
let username = '';
let lastUpdateId = 0;
let pendingResponse = false;

function saveUsername() {
  username = document.getElementById('usernameInput').value.trim();
  if (username) {
    document.getElementById('nameModal').style.display = 'none';
  }
}

function sendMessage() {
  if (pendingResponse) {
    alert('Please wait for admin reply before sending another message.');
    return;
  }
  const message = document.getElementById('messageInput').value.trim();
  if (!message) return;

  const full = `[${username}] ${message}`;
  fetch('/send', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ chat_id: ADMIN_ID, text: full })
  }).then(() => {
    addMessage('You: ' + message);
    document.getElementById('messageInput').value = '';
    pendingResponse = true;
  });
}

function addMessage(text) {
  const chatBox = document.getElementById('chatBox');
  const div = document.createElement('div');
  div.className = 'message';
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function fetchAdminMessages() {
  fetch(`/fetch?lastUpdateId=${lastUpdateId}`)
  .then(res => res.json())
  .then(updates => {
    updates.forEach(u => {
      lastUpdateId = u.update_id;
      const msg = u.message;
      if (msg.chat.id.toString() === ADMIN_ID && msg.text.startsWith('Reply:')) {
        const reply = msg.text.replace('Reply:', '').trim();
        addMessage('Admin: ' + reply);
        pendingResponse = false;
      }
    });
  });
}
setInterval(fetchAdminMessages, 3000);
