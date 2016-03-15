// Saves options to chrome.storage.sync.
function save_options() {
  var color = document.getElementById('startup').value;
  var likesColor = document.getElementById('autosave').checked;
  chrome.storage.sync.set({
    favoriteColor: color,
    likesColor: likesColor
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
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    favoriteColor: 'yes',
    likesColor: true
  }, function(items) {
    document.getElementById('startUp').value = items.favoriteColor;
    document.getElementById('autosave').checked = items.likesColor;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('save').addEventListener('click', test);
