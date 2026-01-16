<?php
if ( ! defined( 'ABSPATH' ) ) exit;
class Mylighthouse_Booker_Admin_Settings {
    /**
     * Render a lightweight settings fragment for the dashboard loader.
     * The wrapper class matches the fragment extractor mapping: `mlb-admin-sections`.
     */
    public function render_page() {
        $sub = isset($_GET['content']) ? sanitize_text_field($_GET['content']) : '';
        if (strpos($sub, 'settings-') === 0) {
            $sub = substr($sub, strlen('settings-')) ?: 'general';
        } else {
            $sub = 'general';
        }
        ?>
        <div class="mlb-admin-sections">
            <div class="mlb-section-card">
                <nav class="mlb-settings-subnav">
                    <button type="button" class="mlb-subnav-link active" data-content="settings-general"><?php esc_html_e('General', 'mylighthouse-booker'); ?></button>
                </nav>

                <h2 class="mlb-section-title"><?php esc_html_e('General Settings', 'mylighthouse-booker'); ?></h2>
                <p><?php esc_html_e('Configure plugin options here.', 'mylighthouse-booker'); ?></p>
                <?php
                // Legacy frontend display settings removed — no options required here.
                ?>
                <form method="post" action="<?php echo esc_url(admin_url('admin.php')); ?>">
                    <?php if ($sub === 'general') : ?>
                        <?php wp_nonce_field('mlb_save_admin_settings', 'mlb_admin_settings_nonce'); ?>
                        <input type="hidden" name="action" value="mlb_save_admin_settings" />

                        <table class="form-table">
                            <tr>
                                <td>
                                    <p class="description"><?php esc_html_e('Frontend display options (booking page, modal, spinner) have been removed — the plugin now always uses direct booking-engine redirects.', 'mylighthouse-booker'); ?></p>
                                </td>
                            </tr>
                        </table>

                        <p><button class="mlb-btn mlb-btn-primary" type="submit"><?php esc_html_e('Save General Settings', 'mylighthouse-booker'); ?></button></p>
                    <?php endif; ?>
                </form>
            </div>
        </div>
        <?php
    }
}
?>