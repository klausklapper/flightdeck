gItems = [];
gCurrentItem = null;
gTotal = 0;
gShown = 0;
gState = 0;

$('.menu .item').click(async function (e) {
    e.preventDefault();
    lesson = e.target.dataset.lesson;
    $('.menu')
        .addClass('animated bounceOutRight')
        .bind('animationend', (e) => {
            e.target.remove();
        });

    $('.loader')
        .addClass('animated bounceInLeft')
        .show()
        .bind('animationend', async (e) => {
            gItems = await LoadContent(lesson);
            gItems = shuffle(gItems)
            $('.loader')
                .unbind()
                .addClass('animated bounceOutRight')
                .bind('animationend', (e) => {
                    e.target.remove();
                });
            $('.quiz').show();
            $('.card').addClass('animated bounceInLeft');
            $('.progress').show();
            $('progress').addClass('animated slideInDown');
            gTotal = gItems.length;
            NextCard();
            gState = 1;
        });

    return false;
});

function updateProgress() {
    value = gShown / gTotal;
    $('progress').val(value)
}

$('.card').click(() => {
    if (gState === 1) {
        $('#solution').removeClass('blurry');
        gState = 2;
        return;
    }

    if (gState === 2) {
        $('.card')
            .addClass('animated bounceOutRight')
            .bind('animationend', (e) => {
                gState = 1;
                $('#solution').addClass('blurry');
                NextCard();
                $('.card')
                    .removeClass('animated bounceOutRight')
                    .addClass('animated bounceInLeft')
                    .unbind('animationend');
            });
        return;
    }
})

function NextCard() {
    updateProgress();
    if (gItems.length > 0) {
        gCurrentItem = gItems.pop()
        gShown++;
        try {
            $('#title').html(gCurrentItem[1]);
            $('#solution').html(markdown.toHTML(gCurrentItem[2]));
        } catch (error) {
            $('#solution').html("NO DATA YET");
        }
    }
}

async function LoadContent(lesson) {
    const response = await fetch(`/data/${lesson}.md`);
    const txt = await response.text();
    var tree = markdown.parse(txt);
    return tree[2].slice(1);
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

window.addEventListener('load', e => {
    registerSW();
});

async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/js/sw.js');
        } catch (e) {
            alert('ServiceWorker registration failed. Sorry about that.');
        }
    } else {
        document.querySelector('.alert').removeAttribute('hidden');
    }
}
