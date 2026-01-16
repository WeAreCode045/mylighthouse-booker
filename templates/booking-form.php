<?php

/**
 * Booking form template
 *
 * @package StandaloneTech
 */

if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

// Extract variables
$hotels            = isset($args['hotels']) ? $args['hotels'] : array();
$show_hotel_select = isset($args['show_hotel_select']) ? $args['show_hotel_select'] : false;
$default_hotel_id  = isset($args['default_hotel_id']) ? $args['default_hotel_id'] : '';
$button_label      = isset($args['button_label']) ? $args['button_label'] : __('Check Availability', 'mylighthouse-booker');
$layout            = isset($args['layout']) ? $args['layout'] : 'inline';
$placement         = isset($args['placement']) ? $args['placement'] : 'after';
$room_id           = isset($args['room_id']) ? $args['room_id'] : '';
$room_name         = isset($args['room_name']) ? $args['room_name'] : '';
$hotel_name        = isset($args['hotel_name']) ? $args['hotel_name'] : '';
$hotel_placeholder = isset($args['hotel_placeholder']) ? $args['hotel_placeholder'] : __('Choose a hotel...', 'mylighthouse-booker');
$daterange_placeholder = isset($args['daterange_placeholder']) ? $args['daterange_placeholder'] : __('Select Arrival Date ⇢ Select Departure Date', 'mylighthouse-booker');
$show_date_picker  = isset($args['show_date_picker']) ? $args['show_date_picker'] : true;
$form_type         = isset($args['form_type']) ? $args['form_type'] : 'hotel';

// Determine if this is a room-specific form
$is_room_form = !empty($room_id) || $form_type === 'room';

// Generate unique form ID to support multiple forms on the same page
static $form_instance_counter = 0;
$form_instance_counter++;
$form_uid = 'mlb-form-' . $form_instance_counter;
?>

<?php
// Decide which partial to render. Available partials:
// - booking-form-hotel.php
// - booking-form-room.php

$partial = 'booking-form-hotel.php';
if ($form_type === 'room' || ! empty($room_id)) {
	$partial = 'booking-form-room.php';
}

include __DIR__ . '/' . $partial;

// Modal templates removed: UI fragments and modal wrappers are deprecated.
// The consolidated frontend bundle provides inline date-picker and
// no-op shims for legacy modal triggers to preserve backwards compatibility.

// Ensure the modal template is available for JS to clone when needed
if ( file_exists( __DIR__ . '/modals/modal-calendar-template.php' ) ) {
	include __DIR__ . '/modals/modal-calendar-template.php';
}
