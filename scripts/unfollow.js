


function getRandomDelay(min, max) {
    // min = !min ? 10000 : min;
    // max = !max ? 20000 : max;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function recursiveDelay(arr, userShouldNotFollowMe, executionsNumber) {
    if (executionsNumber) { //exit condition

        unfollow(arr[executionsNumber - 1], userShouldNotFollowMe);
        setTimeout(() => {
            recursiveDelay(arr, userShouldNotFollowMe, executionsNumber - 1); //recursive call
        }, getRandomDelay(1000, 3000));
    }
}

function unfollow(item, userShouldNotFollowMe) {

    let actionButton = item
    if(
      availableToUnfollow(actionButton) &&
      (
        !userShouldNotFollowMe ||
        (userShouldNotFollowMe && checkNotAFollower(actionButton))
      )
    ) {
 
        actionButton.click();
        if(actionButton){
          actionButton.style.background = 'violet'
          actionButton.click();
        }

        let unfollowButton =  [...document.querySelectorAll('[role="button"]')].find(x => x.innerText === 'Unfollow');
        if(unfollowButton){
          unfollowButton.style.background = 'lightgreen'

            unfollowButton.click();
        }

        if(!window.unfollowCount) {
          window.unfollowCount = 0;
        }
        window.unfollowCount = window.unfollowCount + 1
        updateSats({ unfollowCount: window.unfollowCount })

        
        // alert(item.innerText)
        // alert(unfollowButton.innerText)


    }
}
function availableToUnfollow(button){
  return button.innerText.includes('Following')
}

function checkNotAFollower(item) {
  return item.parentElement &&
  item.parentElement.parentElement &&
  item.parentElement.parentElement.parentElement &&
  !item.parentElement.parentElement.parentElement.innerText.includes('Follows you')
}

chrome.storage.sync.get([
    'ufs-followsMe',
    'stop',
    'unfollowCount'
    // 'ufs-wordList',
  ], function (savedData) {
    // alert(JSON.stringify(savedData));
    settings = savedData;
    window.unfollowCount = settings.unfollowCount
    if(!window.intervalIds){
      window.intervalIds = [];
    }
    if(settings.stop) {
      window.intervalIds.forEach((int) => {
        clearInterval(int)
      })
      return;
    }
    // let wordList = parseWordList(savedData['ufs-wordList']);
    let userShouldNotFollowMe = savedData['ufs-followsMe']

    let scrollIntervalId = setInterval(() => {
      window.scrollBy(0, 100);
    }, 1000);
    window.intervalIds.push(scrollIntervalId)

    //  nned to reselect elements on set inerval while scrolling because only the elements withing a certain radius
    // if the windows view is selected. dunno how
    let buttonsIntervalId = setInterval(() => {
        // clearInterval(clearIntervalId);
        let buttons = [...document.querySelectorAll('[role="button"]')].filter((button) => {
          return availableToUnfollow(button)
        })
        buttons = buttons.filter((button) => {
          return (
            !userShouldNotFollowMe ||
            (userShouldNotFollowMe && checkNotAFollower(button))
          )
        })
        recursiveDelay(buttons, userShouldNotFollowMe, buttons.length);
    }, 1000)
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

