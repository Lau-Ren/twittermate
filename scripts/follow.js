


function getRandomDelay(min, max) {
  // min = !min ? 10000 : min;
  // max = !max ? 20000 : max;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function recursiveDelay(arr, wordList, userShouldNotFollowMe, executionsNumber) {
  if (executionsNumber) { //exit condition

    follow(arr[executionsNumber - 1], wordList, userShouldNotFollowMe);
    setTimeout(() => {
      recursiveDelay(arr, wordList, userShouldNotFollowMe, executionsNumber - 1); //recursive call
    }, getRandomDelay(2000, 5000));
  }
}

function containsWord(text, wordList) {
  text = text.toLowerCase()
  return !!wordList.find(word => text.includes(word))
}
function checkNotAFollower(item) {
  return item.parentElement &&
  item.parentElement.parentElement &&
  item.parentElement.parentElement.parentElement &&
  !item.parentElement.parentElement.parentElement.innerText.includes('Follows you')
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

function availableToFollow(button) {
  return button.innerText === 'Follow' &&
    !button.innerText.includes('Following') &&
    !button.innerText.includes('Pending')
}

function hasWordList(wordList) {
  return wordList.length > 0
}
function follow(item, wordList, userShouldNotFollowMe) {
  let actionButton = item
  if (
    availableToFollow(actionButton) && // user button says 'follow' and not 'following' || 'pending'
    (!userShouldNotFollowMe || (userShouldNotFollowMe && checkNotAFollower(item))) &&
    (!hasWordList(wordList) || ( hasWordList(wordList) && containsWord(
      item.parentElement.parentElement.parentElement.innerText, wordList
    )
    ))
  ) {
    actionButton.style.background = 'green'
    actionButton.click();
    if (actionButton.innerText !== 'Following') {
      actionButton.click();
    }
    if(!window.followCount) {
      window.followCount = 0;
    }
    window.followCount = window.followCount + 1
    updateSats({ followCount: window.followCount })

  }
}


// #1 scroll page for 5 mins, then stop scolling page and start unfollowing


chrome.storage.sync.get([
  'fs-followsMe',
  'fs-wordList',
  'stop',
  'followCount'

], function (savedData) {
  // alert(JSON.stringify(savedData));

  settings = savedData;
  window.followCount = settings.followCount
  if(!window.intervalIds){
    window.intervalIds = [];
  }

  if(settings.stop) {
    window.intervalIds.forEach((int) => {
      clearInterval(int)
    })
    return;
  }

  let wordList = parseWordList(savedData['fs-wordList']);
  let userShouldNotFollowMe = savedData['fs-followsMe']
  let scrollIntervalId = setInterval(() => {
    window.scrollBy(0, 100);
  }, 2000);
  window.intervalIds.push(scrollIntervalId)
  //  nned to reselect elements on set inerval while scrolling because only the elements withing a certain radius
  // if the windows view is selected. dunno how
  let buttonsIntervalId = setInterval(() => {
    // clearInterval(clearIntervalId);
    let buttons = [...document.querySelectorAll('[role="button"]')].filter((button) => {
      return availableToFollow(button)
    })

    buttons = buttons.filter((button) => {
      return (!userShouldNotFollowMe || (userShouldNotFollowMe && checkNotAFollower(button)))
    })

    buttons = buttons.filter((button) => {
      return (!hasWordList(wordList) || ( hasWordList(wordList) &&
        containsWord(
          button.parentElement.parentElement.parentElement.innerText,
          wordList
        )
      ))
    })
    recursiveDelay(buttons, wordList, userShouldNotFollowMe, buttons.length);
  }, 2000)

  window.intervalIds.push(buttonsIntervalId)

});


function updateSats(settings) {
  chrome.storage.sync.set(settings, function() {
    console.log('saved settigs: ', settings);
  })
  // chrome.storage.sync.get(inputDataNames, function (obj) {
  //   console.log('get saved: ', obj);
  // });
}