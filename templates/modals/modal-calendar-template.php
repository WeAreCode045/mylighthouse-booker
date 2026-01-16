<?php
/**
 * Modal calendar template used by JS (cloned via <template> element).
 * This template provides the DOM structure expected by `room-form.js`.
 */
if (! defined('ABSPATH')) {
    exit;
}
?>
<template id="mlb-modal-template-room">
    <div class="mlb-calendar-modal-overlay" style="display:none;">
        <div class="mlb-calendar-modal-container">
            <button type="button" class="mlb-calendar-modal-close" aria-label="<?php echo esc_attr__( 'Close calendar', 'mylighthouse-booker' ); ?>">&times;</button>

            <div class="mlb-modal-content-wrapper">
                <div class="mlb-modal-left-column">
                    <div class="mlb-modal-calendar">
                        <!-- easepick will be injected here; a hidden input will be appended by JS -->
                    </div>
                </div>

                <div class="mlb-modal-right-column">
                    <div class="mlb-booking-details">
                        <h3 class="mlb-booking-details-title"><?php echo esc_html__( 'Booking Details', 'mylighthouse-booker' ); ?></h3>
                        <div class="mlb-row mlb-hotel-row">
                            <label><?php echo esc_html__( 'Hotel:', 'mylighthouse-booker' ); ?></label>
                            <span class="mlb-hotel-name"></span>
                        </div>
                        <div class="mlb-row mlb-room-row" style="display:none;">
                            <label><?php echo esc_html__( 'Room:', 'mylighthouse-booker' ); ?></label>
                            <span class="mlb-room-name"></span>
                        </div>
                        <div class="mlb-row mlb-dates-row">
                            <label><?php echo esc_html__( 'Check-in:', 'mylighthouse-booker' ); ?></label>
                            <span class="mlb-arrival-date"></span>
                        </div>
                        <div class="mlb-row mlb-dates-row">
                            <label><?php echo esc_html__( 'Check-out:', 'mylighthouse-booker' ); ?></label>
                            <span class="mlb-departure-date"></span>
                        </div>
                        <div class="mlb-row mlb-discount-row">
                            <label for="mlb-discount-input"><?php echo esc_html__( 'Discount code', 'mylighthouse-booker' ); ?></label>
                            <input id="mlb-discount-input" class="mlb-discount-code" type="text" placeholder="" />
                        </div>
                        <div class="mlb-row mlb-ctas">
                            <button type="button" class="mlb-modal-submit-btn mlb-btn-primary">
                                <span class="mlb-modal-cta-room"><?php echo esc_html__( 'Check Availability', 'mylighthouse-booker' ); ?></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<?php
/**
 * Calendar Modal Template Wrapper (DEPRECATED)
 *
 * Modal markup consolidated into `modal-room.php`. This file kept as a
 * lightweight placeholder to avoid direct include errors.
 */
if (! defined('ABSPATH')) {
    exit;
}

// Deprecated: use templates/modals/modal-room.php instead.

