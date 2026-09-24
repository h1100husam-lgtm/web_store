/* =========================================================================
   swiper.js  |  Swiper initialisation
   -------------------------------------------------------------------------
   `initSliders()` is called by JS/pages.js AFTER the product slides have
   been added to the DOM, so the sliders always calculate the right width.
   ========================================================================= */

window.initSliders = function () {

    /* main hero slider */
    new Swiper(".slide-swp", {
        pagination: {
            el: ".swiper-pagination",
            dynamicBullets: true,
            clickable: true
        },
        autoplay: { delay: 2500 },
        loop: true
    });

    /* product sliders (hot deals / electronics / appliances / mobiles / new) */
    new Swiper(".slide_product", {
        slidesPerView: 5,
        spaceBetween: 20,
        observer: true,
        observeParents: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        },
        breakpoints: {
            1200: { slidesPerView: 5, spaceBetween: 20 },
            1000: { slidesPerView: 4, spaceBetween: 20 },
            700:  { slidesPerView: 3, spaceBetween: 15 },
            0:    { slidesPerView: 2, spaceBetween: 10 }
        }
    });
};

/* if a page has no product sliders, initialise the hero slider anyway */
document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector(".slide-swp") && !document.getElementById("swiper_items_sale")) {
        window.initSliders();
    }
});
