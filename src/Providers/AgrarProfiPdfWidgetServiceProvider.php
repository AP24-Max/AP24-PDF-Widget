<?php

namespace AgrarProfiPdfWidget\Providers;

use Plenty\Modules\ShopBuilder\Contracts\ContentWidgetRepositoryContract;
use Plenty\Plugin\ServiceProvider;
use AgrarProfiPdfWidget\Widgets\PdfDocumentsWidget;

class AgrarProfiPdfWidgetServiceProvider extends ServiceProvider
{
    /**
     * Register the ShopBuilder widget via the current ShopBuilder repository.
     * This is intentionally a pure ShopBuilder plugin: no Ceres container output,
     * no automatic frontend script outside of the widget.
     */
    public function boot(ContentWidgetRepositoryContract $widgetRepository)
    {
        $widgetRepository->registerWidget(PdfDocumentsWidget::class);
    }

    public function register()
    {
    }
}
