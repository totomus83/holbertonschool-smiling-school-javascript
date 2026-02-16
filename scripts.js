$(document).ready(function() {
  function createVideoCard(video) {
    let ratingHTML = '';
    for (let i = 1; i <= 5; i++) {
      const starImage = i <= video.star ? 'star_on.png' : 'star_off.png';
      ratingHTML += `<img src="images/${starImage}" alt="star" width="15px" />`;
    }

    return `
      <div class="card">
        <img
          src="${video.thumb_url}"
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
          <h5 class="card-title font-weight-bold">${video.title}</h5>
          <p class="card-text text-muted">${video['sub-title']}</p>
          <div class="creator d-flex align-items-center">
            <img
              src="${video.author_pic_url}"
              alt="Creator of Video"
              width="30px"
              class="rounded-circle"
              onerror="this.src='images/profile_placeholder.jpg'"
            />
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
    const $carouselInner = $carousel.find('.carousel-inner');
    
    $.ajax({
      url: apiUrl,
      method: 'GET',
      dataType: 'json',
      beforeSend: function() {
        // Loader is already visible
      },
      success: function(data) {
        $carouselInner.find('.loader').remove();

        const totalItems = data.length;

        function updateCarousel() {
          const windowWidth = $(window).width();
          let cardsPerSlide = 1;
          if (windowWidth >= 992) cardsPerSlide = 4;
          else if (windowWidth >= 576) cardsPerSlide = 2;

          $carouselInner.empty();

          for (let i = 0; i < totalItems; i += cardsPerSlide) {
            const activeClass = i === 0 ? ' active' : '';
            let rowContent = '';

            for (let j = 0; j < cardsPerSlide && (i + j) < totalItems; j++) {
              const video = data[i + j];
              const cardHTML = createVideoCard(video);

              let colClasses = 'col-12 d-flex justify-content-center';
              if (cardsPerSlide === 2) {
                colClasses = j === 0 ? 'col-12 col-sm-6 d-flex justify-content-center justify-content-md-end' : 'col-sm-6 d-flex justify-content-md-start';
              } else if (cardsPerSlide === 4) {
                colClasses = 'col-md-3 d-flex justify-content-center';
              }

              rowContent += `<div class="${colClasses}">${cardHTML}</div>`;
            }

            const carouselItem = `
              <div class="carousel-item${activeClass}">
                <div class="row align-items-center mx-auto">
                  ${rowContent}
                </div>
              </div>
            `;
            $carouselInner.append(carouselItem);
          }

          $carousel.carousel(0);
        }

        updateCarousel();

        let resizeTimer;
        $(window).on('resize', function() {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(updateCarousel, 250);
        });
      },
      error: function(xhr, status, error) {
        console.error('Error loading carousel:', error);
        $carouselInner.find('.loader').html('<p class="text-center">Error loading videos</p>');
      }
    });
  }

  // Function to load quotes
  function loadQuotes() {
    $.ajax({
      url: 'https://smileschool-api.hbtn.info/quotes',
      method: 'GET',
      dataType: 'json',
      beforeSend: function() {},
      success: function(data) {
        $('.quotes .carousel-inner .loader').remove();
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
                    <p class="text-white">« ${quote.text}</p>
                    <h4 class="text-white font-weight-bold">${quote.name}</h4>
                    <span class="text-white">${quote.title}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
          $('.quotes .carousel-inner').append(carouselItem);
        });

        $('#carouselExampleControls').carousel();
      },
      error: function(xhr, status, error) {
        console.error('Error loading quotes:', error);
        $('.quotes .carousel-inner .loader').html('<p class="text-white text-center">Error loading quotes</p>');
      }
    });
  }

  loadQuotes();
  loadCarousel('#popularCarousel', 'https://smileschool-api.hbtn.info/popular-tutorials');
});

$(document).ready(function() {
  let currentSearch = '';
  let currentTopic = '';
  let currentSort = '';
  
  // Function to load courses from API
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
        // Initialize search field if API returns q
        if (data.q !== undefined && data.q !== currentSearch) {
          currentSearch = data.q;
          $('#searchKeywords').val(data.q);
        }
        
        // Populate dropdowns if not already
        if ($('#topicMenu .dropdown-item').length === 0 && data.topics) {
          populateDropdown('#topicMenu', data.topics, '#topicSelected', 'topic');
        }
        if ($('#sortMenu .dropdown-item').length === 0 && data.sorts) {
          populateDropdown('#sortMenu', data.sorts, '#sortSelected', 'sort');
        }
        
        // Update video count
        const videoCount = data.courses ? data.courses.length : 0;
        $('#videoCount').text(`${videoCount} video${videoCount !== 1 ? 's' : ''}`);
        
        hideLoader();
        
        // Display video cards
        if (data.courses && data.courses.length > 0) {
          $('#coursesContainer').empty();
          data.courses.forEach(function(course) {
            const videoCard = createVideoCard(course);
            $('#coursesContainer').append(videoCard);
          });
        } else {
          $('#coursesContainer').html('<div class="col-12 text-center"><p class="text-muted">No courses found</p></div>');
        }
      },
      error: function(xhr, status, error) {
        hideLoader();
        $('#coursesContainer').html('<div class="col-12 text-center"><p class="text-danger">Error loading courses. Please try again later.</p></div>');
      }
    });
  }
  
  // Show loader
  function showLoader() {
    $('#coursesContainer').html(`
      <div class="col-12 d-flex justify-content-center align-items-center" style="height: 200px;">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    `);
  }
  
  // Hide loader
  function hideLoader() {
    $('#coursesContainer').empty();
  }
  
  // Populate dropdown menus
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
        if (type === 'topic') currentTopic = value;
        else if (type === 'sort') currentSort = value;
        $(selectedId).text(item);
        loadCourses();
      });
      $menu.append(dropdownItem);
    });
  }
  
  // Create video card HTML
  function createVideoCard(course) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      const starImg = i <= course.star ? 'star_on.png' : 'star_off.png';
      starsHtml += `<img src="images/${starImg}" alt="star ${i <= course.star ? 'on' : 'off'}" width="15px" />`;
    }
    
    return `
      <div class="col-12 col-sm-4 col-lg-3 d-flex justify-content-center">
        <div class="card">
          <img src="${course['thumb_url']}" class="card-img-top" alt="Video thumbnail" />
          <div class="card-img-overlay text-center">
            <img src="images/play.png" alt="Play" width="64px" class="align-self-center play-overlay" />
          </div>
          <div class="card-body">
            <h5 class="card-title font-weight-bold">${course.title}</h5>
            <p class="card-text text-muted">${course['sub-title']}</p>
            <div class="creator d-flex align-items-center">
              <img src="${course.author_pic_url}" alt="Creator of Video" width="30px" class="rounded-circle" />
              <h6 class="pl-3 m-0 main-color">${course.author}</h6>
            </div>
            <div class="info pt-3 d-flex justify-content-between">
              <div class="rating">${starsHtml}</div>
              <span class="main-color">${course.duration}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  let searchTimeout;
  $('#searchKeywords').on('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function() {
      currentSearch = $('#searchKeywords').val();
      loadCourses();
    }, 500);
  });

  loadCourses();
});

$(document).ready(function() {
  // Fonction spécifique pour charger le carousel "Latest Videos"
  function loadLatestVideos() {
    const $carousel = $('#latestCarousel');
    const $carouselInner = $carousel.find('.carousel-inner');

    $.ajax({
      url: 'https://smileschool-api.hbtn.info/latest-videos',
      method: 'GET',
      dataType: 'json',
      success: function(data) {
        $carouselInner.find('.loader').remove();
        const totalItems = data.length;

        function updateLatestCarousel() {
          const windowWidth = $(window).width();
          let cardsPerSlide = 1;
          if (windowWidth >= 992) cardsPerSlide = 4;
          else if (windowWidth >= 576) cardsPerSlide = 2;

          $carouselInner.empty();

          for (let i = 0; i < totalItems; i += cardsPerSlide) {
            const activeClass = i === 0 ? ' active' : '';
            let rowContent = '';

            for (let j = 0; j < cardsPerSlide && (i + j) < totalItems; j++) {
              const video = data[i + j];

              // On réutilise ta fonction createVideoCard déjà définie
              const cardHTML = createVideoCard(video);

              let colClasses = 'col-12 d-flex justify-content-center';
              if (cardsPerSlide === 2) {
                colClasses = j === 0 ? 'col-12 col-sm-6 d-flex justify-content-center justify-content-md-end'
                                      : 'col-sm-6 d-flex justify-content-md-start';
              } else if (cardsPerSlide === 4) {
                colClasses = 'col-md-3 d-flex justify-content-center';
              }

              rowContent += `<div class="${colClasses}">${cardHTML}</div>`;
            }

            const carouselItem = `
              <div class="carousel-item${activeClass}">
                <div class="row align-items-center mx-auto">
                  ${rowContent}
                </div>
              </div>
            `;
            $carouselInner.append(carouselItem);
          }

          $carousel.carousel(0);
        }

        updateLatestCarousel();

        let resizeTimer;
        $(window).on('resize', function() {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(updateLatestCarousel, 250);
        });
      },
      error: function(xhr, status, error) {
        console.error('Error loading latest videos:', error);
        $carouselInner.find('.loader').html('<p class="text-center">Error loading videos</p>');
      }
    });
  }

  // Charger le carousel "Latest Videos" au chargement
  loadLatestVideos();
});
