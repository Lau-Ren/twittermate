let fsCancelButton = document.getElementById('fs-cancel');
let fsSaveButton = document.getElementById('fs-save');
let ufsCancelButton = document.getElementById('ufs-cancel');
let ufsSaveButton = document.getElementById('ufs-save');
fsSaveButton.addEventListener('click', onSave);
ufsSaveButton.addEventListener('click', onSave);
fsCancelButton.addEventListener('click', onCancel);
ufsCancelButton.addEventListener('click', onCancel);

let inputDataNames = [
  'fs-followsMe',
  'fs-wordList',
  'ufs-followsMe',
  'ufs-wordList'
]

function onCancel(event) {
  console.log('CANCEL')
  let formPrefix = event.target.id.split('-')[0]

  applySavedSettings(formPrefix)

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
  chrome.storage.sync.get(inputDataNames, function (obj) {
    console.log('get saved: ', obj);
  });
}

function getFormDataAsObj(form){

  let formInputData = form.querySelectorAll('.form-data')
  let data = {};
  formInputData.forEach((d) => {
    console.log(d.name, d.value, d.checked)
    if(d.name.includes('followsMe')) {
      data[d.name] = d.checked ;
    } else if (d.name.includes('wordList')){
      data[d.name] = parseWordList(d.value)
    } else {
      data[d.name] = d.value;
    }
  })
  data.wordList = parseWordList(data.wordList)
  return data

}
function parseWordList(text) {
    // regex to split search term by spaces except where they are inside double quotation marks
    const terms = `${text}`.match(/\w+|"[^"]+"/g)
    if(!terms) {
      return [];
    }
    const x = terms.map(t => t.replace(/"/g, ''));
    return x.map(t => t ? t.toLowerCase() : '')
}


function applySavedSettings(formPrefix){
  chrome.storage.sync.get(inputDataNames, function (savedData) {
    inputDataNames.forEach((name) => {
      if(formPrefix === name.split('-')[0]){
        let inputEls = document.getElementsByName(name);
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

})

