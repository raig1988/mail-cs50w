document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('form').onsubmit = send_email;
  document.querySelector('#reply-form').onsubmit = reply_email;

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function send_email() {

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body : body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  })
  .catch(function(error) {
    console.log(error);
  })
  localStorage.clear();
  load_mailbox('sent');
  return false;
}

function load_mailbox(mailbox) { // 3 mailboxes inbox, sent, archive
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#reply-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';

  if (mailbox === "sent") {
    sent_mailbox(mailbox);
  }
  else if (mailbox === "inbox") {
    inbox_mailbox(mailbox);
  }
  else if (mailbox === "archive") {
    archive_mailbox(mailbox)
  }
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

}

function inbox_mailbox(mailbox) {
  // load inbox mail box
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(function(email) {
      console.log(email);
      const div = document.createElement('div');
      // check if email has been read or not
      if (email.read === true) {
        div.innerHTML = `<a style="background-color: #98999B;">${email.sender} | ${email.subject} | ${email.timestamp}</a>`;
      }
      else {
        div.innerHTML = `<a>${email.sender} | ${email.subject} | ${email.timestamp}</a>`;
      }
      // load individual email
      div.addEventListener('click', () => load_email(email.id)),
      document.querySelector('#emails-view').append(div)
    })
  })
  .catch(function(error) {
    console.log(error);
  })
}

function sent_mailbox(mailbox) {
  // load Sent mail box
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(function(email) {
      console.log(email);
      const div = document.createElement('div');
      div.innerHTML = `<a>${email.recipients} | ${email.subject} | ${email.timestamp}</a>`
      document.querySelector('#emails-view').append(div)
      // load individual email
      div.addEventListener('click', () => load_sent_email(email.id)),
      document.querySelector('#emails-view').append(div)
    })
  })
  .catch(function(error) {
    console.log(error);
  })
}

function archive_mailbox(mailbox) {
  // load archive mail box
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(function(email) {
      console.log(email);
      const div = document.createElement('div');
      div.innerHTML = `<a>${email.recipients} | ${email.subject} | ${email.timestamp}</a>` 
      document.querySelector('#emails-view').append(div)
      // load individual email on archive
      div.addEventListener('click', () => load_email(email.id))
    })
  })
  .catch(function(error) {
    console.log(error);
  })
}

function load_email(id) {
  // load each individual email
  fetch(`emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email)

    // Show the email and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#reply-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#view-email').style.display = 'block';
    
    // set read email
    read_email(email.id);

    // remove any previous emails 
    const email_view = document.querySelector('#view-email');
    while (email_view.hasChildNodes()) {
        email_view.removeChild(email_view.firstChild);
    }

    // elaborate email html
    let p_sender = document.createElement('p'); 
    let p_recipients = document.createElement('p');
    let p_subject = document.createElement('p');
    let p_timestamp = document.createElement('p');
    let p_body = document.createElement('p');
    let archive_button = document.createElement('div');
    let unarchive_button = document.createElement('div'); 
    let reply_button = document.createElement('button');
    reply_button.className = "mb-3";
    p_sender.innerHTML = `<div> <p style="font-weight: bold;"> Sender: </p> </div> <div> <p> ${email.sender} </p> </div>`;
    p_recipients.innerHTML = `<div><p style="font-weight: bold;"> Recipient: </p> </div> <div> <p> ${email.recipients} </p> </div>`;
    p_subject.innerHTML = `<div> <p style="font-weight: bold;"> Subject: </p></div> <div> <p> ${email.subject} </p> </div>`;
    p_timestamp.innerHTML = `<div> <p style="font-weight: bold;"> Date: </p></div> <div> <p> ${email.timestamp} </p> </div>`;
    p_body.innerHTML = `<div> <p style="font-weight: bold;"> Body: </p> </div> <div> ${email.body} </div>`;
    reply_button.innerHTML = `Reply`
    archive_button.innerHTML = `<button>Archive Email</button>`;
    unarchive_button.innerHTML = `<button>Unarchive Email</button>`;
    document.querySelector('#view-email').append(p_sender, p_recipients, p_subject, p_timestamp, p_body, reply_button);

    // call function to reply email
    reply_button.addEventListener("click", function() {
        compose_reply(email)
      });
 
    // function to archive or unarchive emails
    if (email.archived === false) {
      document.querySelector('#view-email').append(archive_button);
      archive_button.addEventListener('click', function() {
          archive_email(email.id);
          load_mailbox('inbox');
          window.location.reload();
        });
    } else if (email.archived === true) {
      document.querySelector('#view-email').append(unarchive_button);
      unarchive_button.addEventListener('click', function() {
        unarchive_email(email.id);
        load_mailbox('inbox');
        window.location.reload();
      });
    }
  })
  .catch(function(error) {
    console.log(error);
  })
}

function load_sent_email(id) {
  fetch(`emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email)

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'block';

  // remove any previous emails 
  const email_view = document.querySelector('#view-email');
  while (email_view.hasChildNodes()) {
      email_view.removeChild(email_view.firstChild);
  }

  // elaborate email html
  let p_sender = document.createElement('p'); 
  let p_recipients = document.createElement('p');
  let p_subject = document.createElement('p');
  let p_timestamp = document.createElement('p');
  let p_body = document.createElement('p');
  let reply_button = document.createElement('button');
  p_sender.innerHTML = `<div> <p style="font-weight: bold;"> Sender: </p> </div> <div> <p> ${email.sender} </p> </div>`;
  p_recipients.innerHTML = `<div><p style="font-weight: bold;"> Recipient: </p> </div> <div> <p> ${email.recipients} </p> </div>`;
  p_subject.innerHTML = `<div> <p style="font-weight: bold;"> Subject: </p></div> <div> <p> ${email.subject} </p> </div>`;
  p_timestamp.innerHTML = `<div> <p style="font-weight: bold;"> Date: </p></div> <div> <p> ${email.timestamp} </p> </div>`;
  p_body.innerHTML = `<div> <p style="font-weight: bold;"> Body: </p> </div> <div> ${email.body} </div>`;
  reply_button.innerHTML = `Reply`
  document.querySelector('#view-email').append(p_sender, p_recipients, p_subject, p_timestamp, p_body, reply_button);

  reply_button.addEventListener("click", function() {
      compose_reply(email)
      });

  })
  .catch(function(error) {
    console.log(error);
  })
}


function read_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  .catch(function(error) {
    console.log(error);
  })
}

function archive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .catch(function(error) {
    console.log(error);
  })
}

function unarchive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  .catch(function(error) {
    console.log(error);
  })
} 

function compose_reply(email) {

  // Show reply view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#reply-recipients').value = email.sender;
  if (email.subject.indexOf("Re:") === -1) {
    document.querySelector('#reply-subject').value = `Re: ${email.subject}`;
  } else {
    document.querySelector('#reply-subject').value = `${email.subject}`;
  }
  document.querySelector('#reply-body').value = `"On ${email.timestamp}, ${email.sender} wrote": 
${email.body}`;

}

function reply_email() {
  const reply_recipients = document.querySelector('#reply-recipients').value;
  const reply_subject = document.querySelector('#reply-subject').value;
  const reply_body = document.querySelector('#reply-body').value;

  // reply email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: reply_recipients,
      subject: reply_subject,
      body : reply_body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  });
}
