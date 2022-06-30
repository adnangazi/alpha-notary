/**
* local function of all GUI content
*/
(function () {
  /**
  * query selector
  */
  const select = (el, all = false) => {
    el = el.trim();

    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  }

  /**
  * add event listener event load
  */
  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach(e => e.addEventListener(type, listener));
    } else {
      select(el, all).addEventListener(type, listener);
    }
  }

  /**
  * on scroll event load
  */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener);
  }

  let navbarlinks = select('#navbar .scrollto', true);

  /**
  * navbar behaviour
  */
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;

    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return;

      let section = select(navbarlink.hash);

      if (!section) return;

      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active');
      } else {
        navbarlink.classList.remove('active');
      }
    })
  }

  /**
  * on load event navbar load
  */
  window.addEventListener('load', navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /**
  * scroll behaviour
  */
  const scrollto = (el) => {
    let header = select('#header');
    let offset = header.offsetHeight;

    if (!header.classList.contains('header-scrolled')) {
      offset -= 10;
    }

    let elementPos = select(el).offsetTop;

    /**
    * scroll behaviour
    */
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  let selectHeader = select('#header');

  if (selectHeader) {
    /**
    * header scroll behaviour
    */
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled');
      } else {
        selectHeader.classList.remove('header-scrolled');
      }
    }
    
    /**
    * on load event header scroll down load
    */
    window.addEventListener('load', headerScrolled);
    onscroll(document, headerScrolled);
  }

  let backtotop = select('.back-to-top');
  
  if (backtotop) {
    /**
    * toggle back to top behaviour
    */
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active');
      } else {
        backtotop.classList.remove('active');
      }
    }

    /**
    * on load event toggle back to top load
    */
    window.addEventListener('load', toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  /**
  * on click event mobile navbar toggle load
  */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile');
    this.classList.toggle('bi-list');
    this.classList.toggle('bi-x');
  })

  /**
  * on click event navbar dropdown load
  */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault();
      this.nextElementSibling.classList.toggle('dropdown-active');
    }
  }, true);

  /**
  * on click event navbar load
  */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault();
      let navbar = select('#navbar');

      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile');
        let navbarToggle = select('.mobile-nav-toggle');
        navbarToggle.classList.toggle('bi-list');
        navbarToggle.classList.toggle('bi-x');
      }

      scrollto(this.hash);
    }
  }, true)

  /**
  * on load event load
  */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash);
      }
    }
  });

  /**
  * clients slider behavior
  */
  new Swiper('.clients-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    breakpoints: {
      320: {
        slidesPerView: 2,
        spaceBetween: 40
      },
      480: {
        slidesPerView: 3,
        spaceBetween: 60
      },
      640: {
        slidesPerView: 4,
        spaceBetween: 80
      },
      992: {
        slidesPerView: 6,
        spaceBetween: 120
      }
    }
  });

  /**
  * testimonials slider behavior
  */
  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 40
      },
      1200: {
        slidesPerView: 3,
      }
    }
  });

  /**
  * aos initialize
  */
  function aos_init() {
    /**
    * aos initialize
    */
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false
    });
  }

  /**
  * on load event aos load
  */
  window.addEventListener('load', () => {
    aos_init();
  });
})();

/**
* launch the dark mode animations when the application is open
*/
Animations = {
  darkMode: [document.getElementById("darkMode"), true],

  /**
  * launch the dark mode animations when the application is open
  */
  darkModeSwitcher: async () => {
    if (Animations.darkMode[1]) {
      document.documentElement.setAttribute("data-theme", "dark");
      Animations.darkMode[0].title = 'Dark mode on';
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      Animations.darkMode[0].title = 'Dark mode off';
    }
    
    Animations.darkMode[1] = !Animations.darkMode[1];
  }
}