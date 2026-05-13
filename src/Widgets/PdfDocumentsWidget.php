<?php

namespace AgrarProfiPdfWidget\Widgets;

use Ceres\Widgets\Helper\BaseWidget;
use Ceres\Widgets\Helper\Factories\WidgetDataFactory;
use Ceres\Widgets\Helper\WidgetTypes;

class PdfDocumentsWidget extends BaseWidget
{
    /**
     * @var string
     */
    protected $template = "AgrarProfiPdfWidget::Widgets.PdfDocumentsWidget";

    /**
     * Widget metadata for the current ShopBuilder registration mechanism.
     * The contentWidgets.json is kept as compatibility fallback for older systems.
     *
     * @return array
     */
    public function getData()
    {
        return WidgetDataFactory::make("AgrarProfiPdfWidget::PdfDocumentsWidget")
            ->withLabel("Widget.pdfDocumentsLabel")
            ->withPreviewImageUrl("/images/pdf-widget.svg")
            ->withType(WidgetTypes::STATIC)
            ->withCategory("item")
            ->withPosition(1150)
            ->toArray();
    }

    /**
     * No per-widget settings are required. The property IDs are configured in the plugin config.
     *
     * @return array
     */
    public function getSettings()
    {
        return [];
    }

    /**
     * @param array $widgetSettings
     * @param bool $isPreview
     * @return array
     */
    protected function getTemplateData($widgetSettings, $isPreview)
    {
        return [
            "isPreview" => $isPreview
        ];
    }
}
