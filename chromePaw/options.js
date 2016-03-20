// Saves options to chrome.storage.sync.
function save_options() {
  var startup = document.getElementById('startup').value;
  var autosave = document.getElementById('autosave').checked;
  chrome.storage.sync.set({
    howToStart: startup,
    autosave: autosave
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = 'No beuno';
    }, 150);
  });
}

function test(){
  var status = document.getElementById('status');
  status.setContent = 'Options set';
}
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value howToStart = yes, autosave = true
  chrome.storage.sync.get({
    hotToStart: 'yes',
    autosave: true
  }, function(items) {
    document.getElementById('startUp').value = items.howToStart;
    document.getElementById('autosave').checked = items.autosave;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('save').addEventListener('click', test);