(function () {
    'use strict';

    if (window._mlb_modal_trigger_bound) return;
    window._mlb_modal_trigger_bound = true;

    document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('[data-trigger-modal="true"]');
        if (!btn) return;

        if (btn._mlbHandled) return;
        btn._mlbHandled = true;

        e.preventDefault();

        var form = btn.closest && btn.closest('.mlb-form');
        if (!form) return;

        var formId = form.id || '';
        var overlay = form._mlbModalOverlay || document.querySelector('.mlb-calendar-modal-overlay[data-form-id="' + formId + '"]');
        if (overlay) {
            overlay.classList.add('mlb-calendar-modal-show');
            return;
        }

        try {
            var evt = new CustomEvent('mlb-maybe-init-modal', { detail: { form: form } });
            document.dispatchEvent(evt);
        } catch (err) {}

        setTimeout(function () {
            try {
                var overlay2 = form._mlbModalOverlay || document.querySelector('.mlb-calendar-modal-overlay[data-form-id="' + formId + '"]');
                if (!overlay2 && typeof window.initRoomModalDatePicker === 'function') {
                    try { window.initRoomModalDatePicker(form); } catch (e) { /* ignore init errors */ }
                    overlay2 = form._mlbModalOverlay || document.querySelector('.mlb-calendar-modal-overlay[data-form-id="' + formId + '"]');
                }

                if (overlay2) {
                    overlay2.classList.add('mlb-calendar-modal-show');
                    return;
                }

                var openEvt = new CustomEvent('mlb-open-calendar', { bubbles: true });
                try { form.dispatchEvent(openEvt); } catch (err) {}
                try { if (window.jQuery) jQuery(form).trigger('mlb-open-calendar'); } catch (err) {}
            } catch (err) {}
        }, 120);
    }, false);

})();
