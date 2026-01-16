<?php
/**
 * Room Modal Template
 *
 * This file provides a <template> that the frontend JS will clone to
 * render the modal-driven date picker for room booking forms.
 */

// Security
if (! defined('ABSPATH')) {
    exit;
}
?>

<template id="mlb-modal-template-room">
    <div class="mlb-calendar-modal-overlay" data-form-id="{{FORM_ID}}">
        <div class="mlb-calendar-modal-container">
            <button type="button" class="mlb-calendar-modal-close" aria-label="<?php echo esc_attr__( 'Close calendar', 'mylighthouse-booker' ); ?>">&times;</button>
            <div class="mlb-modal-content-wrapper">
                <div class="mlb-modal-calendar"></div>
                <div class="mlb-modal-right-column">
                    <div class="mlb-booking-details">
                        <h3><?php echo esc_html__( 'Booking Details', 'mylighthouse-booker' ); ?></h3>
                        <div class="mlb-booking-info">
                            <div class="mlb-info-row">
                                <span class="mlb-label"><?php echo esc_html__( 'Hotel:', 'mylighthouse-booker' ); ?></span>
                                <span class="mlb-hotel-name">Hotel Name</span>
                            </div>
                            <div class="mlb-info-row mlb-room-row" style="display:none;">
                                <span class="mlb-bed-icon" aria-hidden="true">
                                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false" aria-hidden="true">
                                        <path fill="currentColor" d="M21 10.5V8c0-1.1-.9-2-2-2H5C3.9 6 3 6.9 3 8v2.5H1v6h2v-2h18v2h2v-6h-2zM5 10V8h14v2H5z"/>
                                    </svg>
                                </span>
                                <span class="mlb-label"><?php echo esc_html__( 'Room:', 'mylighthouse-booker' ); ?></span>
                                <span class="mlb-room-name">Room Name</span>
                            </div>
                            <div class="mlb-info-row mlb-booking-period-row">
                                <span class="mlb-label"><?php echo esc_html__( 'Booking Period:', 'mylighthouse-booker' ); ?></span>
                                <span class="mlb-booking-period"><span class="mlb-arrival-date"><?php echo esc_html__( 'Select dates', 'mylighthouse-booker' ); ?></span> - <span class="mlb-departure-date"></span></span>
                            </div>
                        </div>
                        <div class="mlb-discount-code-wrapper">
                            <label for="mlb-discount-code" class="mlb-discount-code-label"><?php echo esc_html__( 'Discount Code', 'mylighthouse-booker' ); ?></label>
                            <input type="text" id="mlb-discount-code" class="mlb-discount-code" placeholder="<?php echo esc_attr__( 'Enter discount code', 'mylighthouse-booker' ); ?>" />
                        </div>
                            <div class="mlb-modal-actions">
                            <button type="button" class="mlb-modal-submit-btn" disabled>
                                <span class="mlb-modal-cta-room"><?php echo esc_html__( 'Book This Room', 'mylighthouse-booker' ); ?></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
