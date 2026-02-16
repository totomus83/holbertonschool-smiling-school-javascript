$(document).ready(function() {
    const carousel = $('#carouselExampleControls');
    const quotesContainer = $('#quotes-container');
    const loader = $('.loader');

    loader.show();
    carousel.addClass('d-none');

    $.ajax({
        url: 'https://smileschool-api.hbtn.info/quotes',
        method: 'GET',
        success: function(data) {
            quotesContainer.empty();

            data.forEach((quote, index) => {
                const activeClass = index === 0 ? 'active' : '';
                const quoteHTML = `
                    <div class="carousel-item ${activeClass}">
                        <div class="row mx-auto align-items-center">
                            <div class="col-12 col-sm-2 col-lg-2 offset-lg-1 text-center">
                                <img src="${quote.pic_url}" class="d-block rounded-circle" alt="${quote.name}" width="100" />
                            </div>
                            <div class="col-12 col-sm-7 offset-sm-2 col-lg-9 offset-lg-0">
                                <div class="quote-text">
                                    <p class="text-white">« ${quote.text} »</p>
                                    <h4 class="text-white font-weight-bold">${quote.name}</h4>
                                    <span class="text-white">${quote.title}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                quotesContainer.append(quoteHTML);
            });

            loader.hide();
            carousel.removeClass('d-none');
        },
        error: function() {
            loader.hide();
            quotesContainer.html('<p class="text-center text-danger">Erreur lors du chargement des citations.</p>');
            carousel.removeClass('d-none');
        }
    });
});

$(document).ready(function () {
  const loaderPopular = $('#popular-loader');
  const carouselWrapper = $('#carouselPopular .popular-carousel-wrapper');
  const carousel = $('#carouselPopular .popular-carousel');

  loaderPopular.show();

  $.ajax({
    url: 'https://smileschool-api.hbtn.info/popular-tutorials',
    method: 'GET',
    success: function (data) {
      loaderPopular.hide();

      // Générer toutes les cartes
      let cardsHTML = '';
      data.forEach(video => {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
          stars += i <= video.star
            ? '<span class="text-warning">&#9733;</span>'
            : '<span class="text-secondary">&#9733;</span>';
        }

        cardsHTML += `
          <div class="popular-card">
            <div class="card border-0">
              <img src="${video.thumb_url}" class="card-img-top" alt="${video.title}">
              <div class="card-body">
                <h5 class="card-title font-weight-bold">${video.title}</h5>
                <p class="card-text text-muted">${video['sub-title']}</p>
                <div class="d-flex align-items-center mb-2">
                  <img src="${video.author_pic_url}" class="rounded-circle mr-2" width="30" alt="${video.author}">
                  <small class="main-color font-weight-bold">${video.author}</small>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <div>${stars}</div>
                  <small class="main-color">${video.duration}</small>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      carousel.html(cardsHTML);

      let index = 0;

      function getVisibleCount() {
        const w = $(window).width();
        if (w >= 992) return 4; // Desktop
        if (w >= 768) return 2; // Tablette
        return 1; // Mobile
      }

      function updateCarousel() {
        const visibleCount = getVisibleCount();
        const wrapperWidth = carouselWrapper.width();
        const gap = 16; // espace entre cartes
        const cardWidth = (wrapperWidth - gap * (visibleCount - 1)) / visibleCount;

        // Appliquer la largeur et l'espace
        carousel.find('.popular-card').css({
          'flex': `0 0 ${cardWidth}px`,
          'margin-right': `${gap}px`
        });

        // Supprimer margin-right de la dernière carte du slide visible
        carousel.find('.popular-card').each(function (i) {
          if ((i + 1) % visibleCount === 0) $(this).css('margin-right', '0');
        });

        // Calculer le décalage max
        const maxOffset = Math.max(0, (data.length * (cardWidth + gap)) - wrapperWidth);
        const offset = Math.min(index * (cardWidth + gap), maxOffset);

        carousel.css('transform', `translateX(-${offset}px)`);
      }

      // Flèches
      $('#carouselPopular .carousel-control-next').click(function (e) {
        e.preventDefault();
        const visibleCount = getVisibleCount();
        const wrapperWidth = carouselWrapper.width();
        const gap = 16;
        const cardWidth = (wrapperWidth - gap * (visibleCount - 1)) / visibleCount;
        const maxIndex = data.length - 1;

        if (index < maxIndex) {
          index++;
          updateCarousel();
        }
      });

      $('#carouselPopular .carousel-control-prev').click(function (e) {
        e.preventDefault();
        if (index > 0) {
          index--;
          updateCarousel();
        }
      });

      $(window).resize(function () {
        // recalculer index si nécessaire
        const visibleCount = getVisibleCount();
        if (index > data.length - visibleCount) {
          index = Math.max(0, data.length - visibleCount);
        }
        updateCarousel();
      });

      $('#carouselPopular').removeClass('d-none');
      updateCarousel();
    },
    error: function () {
      loaderPopular.hide();
      carousel.html('<p class="text-danger text-center">Error loading tutorials</p>');
    }
  });
});

