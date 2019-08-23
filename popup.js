
// let fsCancelButton = document.getElementById('fs-cancel');
// let ufsCancelButton = document.getElementById('ufs-cancel');
let statsIntervalId;
document.getElementById('fs-save')
  .addEventListener('click', onSave);
document.getElementById('fs-save-follow')
  .addEventListener('click', onStartAction);
document.getElementById('ufs-save')
  .addEventListener('click', onSave);
document.getElementById('ufs-save-unfollow')
  .addEventListener('click', onStartAction);

document.getElementById('fs-reset')
  .addEventListener('click', onReset);
document.getElementById('fs-stop')
  .addEventListener('click', onStop);
document.getElementById('ufs-stop')
  .addEventListener('click', onStop);
// fsCancelButton.addEventListener('click', onCancel);
// ufsCancelButton.addEventListener('click', onCancel);

let inputDataNames = [
  'fs-followsMe',
  'fs-wordList',
  'ufs-followsMe',
  'ufs-wordList'
]

function onReset (event){
  chrome.storage.sync.set({ unfollowCount: 0, followCount: 0}, function() {
    console.log('reset stats');
    applyStats();
  })
}

function onStop(event) {
  console.log('STOP')
  let formPrefix = event.target.id.split('-')[0]
  const form = document.forms[formPrefix]
  const scriptToExecute =  formPrefix === 'fs' ? 'scripts/follow.js' : 'scripts/unfollow.js'
  const settings = getFormDataAsObj(form, true);
  saveSettings(settings)

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      { file: scriptToExecute }
    );
  });

}
function onStartAction(event){
  event.preventDefault();
  console.log('FOLLOW', event)
  let formPrefix = event.target.id.split('-')[0]
  const form = document.forms[formPrefix]
  const settings = getFormDataAsObj(form, false);
  const scriptToExecute =  formPrefix === 'fs' ? 'scripts/follow.js' : 'scripts/unfollow.js'
  saveSettings(settings)
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      { file: scriptToExecute }
    );
  });

  statsIntervalId = setInterval( applyStats, 1000)
}

function applyStats() {
  chrome.storage.sync.get([ 'unfollowCount', 'followCount'], function (savedData) {
    document.getElementById('followed-count').innerText = savedData.followCount | 0;
    document.getElementById('unfollowed-count').innerText = savedData.unfollowCount | 0;

  });
}
function onSave(event){
  event.preventDefault();
  console.log('SAVE', event)
  let formPrefix = event.target.id.split('-')[0]
  const form = document.forms[formPrefix]
  const settings = getFormDataAsObj(form);
  saveSettings(settings)
}

function saveSettings(settings) {
  chrome.storage.sync.set(settings, function() {
    console.log('saved settigs: ', settings);
  })
  // chrome.storage.sync.get(inputDataNames, function (obj) {
  //   console.log('get saved: ', obj);
  // });
}

function getFormDataAsObj(form, stop){

  let formInputData = form.querySelectorAll('.form-data')
  let data = { stop };
  formInputData.forEach((d) => {
    console.log(d.name, d.value, d.checked)
    if(d.name.includes('followsMe')) {
      data[d.name] = d.checked ;
    } else if (d.name.includes('wordList')){
      data[d.name] = d.value
    } else {
      data[d.name] = d.value;
    }
  })
  // data.wordList = parseWordList(data.wordList)
  return data

}



function applySavedSettings(formPrefix){
  chrome.storage.sync.get(inputDataNames, function (savedData) {
    inputDataNames.forEach((name) => {
      if(formPrefix === name.split('-')[0]){
        let inputEls = document.getElementsByName(name);
        if(!inputEls[0]){
          return;
        }
        if(name.includes('followsMe')) {
          inputEls[0].checked = savedData[name];
        } else {
          inputEls[0].value = savedData[name];
        }
      }
    })
  });
}



document.addEventListener('DOMContentLoaded', (event) => {
  applySavedSettings('fs');
  applySavedSettings('ufs');
  applyStats();
})

