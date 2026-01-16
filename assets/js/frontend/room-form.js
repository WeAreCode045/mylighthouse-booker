/**
 * Frontend JavaScript for room booking forms with modal date picker
 */

(function() {
    'use strict';

    // Early shim: provide a queued initRoomModalDatePicker so calls from other
    // bundles (which may execute before this file finishes parsing) are not lost.
    if (typeof window.initRoomModalDatePicker !== 'function' || /noop/.test(String(window.initRoomModalDatePicker))) {
        window._mlb_initRoomModal_queue = window._mlb_initRoomModal_queue || [];
        window.initRoomModalDatePicker = function(form) {
            try { console.debug('[MLB RoomForm Shim] queueing init call for form', form && (form.id || (form[0] && form[0].id))); } catch (e) {}
            window._mlb_initRoomModal_queue.push(form);
        };
    }

    // Wait for jQuery to be available
    function initWhenReady() {
        if (typeof jQuery === 'undefined') {
            setTimeout(initWhenReady, 50);
            return;
        }
        
        var $ = jQuery;

    // JS gettext helper: delegate to MLB.utils when available
    function mlbGettext(str) {
        try {
            if (window.MLB && window.MLB.utils && typeof window.MLB.utils.gettext === 'function') {
                return window.MLB.utils.gettext(str);
            }
            if (typeof wp !== 'undefined' && wp.i18n && typeof wp.i18n.__ === 'function') {
                return wp.i18n.__(str, 'mylighthouse-booker');
            }
        } catch (e) {}
        return str;
    }

    // Expose init function for a single room form element.
    window.initRoomForm = window.initRoomForm || function(formEl) {
        try {
            var $form = (formEl && formEl.jquery) ? formEl : (typeof jQuery !== 'undefined' ? jQuery(formEl) : null);
            if (!$form || !$form.length) {
                // If passed a raw element, wrap
                if (formEl && formEl.nodeType === Node.ELEMENT_NODE && typeof jQuery !== 'undefined') {
                    $form = jQuery(formEl);
                } else {
                    return;
                }
            }

            try { if ($form && $form.length && typeof window.mlbEnsureFormId === 'function') { window.mlbEnsureFormId($form[0]); } } catch (e) {}

            // Ensure modal picker initializer is called for this form
            try {
                if (typeof window.initRoomModalDatePicker === 'function') {
                    window.initRoomModalDatePicker($form);
                } else if (typeof initModalDatePicker === 'function') {
                    initModalDatePicker($form);
                }
            } catch (e) {
                // ignore
            }
        } catch (err) {
            console.error('initRoomForm error', err);
        }
    };

    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================

    /**
     * Format Date object to d-m-Y string (delegate to utils if available)
     */
    function formatDMY(d) {
        try {
            if (window.MLB && window.MLB.utils && typeof window.MLB.utils.formatDMY === 'function') {
                return window.MLB.utils.formatDMY(d);
            }
        } catch (e) {}
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return dd + '-' + mm + '-' + yyyy;
    }

    /**
     * Copy CSS variables from source to target element (delegate to utils if available)
     */
    function copyCSSVariables(source, target, variables) {
        try {
            if (window.MLB && window.MLB.utils && typeof window.MLB.utils.copyCSSVariables === 'function') {
                return window.MLB.utils.copyCSSVariables(source, target, variables);
            }
        } catch (e) {}
        const computedStyle = getComputedStyle(source);
        variables.forEach(function(varName) {
            const value = computedStyle.getPropertyValue(varName);
            if (value) {
                target.style.setProperty(varName, value);
            }
        });
    }

    /**
     * Initialize inline date picker for hotel forms
     */
    function initInlineDatePicker($form) {
        const formId = $form.attr('id');
        console.debug('[MLB Inline Picker] initInlineDatePicker called for form:', formId);
        const $daterangeInput = $form.find('.mlb-daterange');
        const $checkinHidden = $form.find('.mlb-checkin');
        const $checkoutHidden = $form.find('.mlb-checkout');

        if (!$daterangeInput.length || !$checkinHidden.length || !$checkoutHidden.length) {
            console.error('[MLB Inline Picker] Missing required inputs for form:', formId);
            return;
        }

        if ($form.hasClass('mlb-inline-picker-init')) {
            return;
        }
        $form.addClass('mlb-inline-picker-init');

        let attempts = 0;

        function initPicker() {
            attempts++;
            const easepickRef = window.easepick;

            if (!easepickRef || !easepickRef.Core) {
                if (attempts > 50) {
                    console.error('[MLB Inline Picker] EasePick failed to load after 50 attempts');
                    return;
                }
                setTimeout(initPicker, 100);
                return;
            }

            const CoreClass = easepickRef.Core || (easepickRef.easepick && easepickRef.easepick.Core) || easepickRef.create;
            if (!CoreClass) {
                console.error('[MLB Inline Picker] CoreClass not found');
                return;
            }

            try {
                // Create backdrop element
                let $backdrop = $('.mlb-calendar-backdrop[data-form-id="' + formId + '"]');
                if (!$backdrop.length) {
                        try{
                            var tpl = document.getElementById('mlb-modal-backdrop');
                            if(tpl && tpl.content && tpl.content.firstElementChild){
                                var clone = tpl.content.firstElementChild.cloneNode(true);
                                clone.setAttribute('data-form-id', formId);
                                document.body.appendChild(clone);
                                $backdrop = $('.mlb-calendar-backdrop[data-form-id="' + formId + '"]');
                            } else {
                                var d = document.createElement('div');
                                d.className = 'mlb-calendar-backdrop';
                                d.setAttribute('data-form-id', formId);
                                document.body.appendChild(d);
                                $backdrop = $('.mlb-calendar-backdrop[data-form-id="' + formId + '"]');
                            }
                        }catch(e){
                            var d = document.createElement('div');
                            d.className = 'mlb-calendar-backdrop';
                            d.setAttribute('data-form-id', formId);
                            document.body.appendChild(d);
                            $backdrop = $('.mlb-calendar-backdrop[data-form-id="' + formId + '"]');
                        }
                        $backdrop.on('click.mlbDatepicker', function(){ if(window.mlbInlinePickers && window.mlbInlinePickers[formId]){ window.mlbInlinePickers[formId].hide(); } });
                }

                // Build inline picker configuration
                const pickerConfig = {
                    element: $daterangeInput[0],
                    css: [
                        '/wp-content/plugins/mylighthouse-booker/assets/vendor/easepick/easepick.css'
                    ],
                    plugins: [easepickRef.RangePlugin, easepickRef.LockPlugin],
                    RangePlugin: {
                        tooltip: true,
                        locale: {
                            one: 'nacht',
                            other: 'nachten'
                        }
                    },
                    LockPlugin: {
                        minDate: new Date(),
                    },
                    setup(picker) {
                        // Set initial placeholder from per-form custom texts
                        if (!$daterangeInput.val() || $daterangeInput.val() === '') {
                            const arrivalTxt = $daterangeInput.data('arrival-text') || mlbGettext('Select Arrival Date');
                            const departureTxt = $daterangeInput.data('departure-text') || mlbGettext('Select Departure Date');
                            $daterangeInput.val(arrivalTxt + ' ⇢ ' + departureTxt);
                        }

                        // Show backdrop when calendar opens
                        picker.on('show', () => {
                            $backdrop.addClass('show');
                        });

                        // Hide backdrop when calendar closes
                        picker.on('hide', () => {
                            $backdrop.removeClass('show');
                        });

                        picker.on('select', (e) => {
                            const { start, end } = e.detail;
                            if (!start || !end) return;

                            // Update hidden inputs
                            $checkinHidden.val(formatDMY(start));
                            $checkoutHidden.val(formatDMY(end));

                            // Update visible input
                            const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                            const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                            $daterangeInput.val(`${startStr} → ${endStr}`);
                        });
                    },
                    lang: 'en-GB',
                    format: 'DD MMM - DD MMM YYYY',
                };

                const picker = new CoreClass(pickerConfig);
                
                // Store picker reference globally for backdrop click handler
                if (!window.mlbInlinePickers) {
                    window.mlbInlinePickers = {};
                }
                window.mlbInlinePickers[formId] = picker;
                console.log('[MLB Inline Picker] Initialized inline picker for form:', formId);

            } catch (error) {
                console.error('[MLB Inline Picker] Error initializing:', error);
            }
        }

        initPicker();
    }

    /**
     * Initialize modal date picker for room forms
     */
    function initRoomModalDatePicker($form) {
        const formId = $form.attr('id');
        console.debug('[MLB Modal Picker] initRoomModalDatePicker called for form:', formId);
        const $checkinHidden = $form.find('.mlb-checkin');
        const $checkoutHidden = $form.find('.mlb-checkout');
        // Visible daterange input (may be hidden for special forms that use modal)
        const $daterangeInput = $form.find('.mlb-daterange');
        const $bookRoomBtn = $form.find('.mlb-book-room-btn, [data-trigger-modal="true"]');

        if (!$checkinHidden.length || !$checkoutHidden.length) {
            console.error('[MLB Modal Picker] Missing hidden inputs');
            return;
        }
        
        if (!$bookRoomBtn.length) {
            console.error('[MLB Modal Picker] No room booking button found');
            return;
        }
        
        if ($form.hasClass('mlb-modal-picker-init')) {
            return;
        }
        $form.addClass('mlb-modal-picker-init');

        let attempts = 0;

        function initPicker() {
            attempts++;
            const easepickRef = window.easepick;

            if (!easepickRef || !easepickRef.Core) {
                if (attempts > 50) {
                    console.error('[MLB Modal Picker] EasePick failed to load after 50 attempts');
                    return;
                }
                setTimeout(initPicker, 100);
                return;
            }

            const CoreClass = easepickRef.Core || (easepickRef.easepick && easepickRef.easepick.Core) || easepickRef.create;
            if (!CoreClass) {
                console.error('[MLB Modal Picker] CoreClass not found');
                return;
            }

            try {
                // Create modal from a server-rendered <template> if available, otherwise fall back to cqb_params.modal_template
                let modalOverlay = null;
                try {
                    const tpl = document.getElementById('mlb-modal-template-room');
                    if (tpl && tpl.content && tpl.content.firstElementChild) {
                        modalOverlay = tpl.content.firstElementChild.cloneNode(true);
                    } else if (typeof cqb_params !== 'undefined' && cqb_params.modal_template) {
                        // Debug: inspect modal template length to detect stray content
                        console.debug('[MLB Datepicker] modal_template length:', cqb_params.modal_template ? cqb_params.modal_template.length : 0);
                        try {
                            var parser = new DOMParser();
                            var doc = parser.parseFromString(cqb_params.modal_template || '', 'text/html');
                            modalOverlay = doc.body ? doc.body.firstElementChild : doc.firstElementChild;
                        } catch (err) {
                            console.error('[MLB Datepicker] modal_template parse error', err);
                        }
                    }
                } catch (err) {
                    console.error('[MLB Datepicker] template clone error', err);
                }

                if (!modalOverlay) {
                    console.error('[MLB Datepicker] No modal template found for room form');
                    return;
                }

                if (!modalOverlay) {
                    console.error('[MLB Datepicker] Modal template is empty');
                    return;
                }

                modalOverlay.setAttribute('data-form-id', formId);

                const modalContainer = modalOverlay.querySelector('.mlb-calendar-modal-container');
                const closeBtn = modalOverlay.querySelector('.mlb-calendar-modal-close');
                const contentWrapper = modalOverlay.querySelector('.mlb-modal-content-wrapper');
                const calendarDiv = modalOverlay.querySelector('.mlb-modal-calendar');

                // Debug: log existing overlays for this form
                const overlays = document.querySelectorAll('.mlb-calendar-modal-overlay[data-form-id="' + formId + '"]');
                if (overlays && overlays.length) {
                    console.debug('[MLB Datepicker] existing overlays count for form', formId, overlays.length);
                }

                // Defensive: clear any stray text or leftover nodes in the calendar container
                // (sometimes inspection tools or template rendering can leave text nodes)
                if (calendarDiv) {
                    try{
                        console.debug('[MLB Datepicker] calendarDiv before clear:', calendarDiv.innerHTML);
                    }catch(e){}
                    while (calendarDiv.firstChild) { calendarDiv.removeChild(calendarDiv.firstChild); }
                    try{
                        console.debug('[MLB Datepicker] calendarDiv after clear:', calendarDiv.innerHTML);
                    }catch(e){}
                }
                const rightColumn = modalOverlay.querySelector('.mlb-modal-right-column');
                const bookingDetailsDiv = modalOverlay.querySelector('.mlb-booking-details');
                const modalSubmitBtn = modalOverlay.querySelector('.mlb-modal-submit-btn');

                // Discount code toggle: reveal input when checked
                const discountToggle = modalOverlay.querySelector('.mlb-discount-toggle');
                const discountInput = modalOverlay.querySelector('.mlb-discount-code');
                const discountWrapper = modalOverlay.querySelector('.mlb-discount-input-wrapper');
                if (discountToggle) {
                    try {
                        // initial state
                        if (discountToggle.checked) {
                            if (discountWrapper) discountWrapper.style.display = '';
                            if (discountInput) discountInput.disabled = false;
                        } else {
                            if (discountWrapper) discountWrapper.style.display = 'none';
                            if (discountInput) discountInput.disabled = true;
                        }
                        discountToggle.addEventListener('change', function() {
                            try {
                                if (discountToggle.checked) {
                                    if (discountWrapper) discountWrapper.style.display = '';
                                    if (discountInput) { discountInput.disabled = false; discountInput.focus(); }
                                } else {
                                    if (discountWrapper) discountWrapper.style.display = 'none';
                                    if (discountInput) { discountInput.disabled = true; discountInput.value = ''; }
                                }
                            } catch (e) {}
                        });
                    } catch (e) {}
                }

                // Copy form styling to modal
                const formWrapper = $form.closest('.mlb-booking-form');
                if (formWrapper && formWrapper.length) {
                    copyCSSVariables(formWrapper[0], modalOverlay, [
                        '--mlb-btn-bg',
                        '--mlb-btn-text',
                        '--mlb-btn-bg-hover',
                        '--mlb-btn-text-hover',
                        '--mlb-btn-radius',
                        '--mlb-button-padding-vertical',
                        '--mlb-button-padding-horizontal',
                        '--mlb-button-font-size',
                        '--mlb-button-font-weight',
                        '--mlb-button-text-transform',
                        '--mlb-calendar-startend-bg',
                        '--mlb-calendar-startend-color',
                        '--mlb-calendar-inrange-bg',
                    ]);
                }

                // Configure modal based on form type
                if (contentWrapper) {
                    // Detect form type
                    const hasRoomId = $form.data('room-id');
                    const isHotelForm = !hasRoomId;
                    
                    var hotelName = '';
                    try { hotelName = window.mlbGetFormValue($form, ['hotelName','hotel_name','hotel-id','hotel_id','hotel']); } catch (e) {}
                    if (!hotelName) {
                        hotelName = $form.attr('data-hotel-name') || $form.attr('data-hotel-id') || '';
                        if (!hotelName && $form.data) {
                            hotelName = $form.data('hotelName') || $form.data('hotel-id') || $form.data('hotelId') || hotelName;
                        }
                    }
                    
                    // Set hotel name - prioritize selected hotel, then data attribute
                    let displayHotelName = hotelName;
                    const hotelSelect = $form.find('.mlb-hotel-select');
                    if (hotelSelect.length) {
                        const selectedOption = hotelSelect.find('option:selected');
                        if (selectedOption.length && selectedOption.val() && selectedOption.val() !== '') {
                            displayHotelName = selectedOption.text().trim();
                        }
                    }
                    
                    const hotelNameSpan = modalOverlay.querySelector('.mlb-hotel-name');
                    const modalHotelSelect = modalOverlay.querySelector('.mlb-hotel-select');

                    // Determine final hotel name from selected option or data attributes
                    const finalHotelName = (displayHotelName && displayHotelName.trim()) ? displayHotelName : (hotelSelect && hotelSelect.length ? hotelSelect.find('option:selected').text().trim() : hotelName);

                    // Populate modal select from source form select if present
                    try {
                        if (modalHotelSelect) {
                            const sourceSelect = $form.find('.mlb-hotel-select');
                            if (sourceSelect && sourceSelect.length) {
                                modalHotelSelect.innerHTML = '';
                                sourceSelect.find('option').each(function() {
                                    try {
                                        var opt = document.createElement('option');
                                        opt.value = this.value || this.getAttribute('value') || '';
                                        opt.text = this.text || this.textContent || this.innerText || '';
                                        if (this.selected) opt.selected = true;
                                        modalHotelSelect.appendChild(opt);
                                    } catch (e) {}
                                });
                            }
                        }
                    } catch (e) {
                        console.warn('[MLB Datepicker] Error populating modal hotel select', e);
                    }

                    // Decide whether to show the select: show when the source select has no selected value
                    // or when the resolved hotel name looks like a placeholder.
                    var needSelect = false;
                    try {
                        const sourceSelect = $form.find('.mlb-hotel-select');
                        if (sourceSelect && sourceSelect.length) {
                            const sel = sourceSelect.find('option:selected');
                            if (sel && sel.length) {
                                var val = (typeof sel.val === 'function') ? sel.val() : (sel.attr ? sel.attr('value') : '');
                                if (!val || String(val).trim() === '') {
                                    needSelect = true;
                                }
                            } else {
                                needSelect = true;
                            }
                        }
                    } catch (e) {}

                    // Also treat common placeholder texts as missing selections
                    try {
                        var normalized = (finalHotelName || '').trim().toLowerCase();
                        var placeholders = [mlbGettext('Hotel'), mlbGettext('Select hotel'), mlbGettext('Choose hotel'), mlbGettext('Select a hotel')].map(function(s){ return (s||'').trim().toLowerCase(); });
                        if (!normalized || placeholders.indexOf(normalized) !== -1) {
                            needSelect = true;
                        }
                    } catch (e) {}

                    if (modalHotelSelect) {
                        if (needSelect) {
                            modalHotelSelect.style.display = '';
                            if (hotelNameSpan) hotelNameSpan.style.display = 'none';
                        } else {
                            modalHotelSelect.style.display = 'none';
                            if (hotelNameSpan) { hotelNameSpan.style.display = ''; hotelNameSpan.textContent = finalHotelName || mlbGettext('Hotel'); }
                        }
                    } else {
                        if (hotelNameSpan) hotelNameSpan.textContent = finalHotelName || mlbGettext('Hotel');
                    }
                    try { console.debug('[MLB Datepicker] hotel name resolved', { displayHotelName, finalHotelName, hotelSelectCount: hotelSelect ? hotelSelect.length : 0, needSelect: needSelect }); } catch(e){}
                    
                    if (isHotelForm) {
                        // Hotel form: hide room/special rows, show "Check Availability"
                        contentWrapper.classList.add('hotel-form-modal');
                        const roomRow = modalOverlay.querySelector('.mlb-room-row');
                        const specialRow = modalOverlay.querySelector('.mlb-special-row');
                        if (roomRow) roomRow.style.display = 'none';
                        if (specialRow) specialRow.style.display = 'none';
                        
                        const ctaRoom = modalOverlay.querySelector('.mlb-modal-cta-room');
                        if (ctaRoom) ctaRoom.textContent = mlbGettext('Check Availability');

                        // If dates are already present, enable the submit button so Check Availability works immediately
                        try {
                            const ci = $checkinHidden.val && $checkinHidden.val();
                            const co = $checkoutHidden.val && $checkoutHidden.val();
                            if (modalSubmitBtn && ci && co) {
                                modalSubmitBtn.disabled = false;
                            }
                        } catch (err) {
                            // ignore
                        }
                    } else if (hasRoomId) {
                        // Room form: show room row, hide special row, show "Book This Room"
                        contentWrapper.classList.add('room-form-modal');
                        var roomName = '';
                        try { roomName = window.mlbGetFormValue($form, ['roomName','room_name','room-id','room_id','room']); } catch (e) {}
                        if (!roomName) roomName = $form.data('room-name') || $form.data('room-id') || '';
                        
                        const roomNameSpan = modalOverlay.querySelector('.mlb-room-name');
                        if (roomNameSpan) {
                            roomNameSpan.textContent = roomName;
                            // show room row and hide special row
                            const roomRow = modalOverlay.querySelector('.mlb-room-row');
                            const specialRow = modalOverlay.querySelector('.mlb-special-row');
                            if (roomRow) roomRow.style.display = '';
                            if (specialRow) specialRow.style.display = 'none';
                        }
                        // Ensure CTA label shows room text
                        if (ctaRoom) { ctaRoom.style.display = ''; ctaRoom.textContent = mlbGettext('Book This Room'); }
                    }
                }

                // Defensive: if a previous overlay for this form already exists, remove it
                const existingOverlay = document.querySelector('.mlb-calendar-modal-overlay[data-form-id="' + formId + '"]');
                if (existingOverlay && existingOverlay.parentNode) {
                    existingOverlay.parentNode.removeChild(existingOverlay);
                }

                document.body.appendChild(modalOverlay);
                try {
                    if (modalOverlay && modalOverlay.style && modalOverlay.style.display === 'none') {
                        modalOverlay.style.display = '';
                    }
                } catch (e) {}
                console.debug('[MLB Modal Picker] modalOverlay appended for form:', formId, modalOverlay);
                try { if ($form && $form.length) $form[0]._mlbModalOverlay = modalOverlay; } catch (e) {}

                // Defensive scrub: remove any stray text nodes that contain date-like strings
                // (e.g. '16 Oct - 16 Oct 2025') which occasionally appear due to
                // template rendering or inspection-tool artifacts.
                setTimeout(function() {
                    try {
                        const cal = modalOverlay.querySelector('.mlb-modal-calendar');
                        if (cal) {
                            const nodes = Array.from(cal.childNodes);
                            const dateLike = /\d{1,2}\s+[A-Za-z]{3}(?:\s+\d{4})?/;
                            nodes.forEach(function(n) {
                                if (n.nodeType === Node.TEXT_NODE) {
                                    const txt = n.textContent.trim();
                                    if (txt.length && dateLike.test(txt)) {
                                        n.parentNode.removeChild(n);
                                        console.debug('[MLB Datepicker] removed stray date text node:', txt);
                                    }
                                }
                            });
                        }
                    } catch (e) {
                        // ignore
                    }
                }, 0);

                // Modal controls
                function closeModal() {
                    try {
                        // hide overlay
                        try { modalOverlay.style.display = 'none'; } catch (e) {}
                        modalOverlay.classList.remove('mlb-calendar-modal-show');

                        // Hide the easepick calendar UI to prevent arrows from staying visible
                        const picker = $form.data('picker');
                        if (picker && typeof picker.hide === 'function') {
                            try {
                                picker.hide();
                            } catch (e) {
                                console.warn('[MLB Modal Picker] Error hiding picker:', e);
                            }
                        }

                        // reset hidden inputs and visible daterange
                        try { $checkinHidden.val(''); } catch (e) {}
                        try { $checkoutHidden.val(''); } catch (e) {}
                        try {
                            if ($daterangeInput && $daterangeInput.length) {
                                const arrivalTxt = $daterangeInput.data('arrival-text') || mlbGettext('Select Arrival Date');
                                const departureTxt = $daterangeInput.data('departure-text') || mlbGettext('Select Departure Date');
                                $daterangeInput.val(arrivalTxt + ' ⇢ ' + departureTxt);
                            }
                        } catch (e) {}

                        // reset booking details UI
                        try {
                            if (bookingDetailsDiv) {
                                const periodSpan = bookingDetailsDiv.querySelector('.mlb-period-range');
                                if (periodSpan) periodSpan.textContent = '';
                            }
                        } catch (e) {}

                        // Clear discount toggle and input when closing modal
                        try {
                            const toggle = modalOverlay.querySelector('.mlb-discount-toggle');
                            const input = modalOverlay.querySelector('.mlb-discount-code');
                            const wrapper = modalOverlay.querySelector('.mlb-discount-input-wrapper');
                            if (toggle) toggle.checked = false;
                            if (input) input.value = '';
                            if (wrapper) wrapper.style.display = 'none';
                        } catch (e) {}

                        // collapse right column and disable submit
                        try { if (rightColumn) rightColumn.classList.remove('mlb-expanded'); } catch (e) {}
                                    // expose for external use
                                    try{ window.initRoomModalDatePicker = initRoomModalDatePicker; }catch(e){}
                        try { if (modalSubmitBtn) modalSubmitBtn.disabled = true; } catch (e) {}

                        // attempt to clear picker selection safely (try known method names)
                        try {
                            const picker = $form.data('picker') || (window.mlbInlinePickers && window.mlbInlinePickers[formId]);
                            if (picker) {
                                if (typeof picker.clearSelection === 'function') picker.clearSelection();
                                else if (typeof picker.clear === 'function') picker.clear();
                                else if (typeof picker.setDateRange === 'function') picker.setDateRange();
                                else if (typeof picker.remove === 'function') picker.remove();
                                else if (typeof picker.destroy === 'function') picker.destroy();
                                else if (typeof picker.setDate === 'function') picker.setDate();
                                // also clear any trigger input value
                                try {
                                    const trig = modalOverlay.querySelector('.mlb-picker-trigger-input');
                                    if (trig) trig.value = '';
                                } catch (e) {}
                            }
                        } catch (e) {}
                    } catch (err) {
                        console.error('[MLB Modal Picker] closeModal error', err);
                    }
                }

                modalOverlay.addEventListener('click', function(e) {
                    if (e.target === modalOverlay) closeModal();
                });

                if (closeBtn) {
                    closeBtn.addEventListener('click', closeModal);
                }

                const escapeHandler = function(e) {
                    if (e.key === 'Escape' && modalOverlay.classList.contains('mlb-calendar-modal-show')) {
                        closeModal();
                    }
                };
                document.addEventListener('keydown', escapeHandler);
                modalOverlay._escapeHandler = escapeHandler;

                // Show modal on trigger (room forms only)
                $form.on('mlb-open-calendar', function(e) {
                    e.preventDefault();
                    try { modalOverlay.style.display = 'block'; } catch (e) {}
                    modalOverlay.classList.add('mlb-calendar-modal-show');
                });

                if ($bookRoomBtn.length) {
                    $bookRoomBtn.on('click', function(e) {
                        e.preventDefault();
                        console.log('[MLB Modal Picker] Book button clicked for form:', formId);
                        if (modalOverlay) {
                            console.log('[MLB Modal Picker] Showing modalOverlay for form:', formId, modalOverlay);
                            try { modalOverlay.style.display = 'block'; } catch (e) {}
                            modalOverlay.classList.add('mlb-calendar-modal-show');
                            try {
                                // Give layout a tick then inspect computed style and bounds
                                setTimeout(function() {
                                    try {
                                        var cs = window.getComputedStyle(modalOverlay);
                                        console.debug('[MLB Modal Picker] overlay computed style', { display: cs.display, visibility: cs.visibility, opacity: cs.opacity });
                                        try { console.debug('[MLB Modal Picker] overlay rect', modalOverlay.getBoundingClientRect()); } catch (e) {}
                                        var container = modalOverlay.querySelector('.mlb-calendar-modal-container');
                                        console.debug('[MLB Modal Picker] container exists?', !!container);
                                        if (container) console.debug('[MLB Modal Picker] container rect', container.getBoundingClientRect());
                                    } catch (e) { console.error('[MLB Modal Picker] post-show inspect error', e); }
                                }, 40);
                            } catch (e) {}
                        } else {
                            console.warn('[MLB Modal Picker] modalOverlay not present when click fired for form:', formId);
                        }
                    });
                }

                // Get calendar colors
                const calendarColors = (typeof cqb_params !== 'undefined' && cqb_params.calendar_colors)
                    ? cqb_params.calendar_colors
                    : {
                        startend_bg: '#007cba',
                        startend_color: '#fff',
                        inrange_bg: '#e1f0f7'
                    };

                // Build picker configuration
                // Create a hidden trigger input inside the calendar container so easepick
                // will update the input's value instead of setting innerText on the
                // calendar container (which created stray formatted date text nodes).
                let pickerElement = calendarDiv;
                if (calendarDiv) {
                    try {
                        const triggerInput = document.createElement('input');
                        triggerInput.type = 'hidden';
                        triggerInput.className = 'mlb-picker-trigger-input';
                        calendarDiv.appendChild(triggerInput);
                        pickerElement = triggerInput;
                    } catch (e) {
                        // fallback to calendarDiv if anything goes wrong
                        pickerElement = calendarDiv;
                    }
                }

                const pickerConfig = {
                    element: pickerElement,
                    css: [
                        '/wp-content/plugins/mylighthouse-booker/assets/vendor/easepick/easepick.css'
                    ],
                    inline: true,
                    plugins: [easepickRef.RangePlugin, easepickRef.LockPlugin],
                    RangePlugin: {
                        tooltip: true,
                        locale: {
                            one: 'nacht',
                            other: 'nachten'
                        }
                    },
                    LockPlugin: {
                        minDate: new Date(),
                    },
                    setup(picker) {
                        // Remove header for room forms
                        setTimeout(function() {
                            const headerEl = calendarDiv.querySelector('.header');
                            if (headerEl) headerEl.remove();
                        }, 0);

                        picker.on('select', (e) => {
                            const { start, end } = e.detail;
                            if (!start || !end) return;

                            $checkinHidden.val(formatDMY(start));
                            $checkoutHidden.val(formatDMY(end));

                            // Notify room booking component about date selection
                            const dateSelectedEvent = new CustomEvent('mlb-dates-selected', {
                                    bubbles: true,
                                    detail: {
                                        arrivalDate: start,
                                        departureDate: end,
                                        bookingDetailsDiv: bookingDetailsDiv,
                                        rightColumn: rightColumn
                                    }
                                });
                                $form[0].dispatchEvent(dateSelectedEvent);

                                // Update UI directly (room-booking.js can also handle this)
                                if (bookingDetailsDiv) {
                                    const arrivalStr = start.toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    });
                                    const departureStr = end.toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    });

                            const periodSpan = bookingDetailsDiv.querySelector('.mlb-period-range');
                            if (periodSpan) periodSpan.textContent = mlbGettext('Period') + ': ' + arrivalStr + ' - ' + departureStr;

                            // Resolve hotel name: prefer a modal-select (if visible), then form select/data attrs
                            var hotelName = '';
                            try {
                                const modalHotelSelectLocal = bookingDetailsDiv.querySelector('.mlb-hotel-select');
                                if (modalHotelSelectLocal && modalHotelSelectLocal.style.display !== 'none') {
                                    const sel = modalHotelSelectLocal.querySelector('option:checked') || modalHotelSelectLocal.options[0];
                                    if (sel) hotelName = (sel.textContent || sel.innerText || '').trim();
                                }
                            } catch (e) {}

                            if (!hotelName) {
                                try {
                                    const hotelSelectLocal = $form.find('.mlb-hotel-select');
                                    if (hotelSelectLocal && hotelSelectLocal.length) {
                                        const sel = hotelSelectLocal.find('option:selected');
                                        if (sel && sel.length && sel.text().trim()) {
                                            hotelName = sel.text().trim();
                                        }
                                    }
                                } catch (e) {}
                            }

                            try {
                                if ((!hotelName || hotelName === '') && ($form.attr('data-hotel-name') || $form.data('hotel-name') || $form.data('hotel-id'))) {
                                    hotelName = $form.attr('data-hotel-name') || $form.data('hotel-name') || $form.data('hotel-id') || hotelName;
                                }
                            } catch (e) {}

                            const roomName = $form.attr('data-room-name') || $form.data('room-name') || $form.data('room-id') || 'Room';
                            const hotelNameSpan = bookingDetailsDiv.querySelector('.mlb-hotel-name');
                            const roomNameSpan = bookingDetailsDiv.querySelector('.mlb-room-name');

                            // If modal select is visible, prefer that and don't overwrite the select
                            try {
                                const modalHotelSelectLocal = bookingDetailsDiv.querySelector('.mlb-hotel-select');
                                if (modalHotelSelectLocal && modalHotelSelectLocal.style.display !== 'none') {
                                    // ensure span is hidden when select visible
                                    if (hotelNameSpan) hotelNameSpan.style.display = 'none';
                                } else {
                                    if (hotelNameSpan) {
                                        const existing = (hotelNameSpan.textContent || '').trim();
                                        const placeholder = mlbGettext('Hotel');
                                        if (!existing || existing === '' || existing === placeholder) {
                                            hotelNameSpan.textContent = hotelName || placeholder;
                                        } else {
                                            try { console.debug('[MLB Datepicker] preserving existing hotel name in booking details', existing); } catch(e){}
                                        }
                                        hotelNameSpan.style.display = '';
                                    }
                                }
                            } catch (e) {}

                            if (roomNameSpan) roomNameSpan.textContent = roomName;

                            setTimeout(function() {
                                if (rightColumn) rightColumn.classList.add('mlb-expanded');
                            }, 50);
                        }

                            if (modalSubmitBtn) modalSubmitBtn.disabled = false;
                    });

                    // Handle submit button in modal
                    if (modalSubmitBtn) {
                            modalSubmitBtn.disabled = true;
                            modalSubmitBtn.addEventListener('click', function(e) {
                                try { e.preventDefault(); e.stopPropagation(); } catch(err) {}
                                // helper: convert DMY (dd-mm-yyyy) to ISO (yyyy-mm-dd)
                                function toISO(dmy){ if(!dmy) return ''; var p = dmy.split('-'); if(p.length!==3) return dmy; return p[2] + '-' + p[1] + '-' + p[0]; }
                                try {
                                    // Detect form type
                                    const hasRoomId = $form.attr('data-room-id') || $form.data('roomId') || $form.data('room-id');
                                    const isHotelForm = !hasRoomId;
                                    
                                    console.debug('[MLB Modal Submit] click handler values', {
                                        formData: {
                                            hasRoomId: hasRoomId,
                                            isHotelForm: isHotelForm,
                                            hotelDataAttr: $form.data('hotel-id'),
                                            checkinHidden: $checkinHidden.val && $checkinHidden.val(),
                                            checkoutHidden: $checkoutHidden.val && $checkoutHidden.val(),
                                            discountValue: modalOverlay.querySelector('.mlb-discount-code') ? modalOverlay.querySelector('.mlb-discount-code').value : ''
                                        }
                                    });

                                    if (isHotelForm) {
                                        // For hotel forms, redirect to booking engine URL with parameters
                                        let hotelId = $form.data('hotel-id') || $form.find('[name="hotel_id"]').val();
                                        const checkin = $checkinHidden.val();
                                        const checkout = $checkoutHidden.val();
                                        // Convert DMY (dd-mm-yyyy) to ISO (yyyy-mm-dd) expected by booking engine
                                        function toISO(dmy){ if(!dmy) return ''; var p = dmy.split('-'); if(p.length!==3) return dmy; return p[2] + '-' + p[1] + '-' + p[0]; }
                                        const checkinISO = toISO(checkin);
                                        const checkoutISO = toISO(checkout);
                                        const discountCode = modalOverlay.querySelector('.mlb-discount-code') ? modalOverlay.querySelector('.mlb-discount-code').value : '';
                                        
                                        // If no hotel ID from data, prefer modal select, then form select, then hidden input
                                        if (!hotelId) {
                                            try {
                                                const modalSelect = modalOverlay.querySelector('.mlb-hotel-select');
                                                if (modalSelect && modalSelect.value) {
                                                    hotelId = modalSelect.value;
                                                }
                                            } catch (e) {}
                                            if (!hotelId) {
                                                const hotelSelect = $form.find('.mlb-hotel-select');
                                                if (hotelSelect.length) {
                                                    hotelId = hotelSelect.val();
                                                }
                                            }
                                            if (!hotelId) {
                                                const hiddenHotel = $form.find('input[name="hotel_id"]');
                                                if (hiddenHotel.length) {
                                                    hotelId = hiddenHotel.val();
                                                }
                                            }
                                        }
                                        
                                        if (hotelId && checkin && checkout) {
                                            // Build full booking engine URL with parameters
                                            let bookingUrl = 'https://bookingengine.mylighthouse.com/' + encodeURIComponent(hotelId) + '/Rooms/Select?';
                                            bookingUrl += 'Arrival=' + encodeURIComponent(checkinISO);
                                            bookingUrl += '&Departure=' + encodeURIComponent(checkoutISO);
                                            bookingUrl += '&Room=';
                                            if (discountCode) {
                                                bookingUrl += '&DiscountCode=' + encodeURIComponent(discountCode);
                                            }
                                            
                                            // Debug and redirect to booking engine
                                            try { console.debug('[MLB Redirect] navigating to', bookingUrl, { hotelId, checkinISO, checkoutISO, discountCode }); } catch(e) {}
                                            // Fallback: assign via location.replace to avoid some CSP/target issues
                                            try { window.location.href = bookingUrl; } catch (err) { try { window.location.replace(bookingUrl); } catch (e) { console.error('[MLB Redirect] redirect failed', e); } }
                                        } else {
                                            console.error('MLB: Missing required data for booking redirect', { hotelId, checkin, checkout });
                                        }
                                    } else if (hasRoomId) {
                                        // For room forms, redirect to booking engine URL with Room parameter
                                        let hotelId = $form.data('hotel-id') || $form.find('[name="hotel_id"]').val();
                                        // If modal select present, prefer that value for room-booking as well
                                        try {
                                            const modalSelect = modalOverlay.querySelector('.mlb-hotel-select');
                                            if ((!hotelId || hotelId === '') && modalSelect && modalSelect.value) {
                                                hotelId = modalSelect.value;
                                            }
                                        } catch (e) {}
                                        const checkin = $checkinHidden.val();
                                        const checkout = $checkoutHidden.val();
                                        const checkinISO = toISO(checkin);
                                        const checkoutISO = toISO(checkout);
                                        const discountCode = modalOverlay.querySelector('.mlb-discount-code') ? modalOverlay.querySelector('.mlb-discount-code').value : '';

                                        if (hotelId && checkinISO && checkoutISO) {
                                            // Build full booking engine URL with parameters
                                            let bookingUrl = 'https://bookingengine.mylighthouse.com/' + encodeURIComponent(hotelId) + '/Rooms/Select?';
                                            bookingUrl += 'Arrival=' + encodeURIComponent(checkinISO);
                                            bookingUrl += '&Departure=' + encodeURIComponent(checkoutISO);
                                            bookingUrl += '&Room=' + encodeURIComponent(hasRoomId);
                                            if (discountCode) {
                                                bookingUrl += '&DiscountCode=' + encodeURIComponent(discountCode);
                                            }
                                            try { console.debug('[MLB Redirect] navigating to', bookingUrl, { hotelId, checkinISO, checkoutISO, roomId: hasRoomId, discountCode }); } catch(e) {}
                                            try { window.location.href = bookingUrl; } catch (err) { try { window.location.replace(bookingUrl); } catch (e) { console.error('[MLB Redirect] redirect failed', e); } }
                                        } else {
                                            console.error('MLB: Missing required data for room booking redirect', { hotelId, checkin, checkout, roomId: hasRoomId });
                                        }
                                    }
                                } catch (e) {
                                    try { $form[0].dispatchEvent(new Event('mlb-submit')); } catch (err) {}
                                }
                                // Close modal after dispatch/submit
                                try { closeModal(); } catch (e) {}
                            });
                        }
                },
                lang: 'en-GB',
            };

            const picker = new CoreClass(pickerConfig);

                // Inject custom CSS into Shadow DOM
                setTimeout(function() {
                    const shadowHost = calendarDiv.querySelector('.container');
                    if (shadowHost && shadowHost.shadowRoot) {
                        const shadowRoot = shadowHost.shadowRoot;
                        const customStyle = document.createElement('style');
                        customStyle.textContent = `
                            .container.range-plugin .calendar > .days-grid > .day.start,
                            .container.range-plugin .calendar > .days-grid > .day.end {
                                background-color: ${calendarColors.startend_bg} !important;
                                color: ${calendarColors.startend_color} !important;
                            }
                            .container.range-plugin .calendar > .days-grid > .day.in-range {
                                background-color: ${calendarColors.inrange_bg} !important;
                            }
                            .container.range-plugin .calendar > .days-grid > .day.start::after,
                            .container.range-plugin .calendar > .days-grid > .day.end::after {
                                background-color: ${calendarColors.startend_bg} !important;
                            }
                        `;
                        shadowRoot.appendChild(customStyle);
                    }
                }, 100);

                $form.data('picker', picker);
                if ($daterangeInput && $daterangeInput.length) $daterangeInput.data('picker', picker);

            } catch (e) {
                console.error('[MLB Datepicker] Error during initialization:', e);
            }
        }

        initPicker();
    }

    // Expose initializer globally so modal dispatcher can call it and drain any queued calls
    try {
        try { console.debug('[MLB RoomForm] registering real initRoomModalDatePicker'); } catch (e) {}
        // If a shim queued calls, drain them after setting the real function
        window.initRoomModalDatePicker = initRoomModalDatePicker;
        if (window._mlb_initRoomModal_queue && window._mlb_initRoomModal_queue.length) {
            try { console.debug('[MLB RoomForm] draining queued init calls', window._mlb_initRoomModal_queue.length); } catch (e) {}
            while (window._mlb_initRoomModal_queue.length) {
                var q = window._mlb_initRoomModal_queue.shift();
                try { window.initRoomModalDatePicker(q); } catch (e) {}
            }
        }
    } catch (e) {}

    /**
     * Handle form submission
     */
    function handleFormSubmission($form) {
        const checkin = $form.find('.mlb-checkin').val();
        const checkout = $form.find('.mlb-checkout').val();
        const hotelId = $form.find('[name="hotel_id"]').val();

        $form[0].submit();
    }

    } // End of initWhenReady function
    
    // Start initialization
    initWhenReady();
    
})();

