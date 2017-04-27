function save_options() {
  var sprintId = document.getElementById('sprintId').value;
  chrome.storage.sync.set({
    sprintId : sprintId
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
}

document.addEventListener('DOMContentLoaded', restore_options);


document.getElementById('save').addEventListener('click', save_options);