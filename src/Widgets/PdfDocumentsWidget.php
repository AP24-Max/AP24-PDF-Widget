<?php

namespace AgrarProfiPdfWidget\Widgets;

use Ceres\Widgets\Helper\BaseWidget;

class PdfDocumentsWidget extends BaseWidget
{
    /**
     * @var string
     */
    protected $template = "AgrarProfiPdfWidget::Widgets.PdfDocumentsWidget";

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
