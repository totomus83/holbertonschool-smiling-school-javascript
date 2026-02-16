$(document).ready(function() {

  function createVideoCard(video) {
    let ratingHTML = '';
    for (let i = 1; i <= 5; i++) {
      ratingHTML += `<img src="images/${i <= video.star ? 'star_on' : 'star_off'}.png" alt="star" width="15px"/>`;
    }
    return `
      <div class="card mb-3">
        <img src="${video.thumb_url}" class="card-img-top" alt="Video thumbnail">
        <div class="card-img-overlay text-center">
          <img src="images/play.png" alt="Play" width="64px" class="play-overlay">
        </div>
        <div class="card-body">
          <h5 class="card-title font-weight-bold">${video.title}</h5>
          <p class="card-text text-muted">${video['sub-title']}</p>
          <div class="creator d-flex align-items-center">
            <img src="${video.author_pic_url}" alt="Creator" width="30px" class="rounded-circle">
            <h6 class="pl-3 m-0 main-color">${video.author}</h6>
          </div>
          <div class="info pt-3 d-flex justify-content-between">
            <div class="rating">${ratingHTML}</div>
            <span class="main-color">${video.duration}</span>
          </div>
        </div>
      </div>
    `;
  }

  function loadCarousel(carouselId, apiUrl) {
    const $carousel = $(carouselId);
    const $inner = $carousel.find('.carousel-inner');

    $.getJSON(apiUrl, function(data) {
      $inner.empty();

      // Créer toutes les cartes dans un seul carousel-item
      const allCardsHTML = data.map(video => `<div class="col-12 col-sm-6 col-md-6 col-lg-3 d-flex justify-content-center px-1">${createVideoCard(video)}</div>`).join('');
      $inner.append(`<div class="carousel-item active d-flex flex-row">${allCardsHTML}</div>`);

      const $cards = $inner.find('.col-12.col-sm-6.col-md-6.col-lg-3');
      let currentIndex = 0;

      function getVisibleCards() {
        const w = $(window).width();
        if (w >= 992) return 4;
        if (w >= 576) return 2;
        return 1;
      }

      function updateCarousel() {
        const visible = getVisibleCards();
        const cardWidth = $cards.outerWidth(true);
        const maxIndex = $cards.length - visible;
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        const offset = -currentIndex * cardWidth;
        $inner.find('.carousel-item').css({
          transform: `translateX(${offset}px)`,
          transition: 'transform 0.5s ease'
        });
      }

      // Flèches
      $carousel.parent().find('.arrow-left').off('click').on('click', function() {
        currentIndex--;
        updateCarousel();
      });
      $carousel.parent().find('.arrow-right').off('click').on('click', function() {
        currentIndex++;
        updateCarousel();
      });

      $(window).on('resize', updateCarousel);

      updateCarousel();

    }).fail(function() {
      $inner.html('<p class="text-center text-white">Erreur chargement vidéos</p>');
    });
  }
   // Function to load quotes
        function loadQuotes() {
          $.ajax({
            url: 'https://smileschool-api.hbtn.info/quotes',
            method: 'GET',
            dataType: 'json',
            beforeSend: function() {
              // Loader is already visible
            },
            success: function(data) {
              // Remove loader
              $('.quotes .carousel-inner .loader').remove();
              
              // Populate carousel with quotes
              data.forEach(function(quote, index) {
                const activeClass = index === 0 ? ' active' : '';
                const carouselItem = `
                  <div class="carousel-item${activeClass}">
                    <div class="row mx-auto align-items-center">
                      <div class="col-12 col-sm-2 col-lg-2 offset-lg-1 text-center">
                        <img
                          src="${quote.pic_url}"
                          class="d-block align-self-center"
                          alt="Carousel Pic ${index + 1}"
                        />
                      </div>
                      <div class="col-12 col-sm-7 offset-sm-2 col-lg-9 offset-lg-0">
                        <div class="quote-text">
                          <p class="text-white">
                            « ${quote.text}
                          </p>
                          <h4 class="text-white font-weight-bold">${quote.name}</h4>
                          <span class="text-white">${quote.title}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
                $('.quotes .carousel-inner').append(carouselItem);
              });
              
              // Reinitialize carousel
              $('#carouselExampleControls').carousel();
            },
            error: function(xhr, status, error) {
              console.error('Error loading quotes:', error);
              $('.quotes .carousel-inner .loader').html('<p class="text-white text-center">Error loading quotes</p>');
            }
          });
        }
        
        // Load quotes on page load
        loadQuotes();

  loadCarousel('#popularCarousel', 'https://smileschool-api.hbtn.info/popular-tutorials');
  loadCarousel('#latestCarousel', 'https://smileschool-api.hbtn.info/latest-videos');

});

$(document).ready(function() {
    let currentSearch = '';
    let currentTopic = '';
    let currentSort = '';
        
    function loadCourses() {
        showLoader();
          
        const apiUrl = 'https://smileschool-api.hbtn.info/courses';
        const params = new URLSearchParams();
          
        if (currentSearch) params.append('q', currentSearch);
        if (currentTopic) params.append('topic', currentTopic);
        if (currentSort) params.append('sort', currentSort);
          
        const fullUrl = params.toString() ? `${apiUrl}?${params.toString()}` : apiUrl;
          
        $.ajax({
            url: fullUrl,
            method: 'GET',
            dataType: 'json',
            success: function(data) {
              // Initialize search field with q value from API response
              if (data.q !== undefined && data.q !== currentSearch) {
                currentSearch = data.q;
                $('#searchKeywords').val(data.q);
              }
              
              // Populate topic dropdown if not already populated
              if ($('#topicMenu .dropdown-item').length === 0 && data.topics) {
                populateDropdown('#topicMenu', data.topics, '#topicSelected', 'topic');
              }
              
              if ($('#sortMenu .dropdown-item').length === 0 && data.sorts) {
                populateDropdown('#sortMenu', data.sorts, '#sortSelected', 'sort');
              }
              
              const videoCount = data.courses ? data.courses.length : 0;
              $('#videoCount').text(`${videoCount} video${videoCount !== 1 ? 's' : ''}`);
              
              hideLoader();
              
              // Create video cards
              if (data.courses && data.courses.length > 0) {
                data.courses.forEach(function(course) {
                  const videoCard = createVideoCard(course);
                  $('#coursesContainer').append(videoCard);
                });
              } else {
                $('#coursesContainer').append('<div class="col-12 text-center"><p class="text-muted">No courses found</p></div>');
              }
            },
            error: function(xhr, status, error) {
              hideLoader();
              $('#coursesContainer').append('<div class="col-12 text-center"><p class="text-danger">Error loading courses. Please try again later.</p></div>');
            }
          });
        }
        
        function showLoader() {
          $('#coursesContainer').html(`
            <div class="col-12 d-flex justify-content-center align-items-center" style="height: 200px;">
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>
          `);
        }

        function hideLoader() {
          $('#coursesContainer').empty();
        }
        
        // Function to populate dropdown menus
        function populateDropdown(menuId, items, selectedId, type) {
          const $menu = $(menuId);
          $menu.empty();
          
          if (type === 'topic') {
            const allItem = $('<a class="dropdown-item" href="#" data-value="">All</a>');
            allItem.on('click', function(e) {
              e.preventDefault();
              currentTopic = '';
              $(selectedId).text('All');
              loadCourses();
            });
            $menu.append(allItem);
          }
          
          items.forEach(function(item) {
            const dropdownItem = $(`<a class="dropdown-item" href="#" data-value="${item}">${item}</a>`);
            dropdownItem.on('click', function(e) {
              e.preventDefault();
              const value = $(this).data('value');
              
              if (type === 'topic') {
                currentTopic = value;
              } else if (type === 'sort') {
                currentSort = value;
              }
              
              $(selectedId).text(item);
              loadCourses();
            });
            $menu.append(dropdownItem);
          });
        }
        
        // Function to create a video card
        function createVideoCard(course) {
          let starsHtml = '';
          for (let i = 1; i <= 5; i++) {
            const starImg = i <= course.star ? 'star_on.png' : 'star_off.png';
            starsHtml += `<img src="images/${starImg}" alt="star ${i <= course.star ? 'on' : 'off'}" width="15px" />`;
          }
          
          const card = `
            <div class="col-12 col-sm-4 col-lg-3 d-flex justify-content-center">
              <div class="card">
                <img
                  src="${course['thumb_url']}"
                  class="card-img-top"
                  alt="Video thumbnail"
                />
                <div class="card-img-overlay text-center">
                  <img
                    src="images/play.png"
                    alt="Play"
                    width="64px"
                    class="align-self-center play-overlay"
                  />
                </div>
                <div class="card-body">
                  <h5 class="card-title font-weight-bold">${course.title}</h5>
                  <p class="card-text text-muted">
                    ${course['sub-title']}
                  </p>
                  <div class="creator d-flex align-items-center">
                    <img
                      src="${course.author_pic_url}"
                      alt="Creator of Video"
                      width="30px"
                      class="rounded-circle"
                    />
                    <h6 class="pl-3 m-0 main-color">${course.author}</h6>
                  </div>
                  <div class="info pt-3 d-flex justify-content-between">
                    <div class="rating">
                      ${starsHtml}
                    </div>
                    <span class="main-color">${course.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
          
          return card;
        }
        
        // Event listener for search input - API request when search value changes
        let searchTimeout;
        $('#searchKeywords').on('input', function() {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(function() {
            currentSearch = $('#searchKeywords').val();
            loadCourses();
          }, 500);
        });
        
        // Load courses on page load
        loadCourses();
      });