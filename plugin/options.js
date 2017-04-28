function save_options() {
  var sprintId = document.getElementById('sprintId').value;
  var jiraUrl = document.getElementById('jiraUrl').value;
  chrome.storage.sync.set({
    sprintId : sprintId,
    jiraUrl : jiraUrl
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}


function restore_options() {
  chrome.storage.sync.get('sprintId', function(items) {
    if (items.sprintId)  {
      document.getElementById('sprintId').value = items.sprintId;
    }
  });

  chrome.storage.sync.get('jiraUrl', function(items) {
    if (items.jiraUrl)  {
      document.getElementById('jiraUrl').value = items.jiraUrl;
    }
  });
}

document.addEventListener('DOMContentLoaded', restore_options);


document.getElementById('save').addEventListener('click', save_options);