const ADMIN_ID = '6471397661';
let lastUpdateId = 0;
let latestUserId = null;
let pendingResponse = false;

function sendAdminMessage() {
  if (!latestUserId) {
    alert('No active conversation.');
    return;
  }
  if (pendingResponse) {
    alert('Please wait for user reply before sending another.');
    return;
  }
  const input = document.getElementById('adminMessageInput');
  const msg = input.value.trim();
  if (!msg) return;

  const full = `Reply: ${msg}`;
  fetch('/send', {
    method: 'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ chat_id: latestUserId, text: full })
  }).then(() => {
    addAdminMessage('You: ' + msg);
    input.value = '';
    pendingResponse = true;
  });
}

function addAdminMessage(text) {
  const box = document.getElementById('adminChatBox');
  const div = document.createElement('div');
  div.className = 'message';
  div.innerText = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function fetchUserMessages() {
  fetch(`/fetch?lastUpdateId=${lastUpdateId}`)
  .then(res => res.json())
  .then(updates => {
    updates.forEach(u => {
      lastUpdateId = u.update_id;
      const msg = u.message;
      if (msg.chat.id.toString() !== ADMIN_ID) {
        latestUserId = msg.chat.id;
        addAdminMessage(`${msg.from.first_name}: ${msg.text}`);
        pendingResponse = false;
      }
    });
  });
}
setInterval(fetchUserMessages, 3000);
