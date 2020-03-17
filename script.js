'use strict';

window.onload = function() {
  addMenuClickHandler();
  addSliderInteraction();
  addFormSubmissionHandler();
  addPortfolioInteractionHandler();
}

let isAnimationAllowed = true;
let isReplacementDone = true;

const addMenuClickHandler = () => {
  document.querySelector('.nav-list').addEventListener('click', (event) => {
    if (event.target.classList.contains('nav-link') && event.target.hasAttribute('href')) {
      activateOldMenuItem();
      deactivateNewMenuItem(event.target);
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
  window.location.href = selectedItem.getAttribute('href');
  selectedItem.removeAttribute('href')
};

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

const addFormSubmissionHandler = () => {
  document.querySelector('.feedback-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = {
      name: form.querySelector('#name').value,
      email: form.querySelector('#email').value,
      subject: form.querySelector('#subj').value,
      description: form.querySelector('#descr').value
    };
    const overlay = createOverlay();
    const popUp = createPopUp(formData);
    overlay.append(popUp);
    const overlayBlock = showPopup(overlay);
    closePopup(overlayBlock);
  });
};

const createOverlay = () => {
  const element = document.createElement('div');
  element.classList.add('overlay');
  return element;
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
    messageBlock = document.createElement('p');
    messageBlock.classList.add('popup-message');
    titleBtock.append('Message not sent');
    messageBlock.append('To submit a form, you must fill in the fields: Name and Email');
    popupContainer.append(titleBtock, messageBlock, closeButton);
  } else {
    messageContainer = document.createElement('dl');
    messageContainer.classList.add('popup-message-container');
    messageLabelBlock = document.createElement('dt');
    messageLabelBlock.classList.add('popup-message-label');
    messageContentBlock = document.createElement('dd');
    messageContentBlock.classList.add('popup-message-content');

    titleBtock.append('Message sent');
    const subject = data.subject ? `Subject: ${data.subject}` : 'No subject';
    messageLabelBlock.append(subject);
    const description = data.description ? `Description: ${data.description}` : 'No description';
    messageContentBlock.append(description);
    messageContainer.append(messageLabelBlock, messageContentBlock);
    popupContainer.append(titleBtock, messageContainer, closeButton);
  }
  return popupContainer;
};

const showPopup = (overlayBlock) => {
  return document.body.appendChild(overlayBlock);
};

const closePopup = (overlay) => {
  overlay.addEventListener('click', function closePopup(event) {
    if (event.target.classList.contains('popup-close-btn') || event.target.classList.contains('overlay')) {
      event.currentTarget.removeEventListener('click', closePopup);
      document.body.removeChild(document.querySelector('.overlay'));
      document.querySelectorAll('.feedback-form-field').forEach((field) => {
        field.value = '';
      });
    }
  })
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
