/**
 * Frontend Iframe Handler
 * Handles the booking engine iframe loading and spinner management
 */

document.addEventListener('DOMContentLoaded', function() {
    const iframeContainer = document.getElementById('mlb-iframe-container');
    const iframe = document.getElementById('mylighthouse-booking-iframe');
    const loadingMessage = document.getElementById('mlb-iframe-loading');

    function getText(str) {
        try {
            if (typeof mlbGettext === 'function') {
                return mlbGettext(str);
            }
        } catch (e) {}
        try {
            if (typeof wp !== 'undefined' && wp.i18n && typeof wp.i18n.__ === 'function') {
                return wp.i18n.__(str, 'mylighthouse-booker');
            }
        } catch (err) {}
        return str;
    }

    if (!iframe || !iframeContainer) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const arrival = params.get('Arrival');
    const departure = params.get('Departure');
    const hotelId = params.get('hotel_id');
    const roomId = params.get('room');
    let keepSpinnerDebug = params.get('mlb_debug_spinner') === '1';

    if (keepSpinnerDebug) {
        try {
            document.body.classList.add('mlb-debug-spinner');
            if (loadingMessage) {
                loadingMessage.classList.add('mlb-iframe-loading--debug');
            }
            console.info('MLB iframe spinner debug mode enabled. Call window.mlbReleaseIframeSpinner() when ready.');
        } catch (e) {
            /* ignore */
        }
        window.mlbReleaseIframeSpinner = function() {
            keepSpinnerDebug = false;
            hideLoader(true);
        };
    }

    function hideLoader(force) {
        if (keepSpinnerDebug && !force) {
            if (loadingMessage) {
                loadingMessage.classList.remove('mlb-iframe-loading--hidden');
            }
            iframeContainer.classList.remove('mlb-iframe-ready');
            return;
        }
        if (iframeContainer.classList.contains('mlb-iframe-ready')) {
            return;
        }
        if (loadingMessage) {
            loadingMessage.classList.add('mlb-iframe-loading--hidden');
        }
        iframeContainer.classList.add('mlb-iframe-ready');
    }

    function showErrorMessage(message) {
        if (!loadingMessage) return;
        const textNode = loadingMessage.querySelector('p') || loadingMessage;
        textNode.textContent = message;
        const spinnerBox = loadingMessage.querySelector('.mlb-spinner-box');
        if (spinnerBox) {
            spinnerBox.style.display = 'none';
        }
        loadingMessage.classList.remove('mlb-iframe-loading--hidden');
    }

    if (hotelId && arrival && departure) {
        iframeContainer.classList.remove('mlb-iframe-ready');
        const bookingEngineBaseUrl = window.MLBBookingEngineBase || 'https://bookingengine.mylighthouse.com/';
        let iframeSrc = `${bookingEngineBaseUrl}${encodeURIComponent(hotelId)}/Rooms/Select?Arrival=${encodeURIComponent(arrival)}&Departure=${encodeURIComponent(departure)}`;

        if (roomId) {
            iframeSrc += `&room=${encodeURIComponent(roomId)}`;
        }

        iframe.src = iframeSrc;

        iframe.onload = function() {
            function checkIframeSpinner() {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const spinner = iframeDoc.getElementById('pnlAvailabilityLoader');

                    if (spinner) {
                        const spinnerStyle = window.getComputedStyle(spinner);
                        if (spinnerStyle.display === 'none' || spinnerStyle.visibility === 'hidden') {
                            hideLoader();
                        } else {
                            setTimeout(checkIframeSpinner, 120);
                        }
                    } else {
                        hideLoader();
                    }
                } catch (e) {
                    setTimeout(function() {
                        hideLoader();
                    }, 1000);
                }
            }

            checkIframeSpinner();
        };

        iframe.addEventListener('error', function() {
            showErrorMessage(getText('We could not load the booking engine. Please refresh and try again.'));
        }, { once: true });
    } else {
        showErrorMessage(getText('Booking information is missing. Please start your search again from the homepage.'));
    }
});
