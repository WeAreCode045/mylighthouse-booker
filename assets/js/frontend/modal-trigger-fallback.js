(function () {
    'use strict';

    try { console.debug('[MLB Modal Trigger] script loaded'); } catch (e) {}

    if (window._mlb_modal_trigger_bound) return;
    window._mlb_modal_trigger_bound = true;

    document.addEventListener('click', function (e) {
        // Normalize click target: allow clicks on the input, its icon, or the surrounding field
        var btn = null;
        try {
            btn = e.target.closest && e.target.closest('[data-trigger-modal="true"]');
        } catch (ex) { btn = null; }

        if (!btn) {
            // If the user clicked the icon or surrounding field, map to the actual input trigger
            var field = e.target.closest && e.target.closest('.daterange-field, .form-field, .mlb-daterange');
            if (field) {
                btn = field.querySelector && field.querySelector('[data-trigger-modal="true"]');
            }
        }
        if (!btn) return;
        if (btn._mlbHandled) return;
        btn._mlbHandled = true;
        e.preventDefault();

        // Find the canonical form element: prefer a direct .mlb-form, otherwise look inside a wrapper
        var wrapper = btn.closest && (btn.closest('.mlb-form') || btn.closest('.mlb-booking-form'));
        var formEl = null;
        if (wrapper) {
            formEl = (wrapper.tagName && wrapper.tagName.toLowerCase() === 'form') ? wrapper : (wrapper.querySelector && (wrapper.querySelector('form.mlb-form') || wrapper.querySelector('.mlb-form')));
            if (!formEl && wrapper.tagName && wrapper.tagName.toLowerCase() === 'form') formEl = wrapper;
        }
        if (!formEl) return;

        var formId = formEl.id || '';

        // Try to find existing overlay
        var overlay = formEl._mlbModalOverlay || document.querySelector('.mlb-calendar-modal-overlay[data-form-id="' + formId + '"]');

        // If no overlay, attempt to initialize the modal for this form
        if (!overlay && typeof window.initRoomModalDatePicker === 'function') {
            try {
                console.debug('[MLB Modal Trigger] calling initRoomModalDatePicker for form', formEl && formEl.id);
                if (window.jQuery) {
                    try { window.initRoomModalDatePicker(window.jQuery(formEl)); } catch (e) { /* ignore init errors */ }
                } else {
                    try { window.initRoomModalDatePicker(formEl); } catch (e) { /* ignore init errors */ }
                }
            } catch (e) { /* ignore init errors */ }
        }

        try {
            var evt = new CustomEvent('mlb-maybe-init-modal', { detail: { form: formEl } });
            document.dispatchEvent(evt);
        } catch (err) {}

        setTimeout(function () {
            try {
                var overlay2 = formEl._mlbModalOverlay || document.querySelector('.mlb-calendar-modal-overlay[data-form-id="' + (formEl.id || '') + '"]');
                if (!overlay2 && typeof window.initRoomModalDatePicker === 'function') {
                    try { window.initRoomModalDatePicker(window.jQuery ? window.jQuery(formEl) : formEl); } catch (e) { /* ignore init errors */ }
                    overlay2 = formEl._mlbModalOverlay || document.querySelector('.mlb-calendar-modal-overlay[data-form-id="' + (formEl.id || '') + '"]');
                }

                if (overlay2) {
                    try {
                        // Refresh modal contents and request booking details to show
                        if (typeof overlay2._refreshHotelInModal === 'function') {
                            try { overlay2._refreshHotelInModal(); } catch (e) {}
                        }
                        if (typeof overlay2._showBookingDetailsPlaceholder === 'function') {
                            try { overlay2._showBookingDetailsPlaceholder(); } catch (e) {}
                        }
                        var shown = document.querySelectorAll('.mlb-calendar-modal-overlay.mlb-calendar-modal-show');
                        Array.prototype.forEach.call(shown, function(o) { if (o !== overlay2) { o.classList.remove('mlb-calendar-modal-show'); try { o.style.display = 'none'; } catch (e) {} } });
                    } catch (e) {}
                    try { overlay2.style.display = 'block'; } catch (e) {}
                    overlay2.classList.add('mlb-calendar-modal-show');
                    return;
                }

                var openEvt = new CustomEvent('mlb-open-calendar', { bubbles: true });
                try { formEl.dispatchEvent(openEvt); } catch (err) {}
                try { if (window.jQuery) jQuery(formEl).trigger('mlb-open-calendar'); } catch (err) {}
            } catch (err) {}
        }, 120);
    }, false);

})();
