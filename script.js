'use strict';

window.onload = function() {

  addMenuClickHandler();
  addSliderNavigationClickHandler();
}

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

let isAnimationAllowed = true;

const addSliderNavigationClickHandler = () => {
  document.querySelector('.slider').addEventListener('click', (event) => {
    if (event.target.classList.contains('slider-button') && isAnimationAllowed) {
      const pressedButton = event.target;
      const {currentSlide, nextSlide, direction} = getMovingData(pressedButton);
      const {oldSlide, newSlide, direction: toSide} = replaceSlides(currentSlide, nextSlide, direction);
      resetSliderState(oldSlide, newSlide, toSide);
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
}

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
}

