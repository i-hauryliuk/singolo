'use strict';

const navList = document.querySelector('.nav-list');
let menuCurrentItem = [...navList.children].filter(item => item.classList.contains('nav-item-current'))[0];

navList.addEventListener('click', (ev) => {
  if (ev.target.tagName.toLowerCase() === 'a') {
    if (ev.target.parentNode === menuCurrentItem) {
      return;
    } else {
      menuCurrentItem.classList.remove('nav-item-current');
      menuCurrentItem.children[0].setAttribute('href', `#${menuCurrentItem.children[0].getAttribute('data-href')}`);
      window.location.href = ev.target.getAttribute('href');
      ev.target.removeAttribute('href');
      ev.target.parentNode.classList.add('nav-item-current');
      menuCurrentItem = ev.target.parentNode;
    }
  }
})
