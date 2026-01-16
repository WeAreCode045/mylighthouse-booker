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

        var form = btn.closest && btn.closest('.mlb-form');
        if (!form) return;

        var formId = form.id || '';
        var overlay = form._mlbModalOverlay || document.querySelector('.mlb-calendar-modal-overlay[data-form-id="' + formId + '"]');
                if (!overlay2 && typeof window.initRoomModalDatePicker === 'function') {
                    try {
                        console.debug('[MLB Modal Trigger] calling initRoomModalDatePicker for form', form && form.id);
                        if (window.jQuery) {
                            try { window.initRoomModalDatePicker(window.jQuery(form)); } catch (e) { /* ignore init errors */ }
                        } else {
                            try { window.initRoomModalDatePicker(form); } catch (e) { /* ignore init errors */ }
                        }
                    } catch (e) { /* ignore init errors */ }
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
                    try {
                        var shown = document.querySelectorAll('.mlb-calendar-modal-overlay.mlb-calendar-modal-show');
                        Array.prototype.forEach.call(shown, function(o) { if (o !== overlay2) { o.classList.remove('mlb-calendar-modal-show'); try { o.style.display = 'none'; } catch (e) {} } });
                    } catch (e) {}
                    try { overlay2.style.display = 'block'; } catch (e) {}
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
