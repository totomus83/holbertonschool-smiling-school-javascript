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
