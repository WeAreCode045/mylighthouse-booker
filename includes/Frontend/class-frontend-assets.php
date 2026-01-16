<?php

/**
 * Frontend assets handler
 *
 * @package StandaloneTech
 */

if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

/**
 * Class Mylighthouse_Booker_Frontend_Assets
 */
class Mylighthouse_Booker_Frontend_Assets
{

	/**
	 * Constructor
	 */
	public function __construct()
	{
		add_action('wp_enqueue_scripts', array($this, 'enqueue_styles'));
		add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
		add_action('init', array($this, 'register_styles'));
	}

	/**
	 * Register styles early in the loading process
	 */
	public function register_styles()
	{
		// Register FontAwesome from CDN
		wp_register_style(
			'fontawesome',
			'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
			array(),
			'6.4.0',
			'all'
		);

		// Register EasePick CSS from local vendor directory with our custom modifications
		// Use file modification time for version to bust cache when we update the file
		$easepick_css_path = plugin_dir_path(MYLIGHTHOUSE_BOOKER_PLUGIN_FILE) . 'assets/vendor/easepick/easepick.css';
		$easepick_css_ver = (file_exists($easepick_css_path)) ? filemtime($easepick_css_path) : '1.2.1';
		wp_register_style(
			'easepick',
			plugins_url('assets/vendor/easepick/easepick.css', MYLIGHTHOUSE_BOOKER_PLUGIN_FILE),
			array(),
			$easepick_css_ver,
			'all'
		);

		// Register plugin styles
		wp_register_style(
			'mylighthouse-booker-frontend',
			plugins_url('/assets/css/frontend/booking-form.css', MYLIGHTHOUSE_BOOKER_PLUGIN_FILE),
			array('easepick'), // Depend on easepick CSS to load after it
			'1.0.0',
			'all'
		);

		// Register modal styles (keep lightweight, only enqueued when frontend is active)
		$modal_css_path = plugin_dir_path(MYLIGHTHOUSE_BOOKER_PLUGIN_FILE) . 'assets/css/frontend/modal.css';
		$modal_css_ver = (file_exists($modal_css_path)) ? filemtime($modal_css_path) : '1.0.0';
		wp_register_style(
			'mylighthouse-booker-modal',
			plugins_url('/assets/css/frontend/modal.css', MYLIGHTHOUSE_BOOKER_PLUGIN_FILE),
			array('mylighthouse-booker-frontend'),
			$modal_css_ver,
			'all'
		);

		// Modal stylesheet removed: modal UI is no longer part of the plugin's frontend.

	}

	/**
	 * Enqueue frontend styles
	 */
	public function enqueue_styles()
	{
		// Enqueue FontAwesome
		if (!wp_style_is('fontawesome', 'enqueued')) {
			wp_enqueue_style('fontawesome');
		}

		// Enqueue EasePick CSS first
		if (!wp_style_is('easepick', 'enqueued')) {
			wp_enqueue_style('easepick');
		}

		// Enqueue styles (booking-form.css depends on easepick)
		if (!wp_style_is('mylighthouse-booker-frontend', 'enqueued')) {
			wp_enqueue_style('mylighthouse-booker-frontend');
		}

		// Enqueue modal CSS when frontend styles are loaded so modal markup is styled
		if (!wp_style_is('mylighthouse-booker-modal', 'enqueued')) {
			wp_enqueue_style('mylighthouse-booker-modal');
		}

		// Modal styles are registered for legacy compatibility but are not enqueued
		// by default since the plugin now uses direct redirects and theme/Elementor
		// should provide the necessary layout. If a specific render path needs the
		// modal CSS it may enqueue it explicitly.

		// Styling is handled by the Elementor widget; do not read legacy DB option here.
		// Styling is managed by the theme/Elementor; no inline legacy styles are emitted.
	}

	/**
	 * Enqueue frontend scripts
	 */
	public function enqueue_scripts()
	{
		// Ensure jQuery is available (WordPress includes it by default)
		wp_enqueue_script('jquery');

		// Register EasePick datetime dependency first (in head for availability)
		wp_register_script(
			'easepick-datetime',
			'https://cdn.jsdelivr.net/npm/@easepick/datetime@1.2.1/dist/index.umd.js',
			array(),
			'1.2.1',
			false  // Load in head
		);

		// Register EasePick base plugin (depends on datetime)
		wp_register_script(
			'easepick-base-plugin',
			'https://cdn.jsdelivr.net/npm/@easepick/base-plugin@1.2.1/dist/index.umd.js',
			array('easepick-datetime'),
			'1.2.1',
			false  // Load in head
		);

		// Register EasePick core library from local vendor directory (depends on datetime and base-plugin)
		wp_register_script(
			'easepick-core',
			'https://cdn.jsdelivr.net/npm/@easepick/core@1.2.1/dist/index.umd.js',
			array('easepick-datetime', 'easepick-base-plugin'),
			'1.2.1',
			false  // Load in head to ensure availability before modal opens
		);

		// Register EasePick range plugin from local vendor (MUST load after core and base-plugin)
		wp_register_script(
			'easepick-range',
			'https://cdn.jsdelivr.net/npm/@easepick/range-plugin@1.2.1/dist/index.umd.js',
			array('easepick-datetime', 'easepick-base-plugin', 'easepick-core'),
			'1.2.1',
			false  // Load in head
		);

		// Register EasePick lock plugin (depends on core and base-plugin)
		wp_register_script(
			'easepick-lock',
			'https://cdn.jsdelivr.net/npm/@easepick/lock-plugin@1.2.1/dist/index.umd.min.js',
			array('easepick-datetime', 'easepick-base-plugin', 'easepick-core'),
			'1.2.1',
			false  // Load in head for consistency
		);

		// Register EasePick wrapper (depends on all plugins)
		wp_register_script(
			'easepick-wrapper',
			plugins_url('/assets/vendor/easepick/easepick-wrapper.js', MYLIGHTHOUSE_BOOKER_PLUGIN_FILE),
			array('easepick-datetime', 'easepick-base-plugin', 'easepick-core', 'easepick-range', 'easepick-lock'),
			'1.0.0',
			false  // Load in head to ensure it's ready
		);

        // Use file modification times for script versions to help bust caches when files change.
		// Per-file frontend script registrations removed — provided by consolidated bundle.
		// The consolidated bundle is registered below; legacy shim handles map old handles
		// to the consolidated bundle so external code can continue enqueuing old names.

		// Register consolidated frontend bundles: widget and picker
		// Point widget/picker handles to the consolidated bundle to avoid serving
		// multiple per-file scripts. This keeps legacy handles intact while
		// ensuring the single-file bundle is served.
		$consolidated_path_early = plugin_dir_path(MYLIGHTHOUSE_BOOKER_PLUGIN_FILE) . 'assets/js/frontend/mylighthouse-booker-frontend.js';
		$consolidated_ver_early = (file_exists($consolidated_path_early)) ? filemtime($consolidated_path_early) : '1.0.0';
		wp_register_script(
			'mylighthouse-booker-frontend-widget',
			plugins_url('/assets/js/frontend/mylighthouse-booker-frontend.js', MYLIGHTHOUSE_BOOKER_PLUGIN_FILE),
			array('jquery', 'wp-i18n'),
			$consolidated_ver_early,
			true
		);
		if ( function_exists( 'wp_set_script_translations' ) ) {
			wp_set_script_translations( 'mylighthouse-booker-frontend-widget', 'mylighthouse-booker', plugin_dir_path(MYLIGHTHOUSE_BOOKER_PLUGIN_FILE) . 'languages' );
		}

		wp_register_script(
			'mylighthouse-booker-frontend-picker',
			plugins_url('/assets/js/frontend/mylighthouse-booker-frontend.js', MYLIGHTHOUSE_BOOKER_PLUGIN_FILE),
			array('easepick-wrapper', 'mylighthouse-booker-frontend-widget'),
			$consolidated_ver_early,
			true
		);

		// Specials feature removed: `special-form` script registration omitted.

		// Note: per-file frontend registrations (booking-modal, form, booking-form,
		// room-booking, room-form) are provided by the consolidated bundle and
		// therefore not registered individually here. iframe.js and spinner.js
		// were removed earlier and are intentionally not registered.

		// Specials feature removed: `special-booking` script registration omitted.

		// Fallback modal trigger script: ensures elements with `data-trigger-modal` open the modal
		$modal_trigger_path = plugin_dir_path(MYLIGHTHOUSE_BOOKER_PLUGIN_FILE) . 'assets/js/frontend/modal-trigger-fallback.js';
		$modal_trigger_ver = (file_exists($modal_trigger_path)) ? filemtime($modal_trigger_path) : '1.0.0';
		wp_register_script(
			'mylighthouse-booker-modal-trigger',
			plugins_url('/assets/js/frontend/modal-trigger-fallback.js', MYLIGHTHOUSE_BOOKER_PLUGIN_FILE),
			array(),
			$modal_trigger_ver,
			true
		);

		// Enqueue the fallback so trigger buttons work even if other front-end form scripts aren't present
		// Note: modal trigger script is registered here but will be enqueued
		// only when a form/render path requires it (Elementor widget or shortcode).

		// Do not enqueue the legacy alias handles here. We register `mylighthouse-booker-frontend-widget`
		// and `mylighthouse-booker-frontend-picker` as compatibility aliases that point at the
		// consolidated bundle; only the consolidated bundle is enqueued below.

		// Register and enqueue the consolidated single-file frontend bundle.
		$consolidated_path = plugin_dir_path(MYLIGHTHOUSE_BOOKER_PLUGIN_FILE) . 'assets/js/frontend/mylighthouse-booker-frontend.js';
		$consolidated_ver = (file_exists($consolidated_path)) ? filemtime($consolidated_path) : '1.0.0';
		wp_register_script(
			'mylighthouse-booker-frontend',
			plugins_url('/assets/js/frontend/mylighthouse-booker-frontend.js', MYLIGHTHOUSE_BOOKER_PLUGIN_FILE),
			array('jquery', 'wp-i18n', 'easepick-wrapper'),
			$consolidated_ver,
			true
		);
		if ( function_exists( 'wp_set_script_translations' ) ) {
			wp_set_script_translations( 'mylighthouse-booker-frontend', 'mylighthouse-booker', plugin_dir_path(MYLIGHTHOUSE_BOOKER_PLUGIN_FILE) . 'languages' );
		}
		if ( ! wp_script_is( 'mylighthouse-booker-frontend', 'enqueued' ) ) {
			wp_enqueue_script( 'mylighthouse-booker-frontend' );
		}

		// Ensure modal trigger shim is enqueued with the consolidated frontend so
		// clicks on `[data-trigger-modal]` work on all render paths.
		if ( ! wp_script_is( 'mylighthouse-booker-modal-trigger', 'enqueued' ) ) {
			wp_enqueue_script( 'mylighthouse-booker-modal-trigger' );
		}

		// Backwards-compatibility shim registrations: allow external code to enqueue old handles
		// without breaking; they will depend on the consolidated bundle.
		// Backwards-compatibility shim registrations: allow external code to enqueue old handles
		// without breaking; they will depend on the new bundles.
		// Backwards-compatibility shim registrations: old handles map to the consolidated bundle.
		wp_register_script( 'mylighthouse-booker-booking-modal', '', array( 'mylighthouse-booker-frontend' ) );
		wp_register_script( 'mylighthouse-booker-booking-form', '', array( 'mylighthouse-booker-frontend' ) );
		wp_register_script( 'mylighthouse-booker-form', '', array( 'mylighthouse-booker-frontend' ) );
		// Register actual room-form implementation so modal initializer is available
		$room_form_path = plugin_dir_path(MYLIGHTHOUSE_BOOKER_PLUGIN_FILE) . 'assets/js/frontend/room-form.js';
		$room_form_ver = (file_exists($room_form_path)) ? filemtime($room_form_path) : '1.0.0';
		wp_register_script(
			'mylighthouse-booker-room-form',
			plugins_url('/assets/js/frontend/room-form.js', MYLIGHTHOUSE_BOOKER_PLUGIN_FILE),
			array('jquery', 'mylighthouse-booker-frontend'),
			$room_form_ver,
			true
		);
		wp_register_script( 'mylighthouse-booker-room-booking', '', array( 'mylighthouse-booker-frontend' ) );

		// If the consolidated frontend bundle is enqueued, also enqueue room-form
		if ( wp_script_is( 'mylighthouse-booker-frontend', 'enqueued' ) && ! wp_script_is( 'mylighthouse-booker-room-form', 'enqueued' ) ) {
			wp_enqueue_script( 'mylighthouse-booker-room-form' );
		}


	}

	// Legacy generate_styles removed; styling should be handled by Elementor/theme.
}
