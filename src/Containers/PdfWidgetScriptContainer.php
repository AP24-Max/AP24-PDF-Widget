<?php

namespace AgrarProfiPdfWidget\Containers;

use Plenty\Plugin\Templates\Twig;

class PdfWidgetScriptContainer
{
    /**
     * @param Twig $twig
     * @return string
     */
    public function call(Twig $twig): string
    {
        return $twig->render('AgrarProfiPdfWidget::content.Script');
    }
}
