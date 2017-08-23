<?php

namespace VisualComposer\Modules\Assets;

if (!defined('ABSPATH')) {
    header('Status: 403 Forbidden');
    header('HTTP/1.1 403 Forbidden');
    exit;
}

use VisualComposer\Framework\Container;
use VisualComposer\Framework\Illuminate\Support\Module;
use VisualComposer\Helpers\Traits\EventsFilters;
use VisualComposer\Helpers\Traits\WpFiltersActions;
use VisualComposer\Helpers\Url;

class VendorBundleController extends Container implements Module
{
    use EventsFilters;
    use WpFiltersActions;

    public function __construct()
    {
        /** @see \VisualComposer\Modules\Assets\VendorBundleController::addVendorScript */
        $this->addFilter(
            'vcv:backend:extraOutput vcv:frontend:head:extraOutput vcv:frontend:update:head:extraOutput',
            'addVendorScript',
            1
        );

        $this->wpAddAction('admin_init', 'registerVendorScripts');
        $this->wpAddAction('init', 'registerVendorScripts');
        $this->wpAddAction('wp_enqueue_scripts', 'enqueueVendorFrontScripts', 1);
    }

    protected function registerVendorScripts(Url $urlHelper)
    {
        wp_register_script(
            'vcv:assets:vendor:script',
            vcvenv('VCV_ENV_EXTENSION_DOWNLOAD___!!!!')
                ?
                content_url() . '/' . VCV_PLUGIN_ASSETS_DIRNAME . '/editor/vendor.bundle.js'
                :
                $urlHelper->to(
                    'public/dist/vendor.bundle.js'
                ),
            [
                'jquery',
            ],
            VCV_VERSION
        );
        wp_register_script(
            'vcv:assets:front:script',
            vcvenv('VCV_ENV_EXTENSION_DOWNLOAD')
                ?
                content_url() . '/' . VCV_PLUGIN_ASSETS_DIRNAME . '/editor/front.bundle.js'
                :
                $urlHelper->to(
                    'public/dist/front.bundle.js'
                ),
            [
                'vcv:assets:vendor:script',
            ],
            VCV_VERSION
        );
    }

    protected function addVendorScript($response, $payload, Url $urlHelper)
    {
        // Add Vendor JS
        $response = array_merge(
            (array)$response,
            [
                sprintf(
                    '<script id="vcv-script-vendor-bundle" type="text/javascript" src="%s"></script>',
                    vcvenv('VCV_ENV_EXTENSION_DOWNLOAD___!!!')
                        ?
                        content_url() . '/' . VCV_PLUGIN_ASSETS_DIRNAME . '/editor/vendor.bundle.js?v=' . VCV_VERSION
                        :
                        $urlHelper->to(
                            'public/dist/vendor.bundle.js?v=' . VCV_VERSION
                        )
                ),
            ]
        );

        return $response;
    }

    protected function enqueueVendorFrontScripts()
    {
        wp_enqueue_script('jquery'); // Required for 3-rd elements libraries
        wp_enqueue_script('vcv:assets:vendor:script');
        wp_enqueue_script('vcv:assets:front:script');
    }
}
