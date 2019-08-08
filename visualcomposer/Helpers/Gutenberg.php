<?php

namespace VisualComposer\Helpers;

if (!defined('ABSPATH')) {
    header('Status: 403 Forbidden');
    header('HTTP/1.1 403 Forbidden');
    exit;
}

use VisualComposer\Framework\Illuminate\Support\Helper;

class Gutenberg implements Helper
{
    public function isGutenbergEnabled()
    {
        $optionsHelper = vchelper('Options');
        $requestHelper = vchelper('Request');
        $settings = $optionsHelper->get('settings', ['gutenberg-editor']);
        $screen = get_current_screen();

        $available = false;
        if ((!empty($settings) && in_array('gutenberg-editor', $settings) || empty($settings))
            && (method_exists($screen, 'is_block_editor')
                && $screen->is_block_editor())
            && !$requestHelper->exists('classic-editor')
        ) {
            $available = true;
        }

        return $available;
    }
}
