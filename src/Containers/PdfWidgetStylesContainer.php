<?php

namespace AgrarProfiPdfWidget\Containers;

use Plenty\Plugin\Templates\Twig;

class PdfWidgetStylesContainer
{
    /**
     * @param Twig $twig
     * @return string
     */
    public function call(Twig $twig): string
    {
        return $twig->render('AgrarProfiPdfWidget::content.Styles');
    }
}
