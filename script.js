'use strict';

window.onload = function() {
  resetPositionOnRefresh();
  addPageScrollHandler();
  addMenuClickHandler();
  addSliderInteraction();
  addPortfolioInteractionHandler();
  addFormSubmissionHandler();
  addHamburgerClickHandler();
  addHamburgerRotationWatcher();
}

let isAnimationAllowed = true;
let isReplacementDone = true;
let isScrollingAllowed = true;
let isHamburgerRotationCompleted = true;


const resetPositionOnRefresh = () => {
  isScrollingAllowed = false;
  window.scrollTo(0, 0);
  isScrollFinished(document.querySelector('#home'));
};

const addPageScrollHandler = () => {
  window.addEventListener('scroll', (event) => {
    if (isScrollingAllowed) {
      const offsetFromHeaderBottom = Math.round(window.pageYOffset) + document.querySelector('.page-header').offsetHeight;
      const sections = [...document.querySelectorAll('.nav-list .nav-link')].map(link => {
        return document.querySelector(`#${link.dataset.href}`)
      });
      sections.forEach(section => {
        if ((section.offsetTop <= offsetFromHeaderBottom
             && section.offsetTop + section.offsetHeight > offsetFromHeaderBottom)
             || Math.round(window.pageYOffset) >= document.body.offsetHeight - window.innerHeight) {
          activateOldMenuItem();
          deactivateNewMenuItem(document.querySelector(`[href="#${section.id}"]`));
        }
      });
    }
  });
};

const addMenuClickHandler = () => {
  document.querySelector('.nav-list').addEventListener('click', (event) => {
    if (event.target.classList.contains('nav-link') && event.target.hasAttribute('href')) {
      event.preventDefault();
      if (isScrollingAllowed) {
        isScrollingAllowed = false;
        activateOldMenuItem();
        deactivateNewMenuItem(event.target);
      }
    }
  });
};

const activateOldMenuItem = () => {
  const oldItem = [...document.querySelectorAll('.nav-list .nav-item')]
    .filter(item => item.classList.contains('nav-item-current'))[0];
  oldItem.children[0].setAttribute('href', `#${oldItem.children[0].dataset.href}`);
  oldItem.classList.remove('nav-item-current');
};

const deactivateNewMenuItem = (selectedItem) => {
  selectedItem.closest('.nav-item').classList.add('nav-item-current');
  if (!isScrollingAllowed) {
    const sectionToGo = document.querySelector(`#${selectedItem.dataset.href}`);
    const header = document.querySelector('.page-header');
    window.scrollTo(0, sectionToGo.offsetTop - (header.offsetHeight));
    isScrollFinished(sectionToGo);
  }
  selectedItem.removeAttribute('href');
};

const isScrollFinished = (targetSection) => {
  const checkIfScrollToIsFinished = setInterval(() => {
    if ((Math.round(window.pageYOffset) === targetSection.offsetTop - document.querySelector('.page-header').offsetHeight)
         || Math.round(window.pageYOffset) >= document.body.offsetHeight - window.innerHeight) {
      isScrollingAllowed = true;
      clearInterval(checkIfScrollToIsFinished);
    }
  }, 25);
}

const addSliderInteraction = () => {
  document.querySelector('.slider').addEventListener('click', (event) => {
    if (event.target.classList.contains('slider-button') && isAnimationAllowed) {
      const pressedButton = event.target;
      const {currentSlide, nextSlide, direction} = getMovingData(pressedButton);
      const {oldSlide, newSlide, direction: toSide} = replaceSlides(currentSlide, nextSlide, direction);
      resetSliderState(oldSlide, newSlide, toSide);
    }
    if (event.target.classList.contains('phone-case') && isAnimationAllowed) {
      event.target.nextElementSibling.children[0].classList.toggle('phone-screen-off');
    }
  });
};

const getMovingData = (button) => {
  isAnimationAllowed = false;
  const slides = Array.from(document.querySelectorAll('.slide'));
  const currentSlide = slides.filter(slide => slide.classList.contains('slide-displayed'))[0];
  const currentSlideIndex = slides.indexOf(currentSlide);
  let nextSlide = null;
  let direction = null;
  if (button.classList.contains('slider-button-prev')) {
    nextSlide = currentSlideIndex + 1 >= slides.length ? slides[0] : slides[currentSlideIndex + 1];
    direction = 'toleft';
  } else {
    nextSlide = currentSlideIndex - 1 < 0 ? slides[slides.length - 1] : slides[currentSlideIndex - 1];
    direction = 'toright';
  }
  return {currentSlide, nextSlide, direction};
};

const replaceSlides = (oldSlide, newSlide, direction) => {
  if (direction === 'toleft') {
    newSlide.classList.add('right-slide', 'slide-displayed', 'slide-left-shifted');
    oldSlide.classList.add('slide-left-shifted');
  } else {
    newSlide.classList.add('left-slide', 'slide-displayed', 'slide-right-shifted');
    oldSlide.classList.add('slide-right-shifted');
  }
  if (!newSlide.classList.contains('slide-interactive')) {
    event.currentTarget.classList.add('slider-border-blue');
  } else {
    event.currentTarget.classList.remove('slider-border-blue');
  }
  return {oldSlide, newSlide, direction};
};

const resetSliderState = (oldSlide, newSlide, toSide) => {
  newSlide.addEventListener('transitionend', function resetState(event) {
    if (toSide === 'toleft') {
      newSlide.classList.remove('slide-left-shifted', 'right-slide');
      oldSlide.classList.remove('slide-left-shifted', 'slide-displayed');
    } else {
      newSlide.classList.remove('slide-right-shifted', 'left-slide');
      oldSlide.classList.remove('slide-right-shifted', 'slide-displayed');
    }
    newSlide.removeEventListener('transitionend', resetState);
    isAnimationAllowed = true;
  });
};

const addPortfolioInteractionHandler = () => {
  document.querySelector('.portfolio').addEventListener('click', (event) => {
    const eventSource = event.target;
    if (eventSource.classList.contains('controls-toggle') && !eventSource.classList.contains('controls-toggle-active') && isReplacementDone) {
      isReplacementDone = false;
      removeCurrentToggleActivity();
      removeSelectedPortfolioItemHighlighting();
      const shuffledItems = shufflePortfolioItem();
      replacePortfolioItems(shuffledItems);
      addSelectedToggleActivity(eventSource);
    }
    if (eventSource.classList.contains('work-link') || eventSource.classList.contains('work-image')) {
      event.preventDefault();
      if (isReplacementDone) {
        if (!eventSource.closest('.work').querySelector('.work-selected')) {
          removeSelectedPortfolioItemHighlighting();
          addSelectedPortfolioItemHighlighting(eventSource);
        } else {
          removeSelectedPortfolioItemHighlighting();
        }
      }
    }
  });
};

const removeCurrentToggleActivity = () => {
  const activeToggle = document.querySelector('.controls-toggle-active');
  activeToggle.classList.remove('controls-toggle-active');
  activeToggle.removeAttribute('tabindex');
};

const addSelectedToggleActivity = (toggle) => {
  toggle.classList.add('controls-toggle-active');
  toggle.setAttribute('tabindex', '-1');
};

const shufflePortfolioItem = () => {
  const itemsCopies = Array.from(document.querySelector('.portfolio-content').cloneNode(true).children);
  for (let i = itemsCopies.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [itemsCopies[i], itemsCopies[j]] = [itemsCopies[j], itemsCopies[i]];
  }
  return itemsCopies;
};

const replacePortfolioItems = (items) => {
  const portfolioContainer = document.querySelector('.portfolio-content');
  let replacedItemIndex = 0;
  function* itemGenerator(issueSource) {
    for (let item of issueSource) {
      yield item;
    }
  }
  const itemSupplier = itemGenerator(items);
  [...portfolioContainer.children].forEach(portfolioItem => {portfolioItem.style.visibility = 'hidden'});
  let interval = setInterval(() => {
    let item = itemSupplier.next();
    if (item.done) {
      clearInterval(interval);
      isReplacementDone = true;
    } else {
      portfolioContainer.replaceChild(item.value, portfolioContainer.children[replacedItemIndex++]);
    }
  }, 150);
};

const removeSelectedPortfolioItemHighlighting = () => {
  const selectedWork = document.querySelector('.work-selected');
  if (selectedWork) {
    selectedWork.remove();
  }
};

const addSelectedPortfolioItemHighlighting = (selectedItem) => {
  const selection = document.createElement('div');
  selection.classList.add('work-selected');
  selectedItem.closest('.work').prepend(selection);
};

const addFormSubmissionHandler = () => {
  document.querySelector('.feedback-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!document.querySelector('.popup')) {
      const form = event.currentTarget;
      const formData = {
        name: form.querySelector('#name').value,
        email: form.querySelector('#email').value,
        subject: form.querySelector('#subj').value,
        description: form.querySelector('#descr').value
      };
      showOverlay();
      showPopUp(formData);
    }
  });
};

const showOverlay = () => {
  const overlayBlock = createOverlay();
  document.querySelector('.page').append(overlayBlock);
};

const createOverlay = () => {
  const element = document.createElement('div');
  element.classList.add('overlay');
  return element;
};

const showPopUp = (data) => {
  const popUpBlock = createPopUp(data);
  const displayedPopUp = document.querySelector('.page').appendChild(popUpBlock);
  displayedPopUp.querySelector('.popup-close-btn').focus();
  addPopUpCloseHandler(displayedPopUp);
};

const createPopUp = (data) => {
  const popupContainer = document.createElement('div');
  popupContainer.classList.add('popup');
  const closeButton = document.createElement('button');
  closeButton.classList.add('popup-close-btn');
  closeButton.append('OK');
  const titleBtock = document.createElement('p');
  titleBtock.classList.add('popup-title');
  let messageBlock = null;
  let messageContainer = null;
  let messageLabelBlock = null;
  let messageContentBlock = null;

  if (!data.name || !data.email) {
    titleBtock.append('Message not sent');
    messageBlock = document.createElement('p');
    messageBlock.classList.add('popup-message');
    messageBlock.append('To submit a form, you must fill in the fields: Name and Email');
    popupContainer.append(titleBtock, messageBlock, closeButton);
  } else {
    titleBtock.append('Message sent');
    messageContainer = document.createElement('dl');
    messageContainer.classList.add('popup-message-container');
    for (let field in data) {
      if (field === 'subject' || field === 'description') {
        messageLabelBlock = document.createElement('dt');
        messageLabelBlock.classList.add('popup-message-label');
        messageContentBlock = document.createElement('dd');
        messageContentBlock.classList.add('popup-message-content');
        if (data[field]) {
          messageLabelBlock.append(`${field[0].toUpperCase()}${field.slice(1)}:`);
          messageContentBlock.append(data[field]);
        } else {
          messageLabelBlock.append(`No ${field}`);
        }
        messageContainer.append(messageLabelBlock, messageContentBlock);
      }
    }
    popupContainer.append(titleBtock, messageContainer, closeButton);
  }
  
  return popupContainer;
};

const addPopUpCloseHandler = (popUp) => {
  popUp.addEventListener('click', function closePopUp(event) {
    if (event.target.classList.contains('popup-close-btn')) {
      popUp.removeEventListener('click', closePopUp);
      document.querySelector('.overlay').remove();
      popUp.remove();
      clearFormField();
    }
  });
};

const clearFormField = () => {
  document.querySelectorAll('.feedback-form-field').forEach((field) => {
    field.value = '';
  });
};



// ==================================

const addHamburgerClickHandler = () => {
  document.querySelector('.header-switcher').addEventListener('click', (event) => {
    if (isHamburgerRotationCompleted) {
      const eventSource = event.currentTarget;
      if (!eventSource.classList.contains('header-switcher-active')) {
        eventSource.classList.add('header-switcher-active');
        displayMobileOverlay();
        displayHeaderHorizontally();
      } else {
        document.querySelector('.page').classList.remove('overlay');
        eventSource.classList.remove('header-switcher-active');
        displayHeaderNormally();
        hideMobileOverlay();
      }
    }
  });
};

const addHamburgerRotationWatcher = () => {
  document.querySelector('.header-switcher').addEventListener('transitionrun', (event) => {
    isHamburgerRotationCompleted = false;
  });
  document.querySelector('.header-switcher').addEventListener('transitionend', (event) => {
    isHamburgerRotationCompleted = true;
  });
};

const displayMobileOverlay = () => {
  document.querySelector('.page').classList.add('overlay');
};

const hideMobileOverlay = () => {
  document.querySelector('.page').classList.remove('overlay');
};

const displayHeaderHorizontally = () => {
  const pageHeader = document.querySelector('.page-header');
  pageHeader.addEventListener('transitionend', isHeaderHorizontal);
  pageHeader.classList.add('page-header-horizontal');
}

const isHeaderHorizontal = () => {
  const pageHeader = document.querySelector('.page-header');
  if (event.target === pageHeader && event.propertyName === 'height') {
    pageHeader.removeEventListener('transitionend', isHeaderHorizontal);
    displayNavigation();
  }
};

const displayNavigation = () => {
  document.querySelector('.header-nav').classList.add('header-nav-horizontal');
};

const displayHeaderNormally = () => {
  const pageHeader = document.querySelector('.page-header');
  pageHeader.querySelector('.header-nav').classList.remove('header-nav-horizontal')
  pageHeader.classList.remove('page-header-horizontal');
}
